const express = require('express');
const router = express.Router();
const { getMe, getMyPayments, getMyVehicles, addMyVehicle, changePassword } = require('../controllers/me.controller');
const { redeemPoints, transferPoints } = require('../controllers/loyalty.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.use(requireAuth);

router.get('/', getMe);
router.get('/payments', getMyPayments);
router.get('/vehicles', getMyVehicles);
router.post('/vehicles', addMyVehicle);
router.post('/change-password', changePassword);

router.post('/loyalty/redeem',   requireRole('client'), redeemPoints);
router.post('/loyalty/transfer', requireRole('client'), transferPoints);

module.exports = router;
