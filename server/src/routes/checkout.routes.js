const express = require('express');
const router = express.Router();
const { createTabbySession, createTamaraSession, testCheckout, getAllPayments, confirmPayment } = require('../controllers/checkout.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.get('/',        requireAuth, requireRole('admin'), getAllPayments);
router.post('/tabby',  optionalAuth, createTabbySession);
router.post('/tamara', optionalAuth, createTamaraSession);
router.post('/test',   optionalAuth, testCheckout);
router.post('/confirm', optionalAuth, confirmPayment);

module.exports = router;