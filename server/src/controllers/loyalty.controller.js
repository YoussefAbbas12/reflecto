const { pool } = require('../config/database');
const crypto = require('crypto');

// Each point = 1 SAR when redeemed for a coupon
const POINTS_TO_SAR_RATIO = 1;
const MIN_REDEEM_POINTS = 50; // minimum 50 points

async function redeemPoints(req, res) {
  const { points } = req.body;
  const userId = req.user.id;

  if (!points || typeof points !== 'number' || points < MIN_REDEEM_POINTS) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REDEMPTION',
        message: `Minimum redemption is ${MIN_REDEEM_POINTS} points`,
      },
    });
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const [[lp]] = await conn.query(
      'SELECT total_points FROM loyalty_points WHERE client_id = ? FOR UPDATE',
      [userId]
    );

    if (!lp || lp.total_points < points) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_POINTS',
          message: "You don't have enough points",
          details: { available: lp?.total_points || 0, required: points },
        },
      });
    }

    // Deduct points
    await conn.query(
      'UPDATE loyalty_points SET total_points = total_points - ? WHERE client_id = ?',
      [points, userId]
    );

    // Generate unique coupon code
    const couponCode = `REFLECTO-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const discountValue = points * POINTS_TO_SAR_RATIO;

    // Insert single-use coupon
    await conn.query(
      `INSERT INTO coupons (uuid, code, discount_type, discount_value, max_uses, current_uses, is_active, created_by, description)
       VALUES (UUID(), ?, 'fixed', ?, 1, 0, 1, ?, ?)`,
      [couponCode, discountValue, userId, `Loyalty redemption: ${points} pts → SAR ${discountValue}`]
    );

    // Log transaction
    await conn.query(
      `INSERT INTO loyalty_transactions (from_user_id, to_user_id, type, points, description)
       VALUES (?, ?, 'redeemed', ?, ?)`,
      [userId, userId, -points, `Redeemed ${points} pts for coupon ${couponCode} (SAR ${discountValue} off)`]
    );

    await conn.commit();

    res.json({
      success: true,
      points_deducted: points,
      discount_value: discountValue,
      discount_currency: 'SAR',
      coupon_code: couponCode,
      remaining_points: lp.total_points - points,
      message: `Coupon ${couponCode} created for SAR ${discountValue} off!`,
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function transferPoints(req, res) {
  const { to_phone, points, note } = req.body;
  const fromUserId = req.user.id;

  if (!to_phone || !points) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'to_phone and points are required' },
    });
  }

  if (points < 1) {
    return res.status(400).json({
      success: false,
      error: { code: 'MIN_TRANSFER', message: 'Minimum transfer is 1 point' },
    });
  }

  const rawPhone = String(to_phone).replace(/[\s\-().]+/g, '');
  const [[toUser]] = await pool.query(
    `SELECT id, uuid, full_name, phone FROM users WHERE (phone = ? OR phone LIKE ?) AND is_active = 1 LIMIT 1`,
    [to_phone, `%${rawPhone.slice(-9)}`]
  );

  if (!toUser) {
    return res.status(404).json({
      success: false,
      error: { code: 'RECIPIENT_NOT_FOUND', message: 'الرقم غير موجود' },
    });
  }

  if (toUser.id === fromUserId) {
    return res.status(400).json({
      success: false,
      error: { code: 'SELF_TRANSFER', message: 'لا يمكنك التحويل لنفسك' },
    });
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const [[sender]] = await conn.query(
      'SELECT total_points FROM loyalty_points WHERE client_id = ? FOR UPDATE',
      [fromUserId]
    );

    if (!sender || sender.total_points < points) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_POINTS',
          message: "رصيدك غير كافٍ لإجراء هذا التحويل",
          details: { available: sender?.total_points || 0, required: points },
        },
      });
    }

    await conn.query(
      'UPDATE loyalty_points SET total_points = total_points - ? WHERE client_id = ?',
      [points, fromUserId]
    );

    await conn.query(
      `INSERT INTO loyalty_points (client_id, total_points) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE total_points = total_points + ?`,
      [toUser.id, points, points]
    );

    const desc = note || `Transfer to ${toUser.full_name}`;
    await conn.query(
      `INSERT INTO loyalty_transactions (from_user_id, to_user_id, type, points, description)
       VALUES (?, ?, 'transferred_out', ?, ?)`,
      [fromUserId, fromUserId, -points, desc]
    );
    await conn.query(
      `INSERT INTO loyalty_transactions (from_user_id, to_user_id, type, points, description)
       VALUES (?, ?, 'transferred_in', ?, ?)`,
      [fromUserId, toUser.id, points, `Received from ${req.user.full_name || req.user.phone}`]
    );

    await conn.commit();

    res.json({
      success: true,
      points_transferred: points,
      your_new_balance: sender.total_points - points,
      recipient_name: toUser.full_name,
      recipient_phone: toUser.phone,
      message: `تم التحويل إلى ${toUser.full_name}\n${toUser.phone}`
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Award 50 loyalty points to a client when they complete a service purchase or checklist.
 * Called internally from checkout / appointment completion / work order creation.
 */
async function awardPurchasePoints(conn, clientId, appointmentId = null, points = 50, workOrderUuid = null) {
  try {
    if (!clientId) return;

    // Anti-duplicate guard: check if points were already awarded for this appointment or work order
    if (appointmentId) {
      const [[appt]] = await conn.query('SELECT points_earned FROM appointments WHERE id = ?', [appointmentId]);
      if (appt && appt.points_earned > 0) return;
    }

    if (workOrderUuid) {
      const [[alreadyTx]] = await conn.query(
        'SELECT id FROM loyalty_transactions WHERE to_user_id = ? AND (work_order_uuid = ? OR description LIKE ?)',
        [clientId, workOrderUuid, `%${workOrderUuid}%`]
      );
      if (alreadyTx) return;
    }

    // Upsert loyalty_points
    await conn.query(
      `INSERT INTO loyalty_points (client_id, total_points) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE total_points = total_points + ?`,
      [clientId, points, points]
    );

    // Update the appointment's points_earned field
    if (appointmentId) {
      await conn.query(
        'UPDATE appointments SET points_earned = ? WHERE id = ?',
        [points, appointmentId]
      );
    }

    // Log the transaction
    const desc = 'مكافأة إكمال الخدمة والـ Check List (+50 نقاط ولاء)';
    await conn.query(
      `INSERT INTO loyalty_transactions (from_user_id, to_user_id, appointment_id, work_order_uuid, type, points, description)
       VALUES (NULL, ?, ?, ?, 'earned', ?, ?)`,
      [clientId, appointmentId || null, workOrderUuid || null, points, desc]
    );
  } catch (err) {
    console.error('[Loyalty] Failed to award purchase points:', err.message);
  }
}

module.exports = { redeemPoints, transferPoints, awardPurchasePoints };
