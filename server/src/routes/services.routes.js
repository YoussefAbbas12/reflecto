const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/services.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.get('/', getAll);
router.post('/', requireAuth, requireRole('admin'), create);
router.put('/:id', requireAuth, requireRole('admin'), update);
router.delete('/:id', requireAuth, requireRole('admin'), remove);

module.exports = router;

