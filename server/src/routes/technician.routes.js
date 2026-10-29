const express = require('express');
const router = express.Router();
const {
  getAssignedOrders,
  updateServiceProgress,
  getCompletedHistory,
  getTechnicianCommissions,
  getTechnicianCommissionsByAdmin,
  claimWorkOrder,
  getTodayAttendance,
  getAttendanceMonth,
  punchAttendance
} = require('../controllers/technician.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.use(requireAuth, requireRole('technician', 'admin'));

// Work orders & tasks
router.get('/work-orders', getAssignedOrders);
router.post('/work-orders/:id/claim', claimWorkOrder);
router.put('/work-orders/:id/progress', updateServiceProgress);
router.get('/history', getCompletedHistory);

// Attendance
router.get('/attendance/today', getTodayAttendance);
router.get('/attendance/month', getAttendanceMonth);
router.post('/attendance/punch', punchAttendance);

// Technician commissions routes
router.get('/commissions', getTechnicianCommissions);
router.get('/technicians/:id/commissions', requireRole('admin'), getTechnicianCommissionsByAdmin);

module.exports = router;
