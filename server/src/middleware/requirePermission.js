function requirePermission(permKey) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'NOT_AUTHENTICATED', message: 'Authentication required' },
      });
    }

    // Only Super Admin bypasses permission checks
    const isSuperAdmin = Boolean(
      req.user.is_super_admin === 1 ||
      req.user.is_super_admin === true ||
      req.user.role === 'super_admin'
    );
    if (isSuperAdmin) {
      return next();
    }

    let userPerms = {};
    if (req.user.permissions) {
      try {
        userPerms = typeof req.user.permissions === 'string'
          ? JSON.parse(req.user.permissions)
          : req.user.permissions;
      } catch (e) { userPerms = {}; }
    }

    if (!userPerms || !userPerms[permKey]) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_PERMISSION',
          message: `عفواً، لا تملك الصلاحية المطلوبة لهذه العملية (${permKey})`,
        },
      });
    }

    next();
  };
}

module.exports = { requirePermission };
