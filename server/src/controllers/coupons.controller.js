const { pool } = require('../config/database');

async function create(req, res) {
  const {
    code,
    discount_type,
    discount_value,
    max_uses,
    valid_from,
    valid_to,
    description,
  } = req.body;

  if (!code || !discount_type || discount_value === undefined || !max_uses) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'code, discount_type, discount_value, max_uses are required',
      },
    });
  }

  if (!['percentage', 'fixed'].includes(discount_type)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_TYPE', message: 'discount_type must be: percentage or fixed' },
    });
  }

  if (discount_type === 'percentage' && (discount_value <= 0 || discount_value > 100)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_VALUE', message: 'Percentage must be between 1 and 100' },
    });
  }

  const upperCode = code.trim().toUpperCase();

  const [[existing]] = await pool.query(
    'SELECT id FROM coupons WHERE code = ?',
    [upperCode]
  );
  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'DUPLICATE_CODE', message: `Coupon code "${upperCode}" already exists` },
    });
  }

  const [result] = await pool.query(
    `INSERT INTO coupons
       (code, discount_type, discount_value, max_uses, valid_from, valid_to, description, created_by, uuid)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID())`,
    [
      upperCode,
      discount_type,
      discount_value,
      max_uses,
      valid_from || null,
      valid_to   || null,
      description || null,
      req.user ? req.user.id : null,
    ]
  );

  await pool.query(
    `INSERT INTO activity_log (actor_id, action, target_type, target_id, description, details)
     VALUES (?, 'coupon.created', 'coupon', ?, 'New coupon created', ?)`,
    [req.user ? req.user.id : null, result.insertId, upperCode]
  ).catch(() => {});

  const [[created]] = await pool.query('SELECT uuid FROM coupons WHERE id = ?', [result.insertId]);

  res.status(201).json({
    success: true,
    id: created ? created.uuid : result.insertId,
    code: upperCode,
    message: `Coupon "${upperCode}" created successfully`,
  });
}

async function getAll(req, res) {
  const page   = Math.max(1, parseInt(req.query.page  || '1'));
  const limit  = Math.min(50, parseInt(req.query.limit || '20'));
  const offset = (page - 1) * limit;
  const active = req.query.active;

  let where = 'WHERE 1=1';
  const params = [];
  if (active === 'true')  { where += ' AND is_active = 1 AND current_uses < max_uses'; }
  if (active === 'false') { where += ' AND (is_active = 0 OR current_uses >= max_uses)'; }

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM coupons ${where}`, params
  );

  const [rows] = await pool.query(
    `SELECT
       c.uuid AS id, c.code, c.discount_type, c.discount_value,
       c.max_uses, c.current_uses,
       (c.max_uses - c.current_uses) AS remaining_uses,
       c.valid_from, c.valid_to, c.description, c.is_active,
       c.created_at,
       u.full_name AS created_by_name
     FROM coupons c
     LEFT JOIN users u ON u.id = c.created_by
     ${where}
     ORDER BY c.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    data: rows.map((r) => ({
      id:              r.id,
      code:            r.code,
      discount_type:   r.discount_type,
      discount_value:  parseFloat(r.discount_value),
      max_uses:        r.max_uses,
      current_uses:    r.current_uses,
      remaining_uses:  r.remaining_uses,
      valid_from:      r.valid_from,
      valid_to:        r.valid_to,
      description:     r.description,
      is_active:       !!r.is_active,
      is_exhausted:    r.current_uses >= r.max_uses,
      created_by:      r.created_by_name,
      created_at:      r.created_at,
    })),
    meta: {
      total:       parseInt(total),
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    },
  });
}

async function apply(req, res) {
  const { code, original_price } = req.body;

  if (!code || original_price === undefined) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'code and original_price are required' },
    });
  }

  const upperCode = code.trim().toUpperCase();

  const [[coupon]] = await pool.query(
    `SELECT id, uuid, code, discount_type, discount_value, max_uses, current_uses,
       valid_from, valid_to, is_active
     FROM coupons WHERE code = ? AND is_active = 1 AND current_uses < max_uses`,
    [upperCode]
  );

  if (!coupon) {
    return res.status(404).json({
      success: false,
      error: { code: 'INVALID_COUPON', message: 'كود الخصم غير صحيح أو تم استخدامه مسبقاً / Invalid or used coupon code' },
    });
  }

  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'COUPON_NOT_STARTED',
        message: `This coupon is valid from ${new Date(coupon.valid_from).toLocaleDateString()}`,
      },
    });
  }
  if (coupon.valid_to && new Date(coupon.valid_to) < now) {
    return res.status(400).json({
      success: false,
      error: { code: 'COUPON_EXPIRED', message: 'This coupon has expired' },
    });
  }

  const price = parseFloat(original_price);
  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = (price * parseFloat(coupon.discount_value)) / 100;
  } else {
    discountAmount = parseFloat(coupon.discount_value);
  }

  discountAmount = Math.min(discountAmount, price);
  const finalPrice = Math.max(0, price - discountAmount);

  res.json({
    success: true,
    coupon: {
      code:           coupon.code,
      discount_type:  coupon.discount_type,
      discount_value: parseFloat(coupon.discount_value),
      remaining_uses: coupon.max_uses - coupon.current_uses - 1,
    },
    original_price:  price,
    discount_amount: Math.round(discountAmount * 100) / 100,
    final_price:     Math.round(finalPrice * 100) / 100,
    currency:        'SAR',
  });
}

