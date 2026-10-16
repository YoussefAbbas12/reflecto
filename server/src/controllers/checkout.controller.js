const { pool } = require('../config/database');
const axios = require('axios');
const crypto = require('crypto');
const { awardPurchasePoints } = require('./loyalty.controller');

const TABBY_BASE_URL = (process.env.TABBY_BASE_URL || 'https://api.tabby.ai').trim().replace(/\/+$/, '');
const TAMARA_BASE_URL = (process.env.TAMARA_BASE_URL || 'https://api.tamara.co').trim().replace(/\/+$/, '');

async function getOrCreateUserFromCustomer(reqUser, customer) {
  let userId = reqUser?.id || null;
  let userAuthData = null;

  if (userId) {
    if (customer) {
      const fullName = customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
      const email = customer.email || null;
      const city = customer.city || null;
      const address = customer.address || null;

      await pool.query(
        `UPDATE users SET
           full_name = COALESCE(NULLIF(full_name, ''), NULLIF(?, '')),
           email = COALESCE(NULLIF(email, ''), NULLIF(?, '')),
           city = COALESCE(NULLIF(city, ''), NULLIF(?, '')),
           address = COALESCE(NULLIF(address, ''), NULLIF(?, ''))
         WHERE id = ?`,
        [fullName, email, city, address, userId]
      );
    }
  } else if (customer?.phone) {
    const rawPhone = customer.phone.replace(/[\s\-().]+/g, '');
    const fullName = customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Client';
    const email = customer.email || null;
    const city = customer.city || null;
    const address = customer.address || null;

    const [[existing]] = await pool.query(
      'SELECT id, uuid, phone, full_name, email, role FROM users WHERE phone = ?',
      [rawPhone]
    );

    if (existing) {
      userId = existing.id;
      await pool.query(
        'UPDATE users SET full_name = COALESCE(NULLIF(full_name, \'\'), ?), email = COALESCE(NULLIF(email, \'\'), ?), city = COALESCE(NULLIF(city, \'\'), ?), address = COALESCE(NULLIF(address, \'\'), ?) WHERE id = ?',
        [fullName, email, city, address, userId]
      );
      userAuthData = { id: existing.uuid, phone: existing.phone, full_name: existing.full_name || fullName, email: existing.email || email, role: existing.role };
    } else {
      const bcrypt = require('bcryptjs');
      const defaultPassword = await bcrypt.hash('00000', 10);
      const [newResult] = await pool.query(
        `INSERT INTO users (uuid, phone, full_name, email, city, address, password, role, is_active)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'client', 1)`,
        [rawPhone, fullName, email, city, address, defaultPassword]
      );
      userId = newResult.insertId;
      await pool.query('INSERT IGNORE INTO loyalty_points (client_id, total_points) VALUES (?, 0)', [userId]);
      const [[created]] = await pool.query('SELECT uuid, phone, full_name, email, role FROM users WHERE id = ?', [userId]);
      userAuthData = { id: created.uuid, phone: created.phone, full_name: created.full_name, email: created.email, role: created.role };
    }

    const jwt = require('jsonwebtoken');
    const accessToken = jwt.sign({ userId: userAuthData.id, role: userAuthData.role }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: userAuthData.id }, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', { expiresIn: '30d' });
    userAuthData.access_token = accessToken;
    userAuthData.refresh_token = refreshToken;
  }

  return { userId, userAuthData };
}

