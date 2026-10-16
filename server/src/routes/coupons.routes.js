const express = require('express');
const router = express.Router();
const { create, getAll, apply, redeem, deactivate, activate, getStats, remove } = require('../controllers/coupons.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { requirePermission } = require('../middleware/requirePermission');

// Public — العميل يتحقق من الكوبون قبل الشراء
router.post('/apply', requireAuth, apply);

// العميل يطبّق الكوبون على موعد محدد (يُثبّت الخصم ويُسجّل الاستخدام)
router.post('/redeem', requireAuth, redeem);

// Admin فقط مع صلاحية manage_coupons
router.get('/',                requireAuth, requireRole('admin'), requirePermission('manage_coupons'), getAll);
router.post('/',               requireAuth, requireRole('admin'), requirePermission('manage_coupons'), create);
router.get('/:id/stats',       requireAuth, requireRole('admin'), requirePermission('manage_coupons'), getStats);
router.put('/:id/deactivate',  requireAuth, requireRole('admin'), requirePermission('manage_coupons'), deactivate);
router.put('/:id/activate',    requireAuth, requireRole('admin'), requirePermission('manage_coupons'), activate);
router.delete('/:id',          requireAuth, requireRole('admin'), requirePermission('manage_coupons'), remove);

module.exports = router;
