const { pool } = require('../config/database');

// Ensure branch_name and partial_payments columns exist & warranties table FK is NULLable
pool.query("SHOW COLUMNS FROM work_orders LIKE 'branch_name'")
  .then(([rows]) => {
    if (rows && !rows.length) {
      return pool.query("ALTER TABLE work_orders ADD COLUMN branch_name VARCHAR(100) DEFAULT 'فرع جدة'");
    }
  })
  .catch(() => {});

pool.query("SHOW COLUMNS FROM work_orders LIKE 'partial_payments'")
  .then(([rows]) => {
    if (rows && !rows.length) {
      return pool.query("ALTER TABLE work_orders ADD COLUMN partial_payments JSON NULL");
    }
  })
  .catch(() => {});
pool.query("SHOW COLUMNS FROM work_orders LIKE 'service_technicians'")
  .then(([rows]) => {
    if (rows && !rows.length) {
      return pool.query("ALTER TABLE work_orders ADD COLUMN service_technicians JSON NULL");
    }
  })
  .catch(() => {});

pool.query("ALTER TABLE warranties MODIFY COLUMN appointment_id INT NULL")
  .catch(() => {});
pool.query("ALTER TABLE warranties MODIFY COLUMN vehicle_id INT NULL")
  .catch(() => {});

function parseJSON(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}

async function generateNextWorkOrderNumber() {
  const [rows] = await pool.query(
    `SELECT work_order_number FROM work_orders WHERE work_order_number LIKE 'WO-%'`
  );
  if (!rows.length) {
    return 'WO-260000';
  }
  let maxNum = 259999;
  for (const r of rows) {
    const numStr = r.work_order_number.replace(/^WO-/, '');
    const parsed = parseInt(numStr, 10);
    if (!isNaN(parsed) && parsed >= 260000 && parsed > maxNum) {
      maxNum = parsed;
    }
  }
  return `WO-${maxNum + 1}`;
}