async function getOrCreateVehicleForUser(userId, vehicleIdUuid, vehicleData) {
  let vehicleId = null;

  if (vehicleIdUuid && vehicleIdUuid !== 'custom') {
    const [[v]] = await pool.query('SELECT id FROM vehicles WHERE uuid = ? AND client_id = ?', [vehicleIdUuid, userId]);
    if (v) vehicleId = v.id;
  }

  const vData = vehicleData || {};
  if (!vehicleId && (vData.brand || vData.model)) {
    const [newV] = await pool.query(
      `INSERT INTO vehicles (client_id, brand, model, year, color, plate, uuid)
       VALUES (?, ?, ?, ?, ?, ?, UUID())`,
      [userId, vData.brand || 'Vehicle', vData.model || 'Model', vData.year || 2024, vData.color || null, vData.plate_number || null]
    );
    vehicleId = newV.insertId;
  }

  if (!vehicleId) {
    const [[v]] = await pool.query('SELECT id FROM vehicles WHERE client_id = ? ORDER BY id DESC LIMIT 1', [userId]);
    if (v) {
      vehicleId = v.id;
    } else {
      const [newV] = await pool.query(
        `INSERT INTO vehicles (client_id, brand, model, year, uuid)
         VALUES (?, 'Porsche', '911 GT3 RS', 2024, UUID())`,
        [userId]
      );
      vehicleId = newV.insertId;
    }
  }

  return vehicleId;
}

async function consumeCouponIfAny(coupon_code) {
  if (coupon_code) {
    const cleanCode = coupon_code.trim().toUpperCase();
    await pool.query('UPDATE coupons SET current_uses = current_uses + 1, is_active = IF(current_uses + 1 >= max_uses, 0, is_active) WHERE code = ?', [cleanCode]);
    await pool.query('DELETE FROM coupons WHERE code = ? AND max_uses = 1', [cleanCode]);
  }
}

async function handleWorkOrderPaymentIfAny(reqBody, userId, paidAmount) {
  const targetId = reqBody.work_order_id || reqBody.work_order_number;
  const isFlagged = Boolean(reqBody.is_work_order_payment);

  if (!targetId && !isFlagged) return false;

  let wo = null;

  // 1. Direct query by uuid, id, or work_order_number
  if (targetId) {
    const [[foundWo]] = await pool.query(
      'SELECT id, work_order_number, total_amount, paid_amount, payment_method, order_date, partial_payments FROM work_orders WHERE uuid = ? OR id = ? OR work_order_number = ?',
      [targetId, targetId, targetId]
    );
    wo = foundWo;
  }

  // 2. Check if targetId is an appointment UUID with WO- number in notes
  if (!wo && targetId) {
    const [[appt]] = await pool.query(
      'SELECT notes FROM appointments WHERE uuid = ? OR id = ?',
      [targetId, targetId]
    );
    if (appt && appt.notes) {
      const match = appt.notes.match(/WO-\d+/i);
      if (match) {
        const [[foundByNum]] = await pool.query(
          'SELECT id, work_order_number, total_amount, paid_amount, payment_method, order_date, partial_payments FROM work_orders WHERE work_order_number = ?',
          [match[0]]
        );
        wo = foundByNum;
      }
    }
  }

  // 3. Fallback search by user phone for any active work order with remaining_amount > 0
  if (!wo && userId) {
    const [[u]] = await pool.query('SELECT phone FROM users WHERE id = ?', [userId]);
    if (u && u.phone) {
      const cleanPhone = String(u.phone).replace(/\D/g, '').slice(-9);
      if (cleanPhone) {
        const [[foundByPhone]] = await pool.query(
          'SELECT id, work_order_number, total_amount, paid_amount, payment_method, order_date, partial_payments FROM work_orders WHERE client_phone LIKE ? AND remaining_amount > 0 ORDER BY id DESC LIMIT 1',
          [`%${cleanPhone}%`]
        );
        wo = foundByPhone;
      }
    }
  }

  if (!wo) return false;

  // Calculate new paid & remaining amount
  const currentTotal = parseFloat(wo.total_amount || 0);
  const currentPaid = parseFloat(wo.paid_amount || 0);
  const addAmount = parseFloat(paidAmount || 0);
  const newPaid = currentPaid + addAmount;
  const newRemaining = Math.max(0, currentTotal - newPaid);
  const newStatus = wo.status || 'in_progress';

  let history = [];
  if (wo.partial_payments) {
    try {
      history = typeof wo.partial_payments === 'string' ? JSON.parse(wo.partial_payments) : wo.partial_payments;
    } catch (e) { history = []; }
  }
  if (!Array.isArray(history)) history = [];

  // If history is empty but there was a previous paid_amount, record initial payment entry
  if (history.length === 0 && currentPaid > 0) {
    history.push({
      amount: currentPaid,
      payment_method: wo.payment_method || 'دفعة سابقة بالفرع (Mada)',
      paid_at: wo.order_date || new Date().toISOString(),
    });
  }

  // Add current payment entry
  const methodLabel = reqBody.payment_method || (reqBody.payment_method_type ? String(reqBody.payment_method_type) : 'دفع إلكتروني (Online)');
  history.push({
    amount: addAmount,
    payment_method: methodLabel,
    paid_at: new Date().toISOString(),
  });

  // Update work order in DB
  await pool.query(
    'UPDATE work_orders SET paid_amount = ?, remaining_amount = ?, status = ?, partial_payments = ? WHERE id = ?',
    [newPaid, newRemaining, newStatus, JSON.stringify(history), wo.id]
  );

  // Update synced appointment price in DB
  if (userId) {
    await pool.query(
      'UPDATE appointments SET price = ? WHERE (notes LIKE ? OR notes LIKE ?) AND client_id = ?',
      [currentTotal, `%${wo.work_order_number}%`, `%${wo.id}%`, userId]
    );
  }

  return true;
}

