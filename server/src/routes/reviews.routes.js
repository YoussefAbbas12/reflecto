const express = require('express');
const router = express.Router();
const { submitReview, getMyReviews, getAdminReviews } = require('../controllers/reviews.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.use(requireAuth);

// Client Endpoints
router.post('/submit', requireRole('client'), submitReview);
router.get('/my-reviews', requireRole('client'), getMyReviews);

// Admin Endpoints
router.get('/admin', requireRole('admin'), getAdminReviews);

module.exports = router;
