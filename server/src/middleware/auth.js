const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_TOKEN', message: 'Authorization token is required' },
    });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    const [rows] = await pool.query(
      `SELECT 
         u.id, u.uuid, u.full_name, u.phone, u.email, u.role, u.role_id, u.is_super_admin, u.branch_name, 
         u.permissions AS user_permissions, u.member_since, u.avatar_url, u.company_id, u.is_corporate,
         r.permissions AS role_permissions, r.name AS role_name, r.slug AS role_slug
       FROM users u
       LEFT JOIN roles r ON (r.id = u.role_id OR r.slug = u.role OR r.uuid = u.role)
       WHERE u.uuid = ? AND u.is_active = 1`,
      [decoded.userId]
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User account not found or deactivated' },
      });
    }

    const row = rows[0];
    let parsedRolePerms = {};
    if (row.role_permissions) {
      try { parsedRolePerms = typeof row.role_permissions === 'string' ? JSON.parse(row.role_permissions) : row.role_permissions; } catch (e) {}
    }
    let parsedUserPerms = {};
    if (row.user_permissions) {
      try { parsedUserPerms = typeof row.user_permissions === 'string' ? JSON.parse(row.user_permissions) : row.user_permissions; } catch (e) {}
    }

    const mergedPerms = {};
    const allKeys = new Set([...Object.keys(parsedRolePerms), ...Object.keys(parsedUserPerms)]);
    allKeys.forEach(k => {
      mergedPerms[k] = Boolean(parsedRolePerms[k] || parsedUserPerms[k]);
    });
    let resolvedRole = row.role;
    if (row.role_id && (!resolvedRole || resolvedRole === 'client')) {
      resolvedRole = row.role_slug || 'admin';
    }

    req.user = {
      ...row,
      role: resolvedRole,
      permissions: mergedPerms,
      user_permissions: parsedUserPerms,
      role_permissions: parsedRolePerms
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Token has expired, please login again' },
      });
    }
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid token' },
    });
  }
}

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    const [rows] = await pool.query(
      `SELECT 
         u.id, u.uuid, u.full_name, u.phone, u.email, u.role, u.role_id, u.is_super_admin, u.branch_name, 
         u.permissions AS user_permissions, u.member_since, u.avatar_url, u.company_id, u.is_corporate,
         r.permissions AS role_permissions, r.name AS role_name, r.slug AS role_slug
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.uuid = ? AND u.is_active = 1`,
      [decoded.userId]
    );

    if (rows.length) {
      const row = rows[0];
      let parsedRolePerms = {};
      if (row.role_permissions) {
        try { parsedRolePerms = typeof row.role_permissions === 'string' ? JSON.parse(row.role_permissions) : row.role_permissions; } catch (e) {}
      }
      let parsedUserPerms = {};
      if (row.user_permissions) {
        try { parsedUserPerms = typeof row.user_permissions === 'string' ? JSON.parse(row.user_permissions) : row.user_permissions; } catch (e) {}
      }
      let resolvedRole = row.role;
      if (row.role_id && (!resolvedRole || resolvedRole === 'client')) {
        resolvedRole = row.role_slug || 'admin';
      }
      req.user = {
        ...row,
        role: resolvedRole,
        permissions: { ...parsedRolePerms, ...parsedUserPerms }
      };
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
