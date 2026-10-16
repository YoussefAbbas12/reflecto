const express = require('express');
const router = express.Router();
const { submit, getAll, updateStatus } = require('../controllers/contact.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.post('/', optionalAuth, submit);

router.get('/',        requireAuth, requireRole('admin'), getAll);
router.put('/:id',     requireAuth, requireRole('admin'), updateStatus);

module.exports = router;
