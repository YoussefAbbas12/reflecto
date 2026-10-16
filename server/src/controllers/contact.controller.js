const { pool } = require('../config/database');

async function submit(req, res) {
  const { full_name, phone, email, car_brand, car_model, car_year,
          service_type, service_package, preferred_date, preferred_time, reason, notes } = req.body;

  if (!full_name || !phone) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'full_name and phone are required' },
    });
  }

  const [result] = await pool.query(
    `INSERT INTO contact_requests
       (full_name, phone, email, car_brand, car_model, car_year,
          service_type, service_package, preferred_date, preferred_time, notes, status, uuid)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', UUID())`,
    [full_name, phone, email || null, car_brand || null, car_model || null,
     car_year || null, service_type || null, service_package || null,
    preferred_date || null, preferred_time || null, reason || notes || null]
  );

  // Auto-accept the request by creating a User, Vehicle, and Appointment
  try {
    // 1. Find or create user
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
    } else {
      let [users] = await pool.query('SELECT id FROM users WHERE phone = ? LIMIT 1', [phone]);
      if (users.length > 0) {
        userId = users[0].id;
      } else {
        const bcrypt = require('bcryptjs');
        const defaultPassword = await bcrypt.hash('00000', 10);
        const [uRes] = await pool.query(
          `INSERT INTO users (full_name, phone, email, password, role, is_active, uuid) VALUES (?, ?, ?, ?, 'client', 1, UUID())`,
          [full_name, phone, email || null, defaultPassword]
        );
        userId = uRes.insertId;
      }
    }

    // 2. Find or create vehicle
    let [vehicles] = await pool.query('SELECT id FROM vehicles WHERE client_id = ? AND brand = ? AND model = ? LIMIT 1', [userId, car_brand, car_model]);
    let vehicleId;
    if (vehicles.length > 0) {
      vehicleId = vehicles[0].id;
    } else {
      const [vRes] = await pool.query(
        `INSERT INTO vehicles (client_id, brand, model, year, uuid) VALUES (?, ?, ?, ?, UUID())`,
        [userId, car_brand || 'Unknown', car_model || 'Unknown', car_year || new Date().getFullYear()]
      );
      vehicleId = vRes.insertId;
    }

    // 3. Find service based on service_type
    let [services] = await pool.query(
      'SELECT id FROM services WHERE uuid = ? OR id = ? OR name_en LIKE ? LIMIT 1',
      [service_type || '', service_type || '', `%${service_type || 'Wash'}%`]
    );
    let serviceId = services.length > 0 ? services[0].id : 1; // fallback to ID 1

    // 4. Create appointment with status 'confirmed' or 'pending'
    await pool.query(
      `INSERT INTO appointments 
         (client_id, vehicle_id, service_id, preferred_date, preferred_time, status, price, currency, progress, uuid)
       VALUES (?, ?, ?, ?, ?, 'confirmed', 0, 'SAR', 10, UUID())`,
      [userId, vehicleId, serviceId, preferred_date || new Date(), preferred_time || '10:00:00']
    );

  } catch (err) {
    console.error("Auto-conversion failed:", err.message);
  }

  try {
    await pool.query(
      `INSERT INTO activity_log (action, target_type, target_id, description)
       VALUES ('contact.submitted', 'contact_request', ?, 'New Contact request received')`,
      [result.insertId]
    );
  } catch (_) {}

  const [[cr]] = await pool.query('SELECT uuid FROM contact_requests WHERE id = ?', [result.insertId]);

  res.status(201).json({
    success: true,
    message: 'Your request has been automatically accepted and an appointment was booked.',
    request_id: cr.uuid,
  });
}

async function getAll(req, res) {
  const page   = Math.max(1, parseInt(req.query.page  || '1'));
  const limit  = Math.min(50, parseInt(req.query.limit || '20'));
  const offset = (page - 1) * limit;
  const status = req.query.status;

  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND status = ?'; params.push(status); }

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM contact_requests ${where}`, params
  );

  const [rows] = await pool.query(
    `SELECT uuid, full_name, phone, email, car_brand, car_model, car_year,
      service_type, service_package, preferred_date, preferred_time, notes, status, created_at
     FROM contact_requests ${where}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    data: rows,
    meta: { total: parseInt(total), page, limit, total_pages: Math.ceil(total / limit) },
  });
}

async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['new', 'contacted', 'converted', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_STATUS', message: `Status must be one of: ${validStatuses.join(', ')}` },
    });
  }

  const [result] = await pool.query(
    'UPDATE contact_requests SET status = ? WHERE uuid = ?',
    [status, id]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact request not found' } });
  }

  res.json({ success: true, message: 'Status updated', status });
}

module.exports = { submit, getAll, updateStatus };