async function createTabbySession(req, res) {
  const { amount, currency = 'SAR', items = [], customer, appointment_data, coupon_code } = req.body;
  const tabbySecret = (process.env.TABBY_SECRET_KEY || '').trim();
  const tabbyMerchant = (process.env.TABBY_MERCHANT_CODE || '').trim();

  if (!tabbySecret || !tabbyMerchant) {
    return res.status(500).json({
      success: false,
      error: { code: 'CONFIG_ERROR', message: 'Tabby credentials not configured' }
    });
  }

  if (!items.length || !customer?.phone) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Missing required fields (phone, items)' }
    });
  }

  const orderId = `ORD-${Date.now()}`;
  const paymentUuid = crypto.randomUUID();

  try {
    const { userId, userAuthData } = await getOrCreateUserFromCustomer(req.user, customer);
    await consumeCouponIfAny(coupon_code);

    const isWorkOrderPayment = Boolean(req.body.is_work_order_payment || req.body.work_order_id);

    const [payResult] = await pool.query(
      `INSERT INTO payments (uuid, user_id, amount, currency, payment_method, status, created_at)
       VALUES (?, ?, ?, ?, 'tabby', 'initiated', NOW())`,
      [paymentUuid, userId, amount, currency]
    );

    let appointmentUuid = null;
    if (userId && !isWorkOrderPayment) {
      const data = appointment_data || {};
      const vehicleId = await getOrCreateVehicleForUser(userId, data.vehicle_id, data.vehicle);

      let serviceId = null;
      let tierId = null;

      if (data.pricing_tier_id) {
        const [[tier]] = await pool.query('SELECT id, service_id FROM pricing_tiers WHERE uuid = ?', [data.pricing_tier_id]);
        if (tier) { tierId = tier.id; serviceId = tier.service_id; }
      }
      if (!serviceId && data.service_id) {
        const [[s]] = await pool.query('SELECT id FROM services WHERE uuid = ?', [data.service_id]);
        if (s) serviceId = s.id;
      }
      if (!serviceId) {
        const [[s]] = await pool.query('SELECT id FROM services ORDER BY id ASC LIMIT 1');
        if (s) serviceId = s.id;
      }

      if (vehicleId && serviceId) {
        const [apptResult] = await pool.query(
          `INSERT INTO appointments (client_id, vehicle_id, service_id, pricing_tier_id, preferred_date, price, currency, notes, status, uuid)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', UUID())`,
          [userId, vehicleId, serviceId, tierId, data.preferred_date || new Date().toISOString().split('T')[0], amount, currency, data.notes || (items[0] ? `Package: ${items[0].title || items[0].name}` : 'Tabby Order')]
        );

        const apptId = apptResult.insertId;
        const [[newAppt]] = await pool.query('SELECT uuid FROM appointments WHERE id = ?', [apptId]);
        appointmentUuid = newAppt.uuid;

        await pool.query(
          `UPDATE payments SET appointment_id = ? WHERE uuid = ?`,
          [apptId, paymentUuid]
        );
      }
    }

    const payload = {
      payment: {
        amount: amount.toString(),
        currency: currency,
        description: `Order ${orderId}`,
        buyer: {
          phone: customer.phone,
          email: customer.email,
          name: customer.name || 'N/A',
          dob: customer.dob || '1990-01-01'
        },
        shipping_address: {
          city: customer.city || 'Riyadh',
          address: customer.address || 'N/A',
          zip: customer.zip || '11564'
        },
        order: {
          reference_id: orderId,
          items: items.map((item, idx) => ({
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price.toString(),
            category: item.category || 'General',
            reference_id: item.reference_id || `ITEM-${idx}`,
            discount_amount: "0.00",
            image_url: item.image_url,
            product_url: item.product_url
          })),
          tax_amount: "0.00",
          shipping_amount: "0.00",
          discount_amount: "0.00"
        },
        buyer_history: {
          registered_since: new Date().toISOString(),
          loyalty_level: 0
        }
      },
      lang: 'ar',
      merchant_code: process.env.TABBY_MERCHANT_CODE,
      merchant_urls: {
        success: `${(process.env.BASE_URL || 'https://reflecto.com.sa').replace(/\/+$/, '')}/checkout/success`,
        cancel: `${(process.env.BASE_URL || 'https://reflecto.com.sa').replace(/\/+$/, '')}/checkout/cancel`,
        failure: `${(process.env.BASE_URL || 'https://reflecto.com.sa').replace(/\/+$/, '')}/checkout/cancel`
      }
    };

    const response = await axios.post(
      `${TABBY_BASE_URL}/api/v2/checkout`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.TABBY_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const sessionId = response.data?.payment?.id;
    const installments = response.data?.configuration?.available_products?.installments;
    const payLater = response.data?.configuration?.available_products?.pay_later;
    const monthlyBilling = response.data?.configuration?.available_products?.monthly_billing;

    const checkoutUrl = installments?.[0]?.web_url || payLater?.[0]?.web_url || monthlyBilling?.[0]?.web_url;

    if (!checkoutUrl) {
      const reason = response.data?.configuration?.products?.installments?.rejection_reason || 'Product not available for this purchase amount or customer';
      return res.status(400).json({
        success: false,
        error: {
          code: 'TABBY_REJECTED',
          message: `طريقة الدفع عبر تابي غير متاحة لهذا المبلغ أو الرقم: ${reason}`
        }
      });
    }

    await pool.query(
      `UPDATE payments SET session_id = ?, status = 'pending' WHERE uuid = ?`,
      [sessionId, paymentUuid]
    );

    res.json({
      success: true,
      data: {
        paymentId: paymentUuid,
        appointmentId: appointmentUuid,
        sessionId: sessionId,
        checkoutUrl: checkoutUrl,
        auth: userAuthData
      }
    });

  } catch (error) {
    console.error('Tabby API Error:', error.response?.data || error.message);
    await pool.query(`UPDATE payments SET status = 'failed' WHERE uuid = ?`, [paymentUuid]);

    res.status(500).json({
      success: false,
      error: {
        code: 'TABBY_API_ERROR',
        message: error.response?.data?.message || 'Failed to create Tabby session',
        details: error.response?.data
      }
    });
  }
}

