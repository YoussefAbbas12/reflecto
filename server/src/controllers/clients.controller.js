const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Generates a unique role-based employee code:
 *   Technicians  → RT-0001, RT-0002, …
 *   Admins/staff → RM-0001, RM-0002, …
 */
async function generateUniqueEmployeeCode(dbPool, role) {
  const prefix = (role === 'technician') ? 'RT' : 'RM';
  const [rows] = await dbPool.query(
    `SELECT employee_code FROM users WHERE employee_code LIKE ? ORDER BY id DESC`,
    [`${prefix}-%`]
  );
  let maxNum = 0;
  for (const r of rows) {
    const match = r.employee_code?.match(new RegExp(`^${prefix}-(\\d+)$`, 'i'));
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  let nextNum = maxNum + 1;
  let nextCode = `${prefix}-${String(nextNum).padStart(4, '0')}`;
  let attempts = 0;
  while (attempts < 20) {
    const [[chk]] = await dbPool.query('SELECT id FROM users WHERE employee_code = ?', [nextCode]);
    if (!chk) return nextCode;
    nextNum++;
    nextCode = `${prefix}-${String(nextNum).padStart(4, '0')}`;
    attempts++;
  }
  return `${prefix}-${Date.now().toString().slice(-4)}`;
}

async function getAll(req, res) {
  try {
    const page  = Math.max(1, parseInt(req.query.page  || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '20'));
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;
    let branch = req.query.branch || 'all';
    const role = req.query.role || 'all';

    // Super admins see all clients across all branches; restricted branch admins see only their branch
    const isSuperAdmin = Boolean(
      req.user?.is_super_admin === 1 ||
      req.user?.is_super_admin === true ||
      req.user?.role === 'super_admin' ||
      (req.user?.role === 'admin' && req.user?.is_super_admin !== 0 && req.user?.is_super_admin !== false)
    );
    if (!isSuperAdmin) {
      branch = req.user?.branch_name || 'فرع جدة';
    }

    const whereConditions = [];
    const params = [];

    if (role === 'admin') {
      whereConditions.push(`(u.role IN ('admin', 'super_admin') OR (u.role_id IS NOT NULL AND u.role_id > 0))`);
    } else if (role === 'technician') {
      whereConditions.push(`u.role = 'technician'`);
    } else if (role === 'staff' || role === 'employee') {
      whereConditions.push(`(u.role IN ('admin', 'super_admin', 'technician', 'employee', 'staff') OR (u.role_id IS NOT NULL AND u.role_id > 0 AND u.role != 'client'))`);
    } else if (role === 'client') {
      whereConditions.push(`((u.role = 'client' OR u.role IS NULL OR u.role = '') AND (u.role_id IS NULL OR u.role_id = 0))`);
    }

    if (branch && branch !== 'all') {
      const cleanBranchName = branch.replace(/^فرع\s*/, '').trim();
      const likeBranch = `%${cleanBranchName}%`;
      whereConditions.push(`(
        u.branch_name = ? 
        OR u.branch_name LIKE ?
        OR u.phone IN (SELECT DISTINCT client_phone FROM work_orders WHERE branch_name = ? OR branch_name LIKE ?)
      )`);
      params.push(branch, likeBranch, branch, likeBranch);
    }

    if (search) {
      whereConditions.push(`(u.full_name LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR u.employee_code LIKE ?)`);
      params.push(search, search, search, search);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(DISTINCT u.id) AS total FROM users u ${whereClause}`, params
    );

    const [rows] = await pool.query(
      `SELECT
         u.id AS raw_id, u.uuid, u.full_name, u.phone, u.email, u.employee_code, u.member_since, u.is_active, u.role, u.role_id, u.permissions, u.branch_name,
         u.company_id, u.is_corporate, c.name AS company_name, c.discount_percent AS company_discount_percent,
         r.name AS role_name, r.slug AS role_slug,
         CONCAT(v.brand, ' ', v.model) AS vehicle,
         (SELECT COUNT(*) FROM appointments a WHERE a.client_id = u.id AND a.status = 'completed') AS total_services,
         COALESCE((SELECT SUM(a2.price) FROM appointments a2 WHERE a2.client_id = u.id AND a2.status = 'completed'), 0) AS total_spent,
         COALESCE(lp.total_points, 0) AS loyalty_points,
         (SELECT s.name_en FROM appointments ap JOIN services s ON s.id = ap.service_id
          WHERE ap.client_id = u.id AND ap.status = 'in_progress' LIMIT 1) AS current_service
       FROM users u
       LEFT JOIN vehicles v  ON v.client_id = u.id
       LEFT JOIN loyalty_points lp ON lp.client_id = u.id
       LEFT JOIN companies c ON c.id = u.company_id
       LEFT JOIN roles r ON r.id = u.role_id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      data: rows.map((r) => ({
        id:            r.uuid,
        raw_id:        r.raw_id,
        full_name:     r.full_name,
        phone:         r.phone,
        email:         r.email,
        employee_code: r.employee_code || null,
        role:          r.role,
        role_id:       r.role_id || null,
        role_name:     r.role_name || null,
        role_slug:     r.role_slug || null,
        permissions:   r.permissions ? (typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions) : null,
        branch_name:   r.branch_name,
        company_id:    r.company_id || null,
        company_name:  r.company_name || null,
        company_discount_percent: parseFloat(r.company_discount_percent || 0),
        is_corporate:  !!r.is_corporate,
        vehicle:       r.vehicle,
        current_service: r.current_service,
        member_since:  r.member_since,
        total_services: parseInt(r.total_services),
        total_spent:   parseFloat(r.total_spent),
        loyalty_points: parseInt(r.loyalty_points),
        is_active:     !!r.is_active,
      })),
      meta: {
        total:       parseInt(total),
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Clients getAll error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function getOne(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE (uuid = ? OR id = ?)',
      [id, id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    req.user = rows[0];
    const { getMe } = require('./me.controller');
    return getMe(req, res);
  } catch (err) {
    console.error('Clients getOne error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function create(req, res) {
  try {
    const {
      full_name, phone, email, role, password, company_id, is_corporate, branch_name,
      vehicle_type, vehicle_model, vehicle_year, vehicle_color, vehicle_plate, chassis_number, vehicles
    } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Phone number is required' } });
    }

    const normalizedPhone = String(phone).replace(/\D/g, '');
    const rawPhone = normalizedPhone.replace(/^0+/, '');
    const phoneSuffix = normalizedPhone.slice(-9);
    const [[existing]] = await pool.query(
      'SELECT id, uuid FROM users WHERE phone = ? OR phone LIKE ? LIMIT 1',
      [rawPhone, `%${phoneSuffix}`]
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'PHONE_ALREADY_REGISTERED',
          message: 'رقم الجوال مسجل بالفعل، لا يمكن إنشاء عميل آخر بنفس الرقم',
        },
      });
    }
    
    let userId = null;
    let userUuid = null;

    const targetCompId = company_id ? parseInt(company_id) : null;
    const targetIsCorp = (is_corporate || company_id) ? 1 : 0;

    let finalEmployeeCode = req.body.employee_code ? String(req.body.employee_code).trim() : null;
    if (finalEmployeeCode) {
      const [[codeExists]] = await pool.query('SELECT id FROM users WHERE employee_code = ? LIMIT 1', [finalEmployeeCode]);
      if (codeExists) {
        return res.status(409).json({ success: false, error: { code: 'EMPLOYEE_CODE_EXISTS', message: 'كود الموظف هذا مستخدم بالفعل' } });
      }
    } else if (role && role !== 'client') {
      finalEmployeeCode = await generateUniqueEmployeeCode(pool, role);
    }

    {
      const hashedPass = await bcrypt.hash(password || '00000', 10);
      const [uRes] = await pool.query(
        `INSERT INTO users (uuid, phone, full_name, email, employee_code, password, role, is_active, company_id, is_corporate, branch_name, is_super_admin, permissions, created_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, COALESCE(?, 'client'), 1, ?, ?, ?, 0, '{}', NOW())`,
        [rawPhone, full_name || 'Client', email || null, finalEmployeeCode, hashedPass, role, targetCompId, targetIsCorp, branch_name || null]
      );
      userId = uRes.insertId;
      const [[newUser]] = await pool.query('SELECT uuid FROM users WHERE id = ?', [userId]);
      userUuid = newUser.uuid;
      await pool.query('INSERT IGNORE INTO loyalty_points (client_id, total_points) VALUES (?, 0)', [userId]);
    }

    const vehicleList = Array.isArray(vehicles) && vehicles.length > 0
      ? vehicles
      : [{ brand: vehicle_type, model: vehicle_model, year: vehicle_year, color: vehicle_color, plate_number: vehicle_plate, mileage: req.body.vehicle_mileage, chassis_number }];

    for (const vehicle of vehicleList) {
      if (!vehicle?.brand && !vehicle?.model && !vehicle?.plate_number && !vehicle?.chassis_number) continue;
      await pool.query(
        `INSERT INTO vehicles (client_id, brand, model, year, color, plate, mileage, chassis_number, uuid)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID())`,
        [
          userId,
          vehicle.brand || 'Vehicle',
          vehicle.model || 'Model',
          vehicle.year || new Date().getFullYear(),
          vehicle.color || null,
          vehicle.plate_number || vehicle.plate || null,
          vehicle.mileage !== undefined && vehicle.mileage !== null && vehicle.mileage !== '' ? parseInt(vehicle.mileage) : null,
          vehicle.chassis_number || null
        ]
      );
    }

    res.json({ success: true, message: 'Client created successfully', id: userUuid });
  } catch (err) {
    console.error('Clients create error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const {
      full_name, email, phone, member_since, is_active, role,
      is_super_admin, permissions, branch_name, avatar_url,
      city, address, notes, car_brand, car_model, car_year, car_color, car_plate, car_mileage, chassis_number, is_premium,
      company_id, is_corporate, vehicles
    } = req.body;

    const updates = [];
    const queryParams = [];

    if (full_name !== undefined) { updates.push('full_name = ?'); queryParams.push(full_name || null); }
    if (email !== undefined) { updates.push('email = ?'); queryParams.push(email || null); }
    if (phone !== undefined) { updates.push('phone = ?'); queryParams.push(phone); }
    if (member_since !== undefined) { updates.push('member_since = ?'); queryParams.push(member_since); }
    if (is_active !== undefined) { updates.push('is_active = ?'); queryParams.push(is_active ? 1 : 0); }
    if (is_super_admin !== undefined) { updates.push('is_super_admin = ?'); queryParams.push(is_super_admin ? 1 : 0); }
    if (branch_name !== undefined) { updates.push('branch_name = ?'); queryParams.push(branch_name || null); }
    if (avatar_url !== undefined) { updates.push('avatar_url = ?'); queryParams.push(avatar_url || null); }
    if (city !== undefined) { updates.push('city = ?'); queryParams.push(city || null); }
    if (address !== undefined) { updates.push('address = ?'); queryParams.push(address || null); }
    if (notes !== undefined) { updates.push('notes = ?'); queryParams.push(notes || null); }
    if (req.body.employee_code !== undefined) {
      const codeVal = req.body.employee_code ? String(req.body.employee_code).trim() : null;
      if (codeVal) {
        const [[codeDup]] = await pool.query('SELECT id FROM users WHERE employee_code = ? AND uuid != ? AND id != ? LIMIT 1', [codeVal, id, id]);
        if (codeDup) {
          return res.status(409).json({ success: false, error: { code: 'EMPLOYEE_CODE_EXISTS', message: 'كود الموظف هذا مستخدم بالفعل لموظف آخر' } });
        }
      }
      updates.push('employee_code = ?');
      queryParams.push(codeVal);
    }
    if (is_premium !== undefined) { updates.push('is_premium = ?'); queryParams.push(is_premium ? 1 : 0); }
    if (company_id !== undefined) { updates.push('company_id = ?'); queryParams.push(company_id ? parseInt(company_id) : null); }
    if (is_corporate !== undefined) { updates.push('is_corporate = ?'); queryParams.push(is_corporate ? 1 : 0); }
    if (permissions !== undefined) {
      updates.push('permissions = ?');
      queryParams.push(typeof permissions === 'object' ? JSON.stringify(permissions) : permissions);
    }

    if (req.body.role_id !== undefined) {
      const targetRoleId = req.body.role_id ? parseInt(req.body.role_id) : null;
      updates.push('role_id = ?');
      queryParams.push(targetRoleId);
      if (targetRoleId && role === undefined) {
        const [[r]] = await pool.query('SELECT slug FROM roles WHERE id = ?', [targetRoleId]);
        updates.push('role = ?');
        queryParams.push(r?.slug || 'admin');
      }
    }

    if (role !== undefined) {
      if (role === 'client') {
        updates.push('role = ?', 'role_id = NULL');
        queryParams.push('client');
      } else if (role === 'technician') {
        updates.push('role = ?', 'role_id = NULL');
        queryParams.push('technician');
      } else if (role === 'admin') {
        updates.push('role = ?');
        queryParams.push('admin');
      } else {
        const [[r]] = await pool.query('SELECT id, slug FROM roles WHERE id = ? OR slug = ? OR name = ?', [role, role, role]);
        if (r) {
          updates.push('role_id = ?', 'role = ?');
          queryParams.push(r.id, r.slug || 'admin');
        } else {
          updates.push('role = ?');
          queryParams.push(role);
        }
      }
    }

    if (updates.length > 0) {
      queryParams.push(id, id);
      await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE (uuid = ? OR id = ?)`,
        queryParams
      );
    }

    // Update vehicle info if provided
    const [[u]] = await pool.query('SELECT id FROM users WHERE (uuid = ? OR id = ?)', [id, id]);
    if (u) {
      if (Array.isArray(vehicles) && vehicles.length > 0) {
        const [existingVehicles] = await pool.query('SELECT id, uuid FROM vehicles WHERE client_id = ?', [u.id]);
        const processedVehicleIds = [];

        for (const v of vehicles) {
          if (!v.brand && !v.model && !v.plate_number && !v.chassis_number) continue;

          const matchedVeh = existingVehicles.find(ev =>
            (v.id && (ev.id == v.id || ev.uuid == v.id)) ||
            (v.uuid && (ev.uuid == v.uuid || ev.id == v.uuid))
          );

          if (matchedVeh) {
            await pool.query(
              `UPDATE vehicles SET 
                 brand = COALESCE(?, brand),
                 model = COALESCE(?, model),
                 year = COALESCE(?, year),
                 color = COALESCE(?, color),
                 plate = COALESCE(?, plate),
                 mileage = COALESCE(?, mileage),
                 chassis_number = COALESCE(?, chassis_number)
               WHERE id = ?`,
              [
                v.brand || null,
                v.model || null,
                v.year || null,
                v.color || null,
                v.plate_number || v.plate || null,
                v.mileage ? parseInt(v.mileage) : null,
                v.chassis_number || null,
                matchedVeh.id
              ]
            );
            processedVehicleIds.push(matchedVeh.id);
          } else {
            const [insertRes] = await pool.query(
              `INSERT INTO vehicles (client_id, brand, model, year, color, plate, mileage, chassis_number, uuid)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID())`,
              [u.id, v.brand || 'Vehicle', v.model || 'Model', v.year || new Date().getFullYear(), v.color || null, v.plate_number || v.plate || null, v.mileage ? parseInt(v.mileage) : null, v.chassis_number || null]
            );
            processedVehicleIds.push(insertRes.insertId);
          }
        }

        for (const ev of existingVehicles) {
          if (!processedVehicleIds.includes(ev.id)) {
            try {
              await pool.query('DELETE FROM vehicles WHERE id = ?', [ev.id]);
            } catch (delErr) {
              console.warn(`Could not delete vehicle ${ev.id} due to foreign key constraints:`, delErr.message);
            }
          }
        }
      } else if (car_brand !== undefined || car_model !== undefined || car_plate !== undefined || chassis_number !== undefined) {
        const [[veh]] = await pool.query('SELECT id FROM vehicles WHERE client_id = ?', [u.id]);
        if (veh) {
          await pool.query(
            `UPDATE vehicles SET 
               brand = COALESCE(?, brand),
               model = COALESCE(?, model),
               year = COALESCE(?, year),
               color = COALESCE(?, color),
               plate = COALESCE(?, plate),
               mileage = COALESCE(?, mileage),
               chassis_number = COALESCE(?, chassis_number)
             WHERE id = ?`,
            [
              car_brand || null,
              car_model || null,
              car_year || null,
              car_color || null,
              car_plate || null,
              car_mileage ? parseInt(car_mileage) : null,
              chassis_number || null,
              veh.id
            ]
          );
        } else if (car_brand || car_model || car_plate || chassis_number) {
          await pool.query(
            `INSERT INTO vehicles (client_id, brand, model, year, color, plate, mileage, chassis_number, uuid)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, UUID())`,
            [u.id, car_brand || 'Vehicle', car_model || 'Model', car_year || new Date().getFullYear(), car_color || null, car_plate || null, car_mileage ? parseInt(car_mileage) : null, chassis_number || null]
          );
        }
      }
    }

    res.json({ success: true, message: 'Client updated successfully' });
  } catch (err) {
    console.error('Clients update error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function remove(req, res) {
  let connection;
  try {
    const { id } = req.params;
    const [[user]] = await pool.query('SELECT id FROM users WHERE (uuid = ? OR id = ?)', [id, id]);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    await connection.query('DELETE FROM warranties WHERE client_id = ?', [user.id]);
    await connection.query('DELETE FROM appointments WHERE client_id = ?', [user.id]);
    await connection.query('DELETE FROM loyalty_points WHERE client_id = ?', [user.id]);
    await connection.query('DELETE FROM vehicles WHERE client_id = ?', [user.id]);
    await connection.query('DELETE FROM users WHERE id = ?', [user.id]);
    await connection.commit();
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (err) {
    if (connection) await connection.rollback().catch(() => {});
    console.error('Clients remove error:', err);
    res.status(500).json({ success: false, error: { code: 'DELETE_FAILED', message: 'تعذر حذف العميل بسبب بيانات مرتبطة به. احذف الخدمات أو الطلبات المرتبطة أولاً.' } });
  } finally {
    connection?.release();
  }
}

async function resetPassword(req, res) {
  try {
    const { id } = req.params;
    const newPass = req.body?.new_password || '00000';
    const hashedPass = await bcrypt.hash(newPass, 10);

    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE (uuid = ? OR id = ?)',
      [hashedPass, id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function awardPoints(req, res) {
  try {
    const { id } = req.params;
    const { points, action, description } = req.body;
    const ptsNum = parseInt(points) || 0;
    if (ptsNum <= 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Points must be positive' } });
    }

    const [[user]] = await pool.query('SELECT id FROM users WHERE (uuid = ? OR id = ?)', [id, id]);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    const isSubtract = action === 'deduct' || action === 'subtract';
    const signedPoints = isSubtract ? -ptsNum : ptsNum;
    const defaultDesc = description || (isSubtract ? `خصم نقاط بواسطة الإدارة (-${ptsNum} نقاط)` : `إضافة نقاط بواسطة الإدارة (+${ptsNum} نقاط)`);
    const txType = isSubtract ? 'deducted_by_admin' : 'awarded_by_admin';

    const [[existing]] = await pool.query('SELECT total_points FROM loyalty_points WHERE client_id = ?', [user.id]);
    let newTotal = 0;
    if (existing) {
      newTotal = isSubtract ? Math.max(0, parseInt(existing.total_points || 0) - ptsNum) : parseInt(existing.total_points || 0) + ptsNum;
      await pool.query('UPDATE loyalty_points SET total_points = ? WHERE client_id = ?', [newTotal, user.id]);
    } else {
      newTotal = isSubtract ? 0 : ptsNum;
      await pool.query('INSERT INTO loyalty_points (client_id, total_points) VALUES (?, ?)', [user.id, newTotal]);
    }

    // Insert transaction log for loyalty history
    await pool.query(
      `INSERT INTO loyalty_transactions (from_user_id, to_user_id, type, points, description)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user?.id || null, user.id, txType, signedPoints, defaultDesc]
    ).catch((txErr) => console.error('Failed to log loyalty transaction:', txErr.message));

    res.json({ success: true, message: `Points updated successfully. New Total: ${newTotal}`, total_points: newTotal });
  } catch (err) {
    console.error('Award points error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function activateWarranties(req, res) {
  try {
    const { id } = req.params;
    const [[user]] = await pool.query('SELECT id FROM users WHERE (uuid = ? OR id = ?)', [id, id]);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } });
    }

    await pool.query('UPDATE warranties SET is_active = 1 WHERE client_id = ? AND (work_order_id IS NOT NULL OR appointment_id IS NOT NULL)', [user.id]);

    res.json({ success: true, message: 'Client warranties activated successfully' });
  } catch (err) {
    console.error('Activate warranties error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function search(req, res) {
  try {
    const q = req.query.q;
    const role = req.query.role;
    if (!q || q.length < 1) {
      return res.json({ success: true, data: [] });
    }
    const like = `%${q}%`;
    const params = [like, like, like, like, like, like];
    let roleWhere = '';
    if (role === 'client') {
      roleWhere = " AND (u.role = 'client' OR u.role IS NULL OR u.role = '')";
    } else if (role === 'staff' || role === 'employee') {
      roleWhere = " AND u.role IN ('admin', 'super_admin', 'technician')";
    } else if (role) {
      roleWhere = " AND u.role = ?";
      params.push(role);
    }

    const [rows] = await pool.query(
      `SELECT u.uuid, u.id, u.full_name, u.phone, u.email, u.role, u.branch_name,
         CONCAT(COALESCE(v.brand, ''), ' ', COALESCE(v.model, '')) AS vehicle,
         v.plate_number
       FROM users u
       LEFT JOIN vehicles v ON v.client_id = u.id
       WHERE (u.full_name LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR v.brand LIKE ? OR v.model LIKE ? OR v.plate_number LIKE ?)${roleWhere}
       GROUP BY u.id
       ORDER BY (CASE WHEN u.role IN ('admin', 'super_admin', 'technician') THEN 1 ELSE 2 END), u.full_name ASC
       LIMIT 25`,
      params
    );

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.uuid || r.id,
        uuid: r.uuid,
        full_name: r.full_name,
        phone: r.phone,
        email: r.email,
        role: r.role || 'client',
        branch_name: r.branch_name,
        vehicle: (r.vehicle || '').trim(),
        plate_number: r.plate_number,
      })),
    });
  } catch (err) {
    console.error('Clients search error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function getTechnicians(req, res) {
  try {
    let [rows] = await pool.query(
      `SELECT COALESCE(uuid, id) as id, full_name, phone, role FROM users WHERE role = 'technician' AND (is_active = 1 OR is_active IS NULL) ORDER BY full_name ASC`
    );
    if (!rows || rows.length === 0) {
      [rows] = await pool.query(
        `SELECT COALESCE(uuid, id) as id, full_name, phone, role FROM users WHERE role IN ('technician', 'admin', 'super_admin') AND (is_active = 1 OR is_active IS NULL) ORDER BY full_name ASC`
      );
    }
    if (!rows || rows.length === 0) {
      [rows] = await pool.query(
        `SELECT COALESCE(uuid, id) as id, full_name, phone, role FROM users WHERE (role IS NULL OR role != 'client') AND (is_active = 1 OR is_active IS NULL) ORDER BY full_name ASC`
      );
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get technicians error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function getCompanyIcons(req, res) {
  try {
    // Return empty array or default list of company icons
    res.json({ success: true, data: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

async function uploadCompanyIcon(req, res) {
  try {
    const { filename, base64 } = req.body;
    res.json({ success: true, message: 'Icon uploaded', filename });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  resetPassword,
  awardPoints,
  activateWarranties,
  search,
  getTechnicians,
  getCompanyIcons,
  uploadCompanyIcon
};
