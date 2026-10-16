const express = require('express');
const router = express.Router();
const {
  getAssignedOrders,
  updateServiceProgress,
  getCompletedHistory,
  getTechnicianCommissions,
  getTechnicianCommissionsByAdmin
} = require('../controllers/technician.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.use(requireAuth, requireRole('technician', 'admin'));

router.get('/work-orders', getAssignedOrders);
router.put('/work-orders/:id/progress', updateServiceProgress);
router.get('/history', getCompletedHistory);

// Technician commissions routes
router.get('/commissions', getTechnicianCommissions);
router.get('/technicians/:id/commissions', requireRole('admin'), getTechnicianCommissionsByAdmin);

module.exports = router;