async function createTamaraSession(req, res) {
  const { total_amount, currency = 'SAR', items = [], customer, appointment_data, coupon_code } = req.body;
  const tamaraToken = (process.env.TAMARA_BEARER_TOKEN || '').trim();

  if (!tamaraToken) {
    return res.status(500).json({
      success: false,
      error: { code: 'CONFIG_ERROR', message: 'Tamara token not configured' }
    });
  }

  const orderReferenceId = `ORD-${Date.now()}`;
  const paymentUuid = crypto.randomUUID();

  try {
    const { userId, userAuthData } = await getOrCreateUserFromCustomer(req.user, customer);
    await consumeCouponIfAny(coupon_code);

    const isWorkOrderPayment = Boolean(req.body.is_work_order_payment || req.body.work_order_id);

    const [payResult] = await pool.query(
      `INSERT INTO payments (uuid, user_id, amount, currency, payment_method, status, created_at)
       VALUES (?, ?, ?, ?, 'tamara', 'initiated', NOW())`,
      [paymentUuid, userId, total_amount, currency]
    );

    let appointmentUuid = null;
    if (userId && !isWorkOrderPayment) {
      const data = appointment_data || {};
      const vehicleId = await getOrCreateVehicleForUser(userId, data.vehicle_id, data.vehicle);

      let serviceId = null;
      let tierId = null;

      if (data.pricing_tier_id) {
        const [[tier]] = await pool.query('SELECT id, service_id FROM pricing_tiers WHERE uuid = ?', [data.pricing_tier_id]);
        if (tier) { tierId = tier.id; serviceId = tier.service_id; }
      }
      if (!serviceId && data.service_id) {
        const [[s]] = await pool.query('SELECT id FROM services WHERE uuid = ?', [data.service_id]);
        if (s) serviceId = s.id;
      }
      if (!serviceId) {
        const [[s]] = await pool.query('SELECT id FROM services ORDER BY id ASC LIMIT 1');
        if (s) serviceId = s.id;
      }

      if (vehicleId && serviceId) {
        const [apptResult] = await pool.query(
          `INSERT INTO appointments (client_id, vehicle_id, service_id, pricing_tier_id, preferred_date, price, currency, notes, status, uuid)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', UUID())`,
          [userId, vehicleId, serviceId, tierId, data.preferred_date || new Date().toISOString().split('T')[0], total_amount, currency, data.notes || (items[0] ? `Package: ${items[0].title || items[0].name}` : 'Tamara Order')]
        );

        const apptId = apptResult.insertId;
        const [[newAppt]] = await pool.query('SELECT uuid FROM appointments WHERE id = ?', [apptId]);
        appointmentUuid = newAppt.uuid;

        await pool.query(
          `UPDATE payments SET appointment_id = ? WHERE uuid = ?`,
          [apptId, paymentUuid]
        );

        const loyaltyConn = await pool.getConnection();
        try {
          await awardPurchasePoints(loyaltyConn, userId, apptId, 50);
        } finally {
          loyaltyConn.release();
        }
      }
    }

    const payload = {
      total_amount: { amount: total_amount, currency: currency },
      shipping_amount: { amount: 0, currency: currency },
      tax_amount: { amount: 0, currency: currency },
      order_reference_id: orderReferenceId,
      order_number: orderReferenceId,
      items: items.map(item => ({
        name: item.name,
        type: 'Physical',
        reference_id: item.reference_id || item.id || `ITEM-${Date.now()}`,
        sku: item.sku || 'DEFAULT-SKU',
        quantity: item.quantity,
        unit_price: { amount: item.unit_price, currency: currency },
        tax_amount: { amount: 0, currency: currency },
        discount_amount: { amount: 0, currency: currency },
        total_amount: { amount: item.unit_price * item.quantity, currency: currency }
      })),
      consumer: {
        email: customer.email,
        first_name: customer.first_name || 'N/A',
        last_name: customer.last_name || 'N/A',
        phone_number: customer.phone_number
      },
      country_code: 'SA',
      merchant_url: {
        success: `${(process.env.BASE_URL || 'https://reflecto.com.sa').replace(/\/+$/, '')}/checkout/success`,
        cancel: `${(process.env.BASE_URL || 'https://reflecto.com.sa').replace(/\/+$/, '')}/checkout/cancel`,
        failure: `${(process.env.BASE_URL || 'https://reflecto.com.sa').replace(/\/+$/, '')}/checkout/cancel`,
        notification: `${(process.env.BASE_URL || 'https://reflecto.com.sa').replace(/\/+$/, '')}/webhooks/tamara`
      },
      billing_address: {
        city: customer.city || 'Riyadh',
        country_code: 'SA',
        first_name: customer.first_name || 'N/A',
        last_name: customer.last_name || 'N/A',
        line1: customer.address || 'N/A',
        phone_number: customer.phone_number
      },
      shipping_address: {
        city: customer.city || 'Riyadh',
        country_code: 'SA',
        first_name: customer.first_name || 'N/A',
        last_name: customer.last_name || 'N/A',
        line1: customer.address || 'N/A',
        phone_number: customer.phone_number
      },
      locale: 'ar_SA'
    };

    const response = await axios.post(
      `${TAMARA_BASE_URL}/checkout`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${tamaraToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const checkoutId = response.data.checkout_id;
    const checkoutUrl = response.data.checkout_url;

    await pool.query(
      `UPDATE payments SET session_id = ?, status = 'pending' WHERE uuid = ?`,
      [checkoutId, paymentUuid]
    );

    res.json({
      success: true,
      data: {
        paymentId: paymentUuid,
        appointmentId: appointmentUuid,
        checkoutId: checkoutId,
        checkoutUrl: checkoutUrl,
        auth: userAuthData
      }
    });

  } catch (error) {
    console.error('Tamara API Error:', error.response?.data || error.message);
    await pool.query(`UPDATE payments SET status = 'failed' WHERE uuid = ?`, [paymentUuid]);

    const errMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'طريقة الدفع عبر تمارا غير متاحة لهذا المبلغ أو تم تجاوز الحد الأقصى للمبلغ المسموح بالعملية';
    res.status(400).json({
      success: false,
      error: {
        code: 'TAMARA_API_ERROR',
        message: errMessage,
        details: error.response?.data
      }
    });
  }
}

async function testCheckout(req, res) {
  if (process.env.TEST_MODE != 'true') {
    return res.status(403).json({
      success: false,
      error: { code: 'TEST_MODE_DISABLED', message: 'Test mode is not enabled' }
    });
  }

  const { amount, total_amount, currency = 'SAR', items = [], customer, appointment_data, coupon_code } = req.body;
  const finalAmount = amount || total_amount || 0;
  const paymentUuid = crypto.randomUUID();

  try {
    const { userId, userAuthData } = await getOrCreateUserFromCustomer(req.user, customer);
    await consumeCouponIfAny(coupon_code);

    const isWorkOrderPayment = await handleWorkOrderPaymentIfAny(req.body, userId, finalAmount);

    await pool.query(
      `INSERT INTO payments (uuid, user_id, amount, currency, payment_method, status, session_id, created_at)
       VALUES (?, ?, ?, ?, 'credit_card', 'completed', ?, NOW())`,
      [paymentUuid, userId, finalAmount, currency, `TEST-${Date.now()}`]
    );

    let appointmentUuid = null;
    if (userId && !isWorkOrderPayment) {
      const data = appointment_data || {};
      const vehicleId = await getOrCreateVehicleForUser(userId, data.vehicle_id, data.vehicle);

      let serviceId = null;
      let tierId = null;

      if (data.pricing_tier_id) {
        const [[tier]] = await pool.query('SELECT id, service_id FROM pricing_tiers WHERE uuid = ?', [data.pricing_tier_id]);
        if (tier) { tierId = tier.id; serviceId = tier.service_id; }
      }
      if (!serviceId && data.service_id) {
        const [[s]] = await pool.query('SELECT id FROM services WHERE uuid = ?', [data.service_id]);
        if (s) serviceId = s.id;
      }
      if (!serviceId) {
        const [[s]] = await pool.query('SELECT id FROM services ORDER BY id ASC LIMIT 1');
        if (s) serviceId = s.id;
      }

      if (vehicleId && serviceId) {
        const [apptResult] = await pool.query(
          `INSERT INTO appointments (client_id, vehicle_id, service_id, pricing_tier_id, preferred_date, price, currency, notes, status, uuid)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', UUID())`,
          [userId, vehicleId, serviceId, tierId, data.preferred_date || new Date().toISOString().split('T')[0], finalAmount, currency, data.notes || (items[0] ? `Package: ${items[0].title || items[0].name}` : 'Test Purchase')]
        );

        const apptId = apptResult.insertId;
        const [[newAppt]] = await pool.query('SELECT uuid FROM appointments WHERE id = ?', [apptId]);
        appointmentUuid = newAppt.uuid;

        await pool.query(
          `UPDATE payments SET appointment_id = ?, user_id = COALESCE(user_id, ?) WHERE uuid = ?`,
          [apptId, userId, paymentUuid]
        );

        const loyaltyConn = await pool.getConnection();
        try {
          await awardPurchasePoints(loyaltyConn, userId, apptId, 50);
        } finally {
          loyaltyConn.release();
        }
      }
    }

    console.log(`[TEST MODE] Payment ${paymentUuid} created (amount: ${finalAmount} ${currency}), Appointment: ${appointmentUuid}`);

    res.json({
      success: true,
      data: {
        paymentId: paymentUuid,
        appointmentId: appointmentUuid,
        testMode: true,
        auth: userAuthData
      }
    });

  } catch (error) {
    console.error('Test Checkout Error:', error.message);
    res.status(500).json({
      success: false,
      error: { code: 'TEST_ERROR', message: 'Failed to process test checkout' }
    });
  }
}

async function getAllPayments(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.uuid AS id, p.amount, p.currency, p.payment_method, 
               p.session_id, p.status, p.created_at,
               COALESCE(u.full_name, u2.full_name) AS client_name,
               COALESCE(u.phone, u2.phone) AS client_phone
       FROM payments p
       LEFT JOIN users u ON u.id = p.user_id
       LEFT JOIN appointments a ON a.id = p.appointment_id
       LEFT JOIN users u2 ON u2.id = a.client_id
       ORDER BY p.created_at DESC`
    );

    res.json({
      success: true,
      data: rows.map(r => ({
        ...r,
        amount: parseFloat(r.amount),
        client_name: r.client_name || 'Client',
        client_phone: r.client_phone || '',
        client: {
          full_name: r.client_name || 'Client',
          phone: r.client_phone ? (r.client_phone.startsWith('+966') ? r.client_phone : `+966 ${r.client_phone.replace(/^0/, '')}`) : ''
        }
      }))
    });
  } catch (error) {
    console.error('Get Payments Error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'DB_ERROR', message: 'Failed to fetch payments' }
    });
  }
}

async function confirmPayment(req, res) {
  const { paymentId, work_order_id, work_order_number, amount, payment_method } = req.body;
  try {
    const userId = req.user?.id || null;
    if (paymentId) {
      await pool.query("UPDATE payments SET status = 'completed' WHERE uuid = ? OR session_id = ?", [paymentId, paymentId]);
    }
    if (work_order_id || work_order_number || req.body.is_work_order_payment) {
      await handleWorkOrderPaymentIfAny(req.body, userId, amount);
    }
    res.json({ success: true, message: 'Payment confirmed successfully' });
  } catch (error) {
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ success: false, error: { code: 'CONFIRM_ERROR', message: 'Failed to confirm payment' } });
  }
}

module.exports = { createTabbySession, createTamaraSession, testCheckout, getAllPayments, handleWorkOrderPaymentIfAny, confirmPayment };