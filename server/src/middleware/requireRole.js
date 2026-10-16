function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'NOT_AUTHENTICATED', message: 'Authentication required' },
      });
    }
    const isStaff = req.user.role === 'admin' || req.user.role === 'super_admin' || Boolean(req.user.is_super_admin) || Boolean(req.user.role_id) || (req.user.role && req.user.role !== 'client' && req.user.role !== 'technician');

    if (roles.includes('admin') && isStaff) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role: ${roles.join(' or ')}`,
          your_role: req.user.role,
        },
      });
    }
    next();
  };
}

module.exports = { requireRole };
