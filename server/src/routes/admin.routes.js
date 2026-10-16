const express = require('express');
const router = express.Router();
const { overview } = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.use(requireAuth, requireRole('admin'));

router.get('/overview',    overview);

module.exports = router;