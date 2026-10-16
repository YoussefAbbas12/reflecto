const express = require('express');
const router = express.Router();
const { getAll, create, update, cancel, remove } = require('../controllers/appointments.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

router.use(requireAuth);

router.get('/',         requireRole('admin', 'technician'), getAll);
router.post('/',        requireRole('admin'),               create);
router.put('/:id',      requireRole('admin', 'technician'), update);
router.delete('/:id',   requireRole('admin'),               remove);

module.exports = router;
