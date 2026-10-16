const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/pricing.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { requirePermission } = require('../middleware/requirePermission');

router.get('/', optionalAuth, getAll);

router.post('/',       requireAuth, requireRole('admin'), requirePermission('manage_packages'), create);
router.put('/:id',     requireAuth, requireRole('admin'), requirePermission('manage_packages'), update);
router.delete('/:id',  requireAuth, requireRole('admin'), requirePermission('manage_packages'), remove);

module.exports = router;
