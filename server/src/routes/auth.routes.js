const express = require('express');
const router = express.Router();
const {
  sendOTP,
  verifyOTP,
  refreshToken,
  logout,
  login,
  sendSignupOTP,
  verifySignupOTP,
  completeSignup,
  sendResetOTP,
  verifyResetOTP,
  resetPassword
} = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/otp/send',          sendOTP);
router.post('/otp/verify',        verifyOTP);
router.post('/login',             login);
router.post('/signup/otp/send',   sendSignupOTP);
router.post('/signup/otp/verify', verifySignupOTP);
router.post('/signup/complete',   completeSignup);
router.post('/reset/otp/send',    sendResetOTP);
router.post('/reset/otp/verify',  verifyResetOTP);
router.post('/reset/password',    resetPassword);
router.post('/refresh',           refreshToken);
router.post('/logout',            requireAuth, logout);

module.exports = router;
