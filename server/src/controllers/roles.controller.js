const { pool } = require('../config/database');

/**
 * Get all defined dynamic roles
 */
async function getAllRoles(req, res) {
  try {
    const [roles] = await pool.query('SELECT * FROM roles ORDER BY name ASC');
    const formatted = roles.map(r => ({
      ...r,
      permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions || '{}') : (r.permissions || {})
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('getAllRoles error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Create a new dynamic role
 */
async function createRole(req, res) {
  try {
    const { name, description, permissions } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'اسم الدور مطلوب' } });
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '') || `role_${Date.now()}`;
    const permsJson = JSON.stringify(permissions || {});

    const [result] = await pool.query(
      `INSERT INTO roles (uuid, name, slug, description, permissions, created_at)
       VALUES (UUID(), ?, ?, ?, ?, NOW())`,
      [name.trim(), slug, description || null, permsJson]
    );

    const [[newRole]] = await pool.query('SELECT * FROM roles WHERE id = ?', [result.insertId]);

    res.json({
      success: true,
      message: 'تم إضافة الدور بنجاح',
      data: {
        ...newRole,
        permissions: typeof newRole.permissions === 'string' ? JSON.parse(newRole.permissions || '{}') : (newRole.permissions || {})
      }
    });
  } catch (err) {
    console.error('createRole error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Update an existing dynamic role
 */
async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const [[role]] = await pool.query('SELECT * FROM roles WHERE id = ? OR uuid = ?', [id, id]);
    if (!role) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'الدور غير موجود' } });
    }

    const permsJson = permissions !== undefined ? JSON.stringify(permissions) : role.permissions;

    await pool.query(
      `UPDATE roles SET 
         name = COALESCE(?, name),
         description = COALESCE(?, description),
         permissions = ?
       WHERE id = ?`,
      [name ? name.trim() : null, description !== undefined ? description : null, permsJson, role.id]
    );

    const [[updated]] = await pool.query('SELECT * FROM roles WHERE id = ?', [role.id]);

    res.json({
      success: true,
      message: 'تم تحديث الدور بنجاح',
      data: {
        ...updated,
        permissions: typeof updated.permissions === 'string' ? JSON.parse(updated.permissions || '{}') : (updated.permissions || {})
      }
    });
  } catch (err) {
    console.error('updateRole error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Delete dynamic role
 */
async function deleteRole(req, res) {
  try {
    const { id } = req.params;
    const [[role]] = await pool.query('SELECT id FROM roles WHERE id = ? OR uuid = ?', [id, id]);
    if (role) {
      await pool.query('UPDATE users SET role_id = NULL WHERE role_id = ?', [role.id]);
      await pool.query('DELETE FROM roles WHERE id = ?', [role.id]);
    }
    res.json({ success: true, message: 'تم حذف الدور بنجاح' });
  } catch (err) {
    console.error('deleteRole error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

/**
 * Update individual user permissions override
 */
async function updateUserPermissions(req, res) {
  try {
    const { userId } = req.params;
    const { permissions, role_id, role } = req.body;

    const [[user]] = await pool.query('SELECT id, role FROM users WHERE id = ? OR uuid = ?', [userId, userId]);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'المستخدم غير موجود' } });
    }

    const updates = [];
    const params = [];

    if (permissions !== undefined) {
      updates.push('permissions = ?');
      params.push(typeof permissions === 'object' ? JSON.stringify(permissions) : permissions);
      if (user.role === 'client') {
        updates.push('role = ?');
        params.push('admin');
      }
    }

    if (role_id !== undefined) {
      const parsedRoleId = role_id ? parseInt(role_id) : null;
      updates.push('role_id = ?');
      params.push(parsedRoleId);
      if (parsedRoleId) {
        const [[r]] = await pool.query('SELECT slug FROM roles WHERE id = ?', [parsedRoleId]);
        const targetRole = r?.slug || 'admin';
        updates.push('role = ?');
        params.push(targetRole);
      }
    }

    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length > 0) {
      params.push(user.id);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    res.json({ success: true, message: 'تم حفظ صلاحيات المستخدم بنجاح' });
  } catch (err) {
    console.error('updateUserPermissions error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

module.exports = {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  updateUserPermissions
};