async function getNextWO(req, res) {
  try {
    const nextNumber = await generateNextWorkOrderNumber();
    res.json({ success: true, work_order_number: nextNumber });
  } catch (err) {
    console.error('Get next work order number error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Sync per-service warranties for a work order to warranties table.
 * Each work order generates distinct warranty entries linked to work_order_id.
 * If status is completed/delivered or forceActive is true, sets is_active = 1.
 */
async function syncWorkOrderWarranties(workOrderId, forceActive = false) {
  if (!workOrderId) return;
  try {
    const [[wo]] = await pool.query('SELECT * FROM work_orders WHERE id = ?', [workOrderId]);
    if (!wo || !wo.client_phone) return;

    const cleanPhone = String(wo.client_phone).replace(/\D/g, '').slice(-9);
    const [[user]] = await pool.query(
      'SELECT id FROM users WHERE phone LIKE ? OR phone = ? LIMIT 1',
      [`%${cleanPhone}%`, wo.client_phone]
    );
    if (!user) return;

    let vehicleId = null;
    const [[v]] = await pool.query(
      'SELECT id FROM vehicles WHERE client_id = ? ORDER BY id DESC LIMIT 1',
      [user.id]
    );
    if (v) vehicleId = v.id;

    const vehicleName = [wo.vehicle_type, wo.vehicle_model, wo.vehicle_plate].filter(Boolean).join(' ') || 'سيارة العميل';

    let serviceWarrantiesObj = {};
    if (wo.service_warranties) {
      try {
        serviceWarrantiesObj = typeof wo.service_warranties === 'string' ? JSON.parse(wo.service_warranties) : wo.service_warranties;
      } catch (_) {}
    }

    const SERVICE_KEYS_MAP = {
      heat_insulation:    'عازل حراري (Heat Insulation)',
      polishing:          'تلميع خارجي (External Polishing)',
      nano_ceramic:       'نانو سيراميك (Nano Ceramic)',
      ppf:                'حماية الطلاء PPF (Paint Protection Film)',
      removal_services:   'خدمات إزالة (Removal Services)',
    };

    // Warranties are ONLY activated by explicit admin action (forceActive=true via activateWarranties endpoint)
    // Never auto-activate on order completion
    const activeFlag = forceActive ? 1 : 0;

    for (const [key, label] of Object.entries(SERVICE_KEYS_MAP)) {
      const rawVal = wo[key];
      let hasItems = false;
      if (Array.isArray(rawVal)) {
        hasItems = rawVal.length > 0;
      } else if (typeof rawVal === 'string' && rawVal.trim().length > 0 && rawVal !== '[]' && rawVal !== '""') {
        try { const parsed = JSON.parse(rawVal); hasItems = Array.isArray(parsed) ? parsed.length > 0 : true; } catch { hasItems = true; }
      }
      if (!hasItems) {
        await pool.query(
          `DELETE FROM warranties WHERE work_order_id = ? AND service_name = ?`,
          [wo.id, label]
        );
        continue;
      }

      const spec = serviceWarrantiesObj[key] || {};
      const duration = parseInt(spec.duration || 0);
      const unit = spec.unit || 'years';

      if (duration > 0) {
        const coverageMonths = unit === 'months' ? duration : duration * 12;
        const coverageYears = unit === 'years' ? duration : Math.floor(duration / 12);
        const startDate = wo.order_date || new Date().toISOString().slice(0, 10);
        
        const endDt = new Date(startDate);
        if (unit === 'months') endDt.setMonth(endDt.getMonth() + duration);
        else endDt.setFullYear(endDt.getFullYear() + duration);
        const endDate = endDt.toISOString().slice(0, 10);

        // Check if warranty for THIS work_order_id and service_name already exists
        const [[existing]] = await pool.query(
          `SELECT id FROM warranties WHERE work_order_id = ? AND service_name = ? LIMIT 1`,
          [wo.id, label]
        );

        let serviceDetailsObj = {};
        if (wo.service_details) {
          try {
            serviceDetailsObj = typeof wo.service_details === 'string' ? JSON.parse(wo.service_details) : wo.service_details;
          } catch (_) {}
        }
        const itemDetail = serviceDetailsObj[key] || {};
        const prodName = itemDetail.product || wo.product_name || null;
        const prodModel = itemDetail.product_model || wo.product_model || null;
        const covArea = itemDetail.coverage_area || wo.coverage_area || null;

        if (existing) {
          await pool.query(
            `UPDATE warranties SET 
              client_id = ?, vehicle_id = COALESCE(vehicle_id, ?), vehicle_name = ?, 
              start_date = ?, coverage_years = ?, coverage_months = ?, expiry_date = ?, unit = ?, is_active = ?,
              product_name = ?, product_model = ?, coverage_area = ?
             WHERE id = ?`,
            [user.id, vehicleId, vehicleName, startDate, coverageYears, coverageMonths, endDate, unit, activeFlag, prodName, prodModel, covArea, existing.id]
          );
        } else {
          await pool.query(
            `INSERT INTO warranties (uuid, client_id, vehicle_id, work_order_id, service_name, vehicle_name, start_date, coverage_years, coverage_months, expiry_date, unit, is_active, product_name, product_model, coverage_area)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user.id, vehicleId, wo.id, label, vehicleName, startDate, coverageYears, coverageMonths, endDate, unit, activeFlag, prodName, prodModel, covArea]
          );
        }
      } else {
        // If no warranty duration entered for this service, delete any existing warranty entry
        await pool.query(
          `DELETE FROM warranties WHERE work_order_id = ? AND service_name = ?`,
          [wo.id, label]
        );
      }
    }

    if (forceActive) {
      await pool.query('UPDATE warranties SET is_active = 1 WHERE work_order_id = ?', [wo.id]);
      await pool.query('UPDATE work_orders SET has_warranty = 1 WHERE id = ?', [wo.id]);
    }
  } catch (err) {
    console.error('syncWorkOrderWarranties error:', err.message);
  }
}

async function syncServiceWarranties(clientPhone, serviceWarranties, startDate, vehicleName, workOrderId, isActive = false) {
  if (workOrderId) {
    if (serviceWarranties && typeof serviceWarranties === 'object' && Object.keys(serviceWarranties).length > 0) {
      await pool.query('UPDATE work_orders SET service_warranties = ? WHERE id = ?', [JSON.stringify(serviceWarranties), workOrderId]).catch(() => {});
    }
    await syncWorkOrderWarranties(workOrderId, isActive);
  }
}

async function syncWorkOrderToSystem(woData) {
  try {
    const {
      id: woIdInput, client_name, client_phone, total_amount, paid_amount,
      vehicle_type, vehicle_model, vehicle_year, vehicle_color, vehicle_plate,
      order_date, ppf, nano_ceramic, status, work_order_number, payment_method, service_progress
    } = woData;

    if (!client_phone) return;
    const rawPhone = String(client_phone).replace(/[\s\-().]+/g, '');
    if (!rawPhone) return;

    // 1. Get or Create User
    const [[existingUser]] = await pool.query('SELECT id, uuid, full_name FROM users WHERE phone = ?', [rawPhone]);
    let userId = null;
    if (existingUser) {
      userId = existingUser.id;
      if (!existingUser.full_name && client_name) {
        await pool.query('UPDATE users SET full_name = ? WHERE id = ?', [client_name, userId]);
      }
    } else {
      const bcrypt = require('bcryptjs');
      const defaultPassword = await bcrypt.hash('00000', 10);
      const [userRes] = await pool.query(
        `INSERT INTO users (uuid, phone, full_name, password, role, is_active) VALUES (UUID(), ?, ?, ?, 'client', 1)`,
        [rawPhone, client_name || 'Client', defaultPassword]
      );
      userId = userRes.insertId;
      await pool.query('INSERT IGNORE INTO loyalty_points (client_id, total_points) VALUES (?, 0)', [userId]);
    }

    // 2. Get or Create Vehicle & Update Vehicle Info
    let vehicleId = null;
    if (vehicle_type || vehicle_model || vehicle_plate || woData.chassis_number) {
      const [[v]] = await pool.query(
        'SELECT id FROM vehicles WHERE client_id = ? AND (plate = ? OR (chassis_number IS NOT NULL AND chassis_number = ?) OR (brand = ? AND model = ?)) LIMIT 1',
        [userId, vehicle_plate || 'N/A', woData.chassis_number || 'N/A', vehicle_type || '', vehicle_model || '']
      );
      if (v) {
        vehicleId = v.id;
        await pool.query(
          `UPDATE vehicles SET
            brand = COALESCE(NULLIF(?, ''), brand),
            model = COALESCE(NULLIF(?, ''), model),
            year = COALESCE(NULLIF(?, ''), year),
            color = COALESCE(NULLIF(?, ''), color),
            plate = COALESCE(NULLIF(?, ''), plate),
            chassis_number = COALESCE(NULLIF(?, ''), chassis_number)
           WHERE id = ?`,
          [vehicle_type || '', vehicle_model || '', vehicle_year || '', vehicle_color || '', vehicle_plate || '', woData.chassis_number || '', vehicleId]
        ).catch(() => {});
      } else {
        const [vRes] = await pool.query(
          `INSERT INTO vehicles (client_id, brand, model, year, color, plate, chassis_number, uuid) VALUES (?, ?, ?, ?, ?, ?, ?, UUID())`,
          [userId, vehicle_type || 'Vehicle', vehicle_model || 'Model', vehicle_year || 2024, vehicle_color || null, vehicle_plate || null, woData.chassis_number || null]
        );
        vehicleId = vRes.insertId;
      }
    }

    // 3. Find default service_id
    const [[srv]] = await pool.query('SELECT id FROM services ORDER BY id ASC LIMIT 1');
    const serviceId = srv ? srv.id : 1;

    // Calculate progress percentage of work order
    let totalItems = 0;
    let doneItems = 0;
    const ALL_KEYS = ['heat_insulation', 'polishing', 'nano_ceramic', 'ppf', 'removal_services'];
    const progObj = typeof service_progress === 'string' ? parseJSON(service_progress, {}) : (service_progress || {});

    ALL_KEYS.forEach(k => {
      const list = typeof woData[k] === 'string' ? parseJSON(woData[k], []) : (woData[k] || []);
      if (Array.isArray(list) && list.length > 0) {
        totalItems += 1;
        if (progObj[k]?.completed) doneItems += 1;
      }
    });

    let calculatedProgress = 0;
    if (status === 'completed' || status === 'delivered') {
      calculatedProgress = 100;
    } else if (totalItems > 0) {
      if (doneItems === totalItems) {
        calculatedProgress = 90; // All technician tasks done -> 90%
      } else {
        calculatedProgress = Math.min(85, Math.round((doneItems / totalItems) * 90));
      }
    } else {
      calculatedProgress = status === 'in_progress' ? 50 : 0;
    }

    const delivDate = woData.delivery_date || null;

    // 4. Create or update Appointment
    const apptStatus = (status === 'delivered' || status === 'completed') ? 'completed' : status === 'in_progress' ? 'in_progress' : 'pending';
    
    const [[existingAppt]] = await pool.query(
      'SELECT id FROM appointments WHERE client_id = ? AND (notes LIKE ? OR (vehicle_id IS NOT NULL AND vehicle_id = ?)) ORDER BY id DESC LIMIT 1',
      [userId, `%${work_order_number}%`, vehicleId || 0]
    );

    let apptId = null;
    if (existingAppt) {
      apptId = existingAppt.id;
      await pool.query(
        'UPDATE appointments SET status = ?, progress = ?, price = ?, preferred_date = ?, estimated_delivery = COALESCE(?, estimated_delivery) WHERE id = ?',
        [apptStatus, calculatedProgress, parseFloat(total_amount || 0), order_date || new Date().toISOString().slice(0, 10), delivDate, apptId]
      );
    } else if (vehicleId) {
      const [apptRes] = await pool.query(
        `INSERT INTO appointments (client_id, vehicle_id, service_id, preferred_date, estimated_delivery, price, currency, notes, status, progress, uuid)
         VALUES (?, ?, ?, ?, ?, ?, 'SAR', ?, ?, ?, UUID())`,
        [userId, vehicleId, serviceId, order_date || new Date().toISOString().slice(0, 10), delivDate, parseFloat(total_amount || 0), `Check List Order: ${work_order_number}`, apptStatus, calculatedProgress]
      );
      apptId = apptRes.insertId;
    }

    // 5. Sync Payment if paid_amount > 0
    const paidVal = parseFloat(paid_amount || 0);
    const paymentMethodRaw = woData.payment_method || 'cash';
    if (paidVal > 0 && userId) {
      const [[existingPay]] = await pool.query(
        'SELECT id, payment_method FROM payments WHERE user_id = ? AND (session_id = ? OR appointment_id = ?) LIMIT 1',
        [userId, `WO-${work_order_number}`, apptId]
      );
      if (!existingPay) {
        await pool.query(
          `INSERT INTO payments (uuid, user_id, appointment_id, amount, currency, payment_method, status, session_id, created_at)
           VALUES (UUID(), ?, ?, ?, 'SAR', ?, 'completed', ?, NOW())`,
          [userId, apptId, paidVal, paymentMethodRaw, `WO-${work_order_number}`]
        );
      } else if (paymentMethodRaw && paymentMethodRaw !== 'cash' && existingPay.payment_method === 'cash') {
        await pool.query(
          'UPDATE payments SET payment_method = ? WHERE user_id = ? AND (session_id = ? OR appointment_id = ?)',
          [paymentMethodRaw, userId, `WO-${work_order_number}`, apptId]
        );
      }
    }

    // Award 50 loyalty points for creating/completing a Check List / Work Order (with anti-duplicate check)
    if (userId) {
      const { awardPurchasePoints } = require('./loyalty.controller');
      const conn = await pool.getConnection();
      try {
        await awardPurchasePoints(conn, userId, apptId || null, 50, woData.work_order_number || woData.uuid);
      } catch(e) {
        console.error('awardPurchasePoints error:', e.message);
      } finally {
        conn.release();
      }
    }

    // Also sync warranties for this work order
    if (woIdInput) {
      await syncWorkOrderWarranties(woIdInput, apptStatus === 'completed');
    }
  } catch (err) {
    console.error('syncWorkOrderToSystem Error:', err.message);
  }
}

async function getAll(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '20'));
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;
    const status = req.query.status;
    const branch = req.query.branch;

    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (work_order_number LIKE ? OR client_name LIKE ? OR client_phone LIKE ? OR vehicle_type LIKE ? OR vehicle_plate LIKE ? OR branch_name LIKE ?)';
      params.push(search, search, search, search, search, search);
    }

    if (status && status !== 'all') {
      where += ' AND status = ?';
      params.push(status);
    }

    if (branch && branch !== 'all') {
      where += ' AND branch_name = ?';
      params.push(branch);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM work_orders ${where}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT * FROM work_orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Fetch total overall count & branch counts
    const [[{ grand_total }]] = await pool.query(`SELECT COUNT(*) AS grand_total FROM work_orders`);
    const [branchCounts] = await pool.query(`SELECT branch_name, COUNT(*) AS count FROM work_orders GROUP BY branch_name`);

    res.json({
      success: true,
      data: rows.map(r => ({
        ...r,
        branch_name: r.branch_name || 'فرع جدة',
        price: parseFloat(r.price),
        vat_amount: parseFloat(r.vat_amount),
        total_amount: parseFloat(r.total_amount),
        paid_amount: parseFloat(r.paid_amount),
        remaining_amount: parseFloat(r.remaining_amount),
      })),
      meta: {
        total: parseInt(total),
        grand_total: parseInt(grand_total),
        branch_counts: branchCounts.reduce((acc, curr) => {
          if (curr.branch_name) acc[curr.branch_name] = curr.count;
          return acc;
        }, {}),
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get work orders error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function getOne(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM work_orders WHERE (uuid = ? OR id = ? OR work_order_number = ?) LIMIT 1`,
      [id, id, id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work Order not found' } });
    }

    const r = rows[0];
    const parseJSON = (data, defaultVal = []) => {
      if (!data) return defaultVal;
      if (typeof data === 'object') return data;
      try { return JSON.parse(data); } catch { return defaultVal; }
    };

    const rawServiceTechs = parseJSON(r.service_technicians, {});
    const resolvedServiceTechs = { ...rawServiceTechs };

    // Resolve technician UUIDs or numeric IDs to actual technician full names
    try {
      const [techUsers] = await pool.query("SELECT id, uuid, full_name FROM users");
      const techNameMap = {};
      techUsers.forEach(u => {
        if (u.id) techNameMap[String(u.id)] = u.full_name;
        if (u.uuid) techNameMap[String(u.uuid)] = u.full_name;
      });

      Object.keys(resolvedServiceTechs).forEach(k => {
        const val = resolvedServiceTechs[k];
        if (val && techNameMap[String(val)]) {
          resolvedServiceTechs[k] = techNameMap[String(val)];
        }
      });

      if (r.technician_name && techNameMap[String(r.technician_name)]) {
        r.technician_name = techNameMap[String(r.technician_name)];
      }
    } catch (_) {}

    res.json({
      success: true,
      data: {
        ...r,
        branch_name: r.branch_name || 'فرع جدة',
        heat_insulation: parseJSON(r.heat_insulation),
        polishing: parseJSON(r.polishing),
        nano_ceramic: parseJSON(r.nano_ceramic),
        ppf: parseJSON(r.ppf),
        removal_services: parseJSON(r.removal_services),
        inspection_checklist: parseJSON(r.inspection_checklist, {}),
        partial_payments: parseJSON(r.partial_payments),
        service_progress: parseJSON(r.service_progress, {}),
        service_technicians: resolvedServiceTechs,
        service_warranties: parseJSON(r.service_warranties, {}),
        price: parseFloat(r.price),
        original_price: r.original_price != null ? parseFloat(r.original_price) : null,
        discount_percent: parseFloat(r.discount_percent || 0),
        discount_amount: parseFloat(r.discount_amount || 0),
        company_name: r.company_name || null,
        vat_amount: parseFloat(r.vat_amount),
        total_amount: parseFloat(r.total_amount),
        paid_amount: parseFloat(r.paid_amount),
        remaining_amount: parseFloat(r.remaining_amount),
      }
    });
  } catch (err) {
    console.error('Get work order details error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function create(req, res) {
  try {
    const {
      work_order_number,
      client_name,
      client_phone,
      order_date,
      branch_name,
      heat_insulation,
      heat_insulation_details,
      polishing,
      nano_ceramic,
      ppf,
      ppf_partial_details,
      removal_services,
      client_type,
      price,
      original_price,
      discount_percent,
      discount_amount,
      company_name,
      vat_amount,
      total_amount,
      paid_amount,
      remaining_amount,
      payment_method,
      vehicle_type,
      vehicle_model,
      vehicle_year,
      vehicle_color,
      vehicle_plate,
      chassis_number,
      mileage_km,
      inspection_notes,
      inspection_checklist,
      reception_name,
      accountant_name,
      sales_manager_name,
      delivery_date,
      has_warranty,
      warranty_years,
      service_warranties,
      service_technicians,
      technician_id,
      status
    } = req.body;

    const generatedNumber = work_order_number || await generateNextWorkOrderNumber();
    const startDate = order_date || new Date().toISOString().slice(0, 10);

    let techId = null;
    let techName = req.body.technician_name || null;
    if (technician_id) {
      const [[t]] = await pool.query('SELECT id, full_name FROM users WHERE uuid = ? OR id = ?', [technician_id, technician_id]);
      if (t) {
        techId = t.id;
        techName = t.full_name;
      }
    }

    // Parse service_warranties from JSON string if needed
    let parsedServiceWarranties = {};
    try { parsedServiceWarranties = typeof service_warranties === 'string' ? JSON.parse(service_warranties) : (service_warranties || {}); } catch (_) {}
    let parsedServiceTechnicians = {};
    try { parsedServiceTechnicians = typeof service_technicians === 'string' ? JSON.parse(service_technicians) : (service_technicians || {}); } catch (_) {}

    const [result] = await pool.query(
      `INSERT INTO work_orders (
        uuid, work_order_number, client_name, client_phone, order_date, branch_name,
        heat_insulation, heat_insulation_details, polishing, nano_ceramic, ppf, ppf_partial_details, removal_services, client_type,
        price, original_price, discount_percent, discount_amount, company_name, vat_amount, total_amount, paid_amount, remaining_amount, payment_method,
        vehicle_type, vehicle_model, vehicle_year, vehicle_color, vehicle_plate,
        chassis_number, mileage_km, inspection_notes, inspection_checklist,
        reception_name, accountant_name, sales_manager_name, delivery_date,
        technician_id, technician_name, service_technicians, service_warranties, service_details, product_name, product_model, coverage_area, status
      ) VALUES (
        UUID(), ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [
        generatedNumber,
        client_name || 'N/A',
        client_phone || 'N/A',
        startDate,
        branch_name || 'فرع جدة',
        JSON.stringify(heat_insulation || []),
        heat_insulation_details || null,
        JSON.stringify(polishing || []),
        JSON.stringify(nano_ceramic || []),
        JSON.stringify(ppf || []),
        ppf_partial_details || null,
        JSON.stringify(removal_services || []),
        client_type || 'عميل مباشر',
        parseFloat(price || 0),
        original_price != null ? parseFloat(original_price) : null,
        parseFloat(discount_percent || 0),
        parseFloat(discount_amount || 0),
        company_name || null,
        parseFloat(vat_amount || 0),
        parseFloat(total_amount || 0),
        parseFloat(paid_amount || 0),
        parseFloat(remaining_amount || 0),
        payment_method || null,
        vehicle_type || '',
        vehicle_model || '',
        vehicle_year || '',
        vehicle_color || '',
        vehicle_plate || '',
        chassis_number || '',
        mileage_km || '',
        inspection_notes || '',
        JSON.stringify(inspection_checklist || {}),
        reception_name || '',
        accountant_name || '',
        sales_manager_name || '',
        delivery_date || null,
        techId,
        techName,
        JSON.stringify(parsedServiceTechnicians),
        JSON.stringify(parsedServiceWarranties),
        typeof req.body.service_details === 'object' ? JSON.stringify(req.body.service_details) : (req.body.service_details || null),
        req.body.product_name || null,
        req.body.product_model || null,
        req.body.coverage_area || null,
        status || 'pending'
      ]
    );

    const [[newOrder]] = await pool.query(`SELECT uuid FROM work_orders WHERE id = ?`, [result.insertId]);

    const woData = {
      id: result.insertId,
      uuid: newOrder?.uuid || null,
      work_order_number: generatedNumber,
      client_name, client_phone, total_amount, paid_amount, payment_method,
      vehicle_type, vehicle_model, vehicle_year, vehicle_color, vehicle_plate, chassis_number,
      order_date: startDate, ppf, nano_ceramic, status
    };

    // Respond immediately — do NOT await heavy sync operations before replying
    res.status(201).json({
      success: true,
      message: 'Work Order Check List created successfully',
      id: newOrder.uuid,
      work_order_number: generatedNumber
    });

    // Background sync (fire-and-forget) — runs after response is sent
    setImmediate(() => {
      // Auto-sync Work Order to Client, Vehicles, Appointments, Payments & Points
      syncWorkOrderToSystem(woData).catch(e => console.error('syncWorkOrderToSystem bg error:', e.message));
      // Sync per-service warranties (all saved as is_active=0 until activated)
      const vehicleName = [vehicle_type, vehicle_model, vehicle_plate].filter(Boolean).join(' ');
      syncServiceWarranties(client_phone, parsedServiceWarranties, startDate, vehicleName, result.insertId).catch(e => console.error('syncServiceWarranties bg error:', e.message));
    });

  } catch (err) {
    console.error('Create work order error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;

    const fields = [
      'client_name', 'client_phone', 'order_date', 'branch_name', 'client_type',
      'price', 'original_price', 'discount_percent', 'discount_amount', 'company_name',
      'vat_amount', 'total_amount', 'paid_amount', 'remaining_amount', 'payment_method',
      'vehicle_type', 'vehicle_model', 'vehicle_year', 'vehicle_color',
      'vehicle_plate', 'chassis_number', 'mileage_km', 'inspection_notes',
      'reception_name', 'accountant_name', 'sales_manager_name', 'delivery_date',
      'heat_insulation_details', 'ppf_partial_details', 'has_warranty', 'warranty_years', 'warranty_start_date', 'warranty_end_date', 'status',
      'started_at', 'completed_at'
    ];

    const updates = [];
    const params = [];

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(body[field]);
      }
    });

    if (body.technician_id !== undefined || body.technician_name !== undefined) {
      if (body.technician_id) {
        const [[t]] = await pool.query('SELECT id, full_name FROM users WHERE uuid = ? OR id = ?', [body.technician_id, body.technician_id]);
        if (t) {
          updates.push('technician_id = ?'); params.push(t.id);
          updates.push('technician_name = ?'); params.push(t.full_name);
        } else {
          updates.push('technician_id = NULL');
          updates.push('technician_name = ?'); params.push(body.technician_name || null);
        }
      } else if (body.technician_name) {
        updates.push('technician_id = NULL');
        updates.push('technician_name = ?'); params.push(body.technician_name);
      } else {
        updates.push('technician_id = NULL');
        updates.push('technician_name = NULL');
      }
    }

    if (body.service_progress !== undefined) {
      updates.push('service_progress = ?');
      params.push(typeof body.service_progress === 'object' ? JSON.stringify(body.service_progress) : body.service_progress);
    }

    if (body.heat_insulation !== undefined) { updates.push('heat_insulation = ?'); params.push(JSON.stringify(body.heat_insulation)); }
    if (body.polishing !== undefined) { updates.push('polishing = ?'); params.push(JSON.stringify(body.polishing)); }
    if (body.nano_ceramic !== undefined) { updates.push('nano_ceramic = ?'); params.push(JSON.stringify(body.nano_ceramic)); }
    if (body.ppf !== undefined) { updates.push('ppf = ?'); params.push(JSON.stringify(body.ppf)); }
    if (body.removal_services !== undefined) { updates.push('removal_services = ?'); params.push(JSON.stringify(body.removal_services)); }
    if (body.inspection_checklist !== undefined) { updates.push('inspection_checklist = ?'); params.push(JSON.stringify(body.inspection_checklist)); }
    if (body.service_technicians !== undefined) {
      updates.push('service_technicians = ?');
      params.push(typeof body.service_technicians === 'object' ? JSON.stringify(body.service_technicians) : body.service_technicians);
    }
    if (body.service_details !== undefined) {
      updates.push('service_details = ?');
      params.push(typeof body.service_details === 'object' ? JSON.stringify(body.service_details) : body.service_details);
    }
    if (body.product_name !== undefined) { updates.push('product_name = ?'); params.push(body.product_name); }
    if (body.product_model !== undefined) { updates.push('product_model = ?'); params.push(body.product_model); }
    if (body.coverage_area !== undefined) { updates.push('coverage_area = ?'); params.push(body.coverage_area); }

    if (body.has_warranty && body.warranty_years) {
      const startDate = body.order_date || new Date().toISOString().slice(0, 10);
      const yearsNum = parseInt(body.warranty_years);
      const startDt = new Date(startDate);
      startDt.setFullYear(startDt.getFullYear() + yearsNum);
      const endDate = startDt.toISOString().slice(0, 10);
      
      updates.push('warranty_start_date = ?'); params.push(startDate);
      updates.push('warranty_end_date = ?'); params.push(endDate);
    }

    if (updates.length > 0) {
      params.push(id, id);
      await pool.query(`UPDATE work_orders SET ${updates.join(', ')} WHERE (uuid = ? OR id = ?)`, params);
    }

    // Respond immediately, then trigger background sync
    res.json({ success: true, message: 'Work Order updated successfully' });

    // Background sync (fire-and-forget)
    setImmediate(async () => {
      try {
        const [[wo]] = await pool.query('SELECT * FROM work_orders WHERE uuid = ? OR id = ?', [id, id]);
        if (wo) {
          await syncWorkOrderToSystem(wo).catch(e => console.error('update syncWO bg error:', e.message));
          let parsedServiceWarranties = {};
          if (body.service_warranties) {
            try { parsedServiceWarranties = typeof body.service_warranties === 'string' ? JSON.parse(body.service_warranties) : body.service_warranties; } catch (_) {}
          }
          if (Object.keys(parsedServiceWarranties).length > 0) {
            const vehicleName = [wo.vehicle_type, wo.vehicle_model, wo.vehicle_plate].filter(Boolean).join(' ');
            const isWActive = body.has_warranty !== undefined ? Boolean(body.has_warranty) : Boolean(wo.has_warranty);
            await syncServiceWarranties(wo.client_phone, parsedServiceWarranties, wo.order_date, vehicleName, wo.id, isWActive).catch(e => console.error('update syncWarranties bg error:', e.message));
          }
        }
      } catch(e) { console.error('update bg sync error:', e.message); }
    });

  } catch (err) {
    console.error('Update work order error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const [[wo]] = await pool.query('SELECT id, work_order_number, client_phone FROM work_orders WHERE (uuid = ? OR id = ?)', [id, id]);
    if (wo) {
      // 1. Delete linked warranties
      await pool.query('DELETE FROM warranties WHERE work_order_id = ?', [wo.id]);
      
      // 2. Delete linked synced appointments & their warranties
      if (wo.work_order_number) {
        const [appts] = await pool.query('SELECT id, client_id FROM appointments WHERE notes LIKE ?', [`%${wo.work_order_number}%`]);
        for (const appt of appts) {
          await pool.query('DELETE FROM warranties WHERE appointment_id = ? OR client_id = ?', [appt.id, appt.client_id]);
          await pool.query('DELETE FROM appointments WHERE id = ?', [appt.id]);
        }
      }

      if (wo.client_phone) {
        const cleanPhone = String(wo.client_phone).replace(/\D/g, '').slice(-9);
        const [[u]] = await pool.query('SELECT id FROM users WHERE phone LIKE ? OR phone = ? LIMIT 1', [`%${cleanPhone}%`, wo.client_phone]);
        if (u) {
          const [[remainingWo]] = await pool.query('SELECT id FROM work_orders WHERE client_phone LIKE ? AND id != ? LIMIT 1', [`%${cleanPhone}%`, wo.id]);
          const [[remainingAppt]] = await pool.query('SELECT id FROM appointments WHERE client_id = ? LIMIT 1', [u.id]);
          if (!remainingWo && !remainingAppt) {
            await pool.query('DELETE FROM warranties WHERE client_id = ?', [u.id]);
          }
        }
      }

      // 3. Delete work order
      await pool.query('DELETE FROM work_orders WHERE id = ?', [wo.id]);
    }
    res.json({ success: true, message: 'Work Order deleted successfully' });
  } catch (err) {
    console.error('Delete work order error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function addPartialPayment(req, res) {
  try {
    const { id } = req.params;
    const { amount, payment_method } = req.body;

    const payVal = parseFloat(amount);
    if (isNaN(payVal) || payVal <= 0) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_AMOUNT', message: 'مبلغ الدفع غير صحيح' } });
    }

    const [[order]] = await pool.query('SELECT * FROM work_orders WHERE (uuid = ? OR id = ?)', [id, id]);
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    let history = [];
    if (order.partial_payments) {
      try {
        history = typeof order.partial_payments === 'string' ? JSON.parse(order.partial_payments) : order.partial_payments;
      } catch (e) { history = []; }
    }

    const newPayment = {
      amount: payVal,
      payment_method: payment_method || 'نقداً',
      paid_at: new Date().toISOString(),
    };

    history.push(newPayment);

    const currentPaid = parseFloat(order.paid_amount || 0);
    const totalAmt = parseFloat(order.total_amount || 0);
    const newPaidTotal = currentPaid + payVal;
    const newRemaining = Math.max(0, totalAmt - newPaidTotal);

    await pool.query(
      `UPDATE work_orders SET paid_amount = ?, remaining_amount = ?, partial_payments = ? WHERE id = ?`,
      [newPaidTotal, newRemaining, JSON.stringify(history), order.id]
    );

    // Sync payment record into payments table
    if (order.client_phone) {
      const cleanPhone = String(order.client_phone).replace(/[\s\-().]+/g, '');
      const [[user]] = await pool.query('SELECT id FROM users WHERE phone = ?', [cleanPhone]);
      if (user) {
        await pool.query(
          `INSERT INTO payments (uuid, user_id, amount, currency, payment_method, status, session_id, created_at)
           VALUES (UUID(), ?, ?, 'SAR', ?, 'completed', ?, NOW())`,
          [user.id, payVal, payment_method || 'نقداً', `WO-PARTIAL-${order.work_order_number}`]
        );
      }
    }

    res.json({
      success: true,
      message: 'تم إضافة الدفعة بنجاح',
      paid_amount: newPaidTotal,
      remaining_amount: newRemaining,
      partial_payments: history,
    });
  } catch (err) {
    console.error('Add partial payment error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Activate warranties for a specific work order (Admin-only explicit action)
 */
async function activateOrderWarranties(req, res) {
  try {
    const { id } = req.params;
    const [[wo]] = await pool.query('SELECT * FROM work_orders WHERE (uuid = ? OR id = ?)', [id, id]);
    if (!wo) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work Order not found' } });
    }
    // Force-sync warranties and activate them
    await syncWorkOrderWarranties(wo.id, true);
    res.json({ success: true, message: 'تم تفعيل الضمانات بنجاح' });
  } catch (err) {
    console.error('activateOrderWarranties error:', err.message);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

module.exports = { getAll, getOne, create, update, remove, getNextWO, addPartialPayment, syncWorkOrderToSystem, syncServiceWarranties, syncWorkOrderWarranties, activateOrderWarranties };