async function redeem(req, res) {
  const { code, appointment_id } = req.body;

  if (!code || !appointment_id) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'code and appointment_id are required' },
    });
  }

  const upperCode = code.trim().toUpperCase();

  const [[appt]] = await pool.query(
    'SELECT id, client_id, price, coupon_id FROM appointments WHERE uuid = ?',
    [appointment_id]
  );

  if (!appt) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Appointment not found' },
    });
  }

  if (appt.coupon_id) {
    return res.status(400).json({
      success: false,
      error: { code: 'ALREADY_APPLIED', message: 'A coupon has already been applied to this appointment' },
    });
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const [[coupon]] = await conn.query(
      `SELECT id, discount_type, discount_value, max_uses, current_uses, is_active, valid_to
       FROM coupons WHERE code = ? FOR UPDATE`,
      [upperCode]
    );

    if (!coupon || !coupon.is_active) {
      await conn.rollback();
      return res.status(400).json({ success: false, error: { code: 'INVALID_COUPON', message: 'Coupon not found or inactive' } });
    }

    if (coupon.current_uses >= coupon.max_uses) {
      await conn.rollback();
      return res.status(400).json({ success: false, error: { code: 'COUPON_EXHAUSTED', message: 'Coupon usage limit reached' } });
    }

    if (coupon.valid_to && new Date(coupon.valid_to) < new Date()) {
      await conn.rollback();
      return res.status(400).json({ success: false, error: { code: 'COUPON_EXPIRED', message: 'Coupon has expired' } });
    }

    const originalPrice = parseFloat(appt.price);
    let discountAmount = coupon.discount_type === 'percentage'
      ? (originalPrice * parseFloat(coupon.discount_value)) / 100
      : parseFloat(coupon.discount_value);

    discountAmount = Math.min(discountAmount, originalPrice);
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    await conn.query(
      'UPDATE appointments SET price = ?, coupon_id = ? WHERE id = ?',
      [finalPrice, coupon.id, appt.id]
    );

    await conn.query(
      'UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ?',
      [coupon.id]
    );

    await conn.query(
      `INSERT INTO coupon_usage (coupon_id, user_id, appointment_id, original_price, discount_amount, final_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [coupon.id, appt.client_id, appt.id, originalPrice, discountAmount, finalPrice]
    );

    await conn.commit();

    res.json({
      success: true,
      message:         'Coupon applied successfully',
      original_price:  originalPrice,
      discount_amount: Math.round(discountAmount * 100) / 100,
      final_price:     Math.round(finalPrice * 100) / 100,
      currency:        'SAR',
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function deactivate(req, res) {
  const { id } = req.params;
  const [result] = await pool.query(
    'UPDATE coupons SET is_active = 0 WHERE (uuid = ? OR id = ?)',
    [id, id]
  );
  if (!result.affectedRows) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Coupon not found' } });
  }
  res.json({ success: true, message: 'Coupon deactivated' });
}

async function activate(req, res) {
  const { id } = req.params;
  const [result] = await pool.query(
    'UPDATE coupons SET is_active = 1 WHERE (uuid = ? OR id = ?)',
    [id, id]
  );
  if (!result.affectedRows) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Coupon not found' } });
  }
  res.json({ success: true, message: 'Coupon activated' });
}

async function getStats(req, res) {
  const { id } = req.params;

  const [[coupon]] = await pool.query(
    `SELECT uuid, code, discount_type, discount_value, max_uses, current_uses, is_active
     FROM coupons WHERE (uuid = ? OR id = ?)`,
    [id, id]
  );

  if (!coupon) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Coupon not found' } });
  }

  const [usage] = await pool.query(
    `SELECT
       cu.id, cu.original_price, cu.discount_amount, cu.final_price, cu.used_at,
       u.full_name AS client_name, u.phone AS client_phone,
       a.uuid AS appointment_uuid
     FROM coupon_usage cu
     JOIN users u ON u.id = cu.user_id
     JOIN appointments a ON a.id = cu.appointment_id
     WHERE cu.coupon_id = (SELECT id FROM coupons WHERE (uuid = ? OR id = ?))
     ORDER BY cu.used_at DESC`,
    [id, id]
  );

  const [[totals]] = await pool.query(
    `SELECT
       COALESCE(SUM(discount_amount), 0) AS total_discount_given,
       COALESCE(SUM(final_price), 0)     AS total_revenue_after_discount
     FROM coupon_usage
     WHERE coupon_id = (SELECT id FROM coupons WHERE (uuid = ? OR id = ?))`,
    [id, id]
  );

  res.json({
    coupon: {
      ...coupon,
      remaining_uses:  coupon.max_uses - coupon.current_uses,
      is_exhausted:    coupon.current_uses >= coupon.max_uses,
    },
    stats: {
      total_times_used:             coupon.current_uses,
      total_discount_given:         parseFloat(totals.total_discount_given),
      total_revenue_after_discount: parseFloat(totals.total_revenue_after_discount),
    },
    usage_history: usage,
  });
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
      const [[coupon]] = await conn.query('SELECT id, code FROM coupons WHERE (uuid = ? OR id = ?)', [id, id]);
      if (!coupon) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Coupon not found' } });
      }

      await conn.query('DELETE FROM coupon_usage WHERE coupon_id = ?', [coupon.id]).catch(() => {});
      await conn.query('DELETE FROM coupons WHERE id = ?', [coupon.id]);

      await conn.commit();
      conn.release();

      res.json({ success: true, message: `Coupon "${coupon.code}" deleted successfully` });
    } catch (err) {
      await conn.rollback();
      conn.release();
      throw err;
    }
  } catch (err) {
    console.error('Delete coupon error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

module.exports = { create, getAll, apply, redeem, deactivate, activate, getStats, remove };
