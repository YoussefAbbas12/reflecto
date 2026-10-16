const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove, getNextWO, addPartialPayment, activateOrderWarranties } = require('../controllers/orders.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { requirePermission } = require('../middleware/requirePermission');

router.use(requireAuth, requireRole('admin'));

router.get('/',                    requirePermission('view_checklists'), getAll);
router.get('/next-number',         requirePermission('view_checklists'), getNextWO);
router.post('/',                   requirePermission('create_checklist'), create);
router.get('/:id',                 requirePermission('view_checklists'), getOne);
router.put('/:id',                 requirePermission('edit_checklist'), update);
router.post('/:id/partial-payment', requirePermission('edit_checklist'), addPartialPayment);
router.post('/:id/activate-warranties', requirePermission('edit_checklist'), activateOrderWarranties);
router.delete('/:id',              requirePermission('delete_checklist'), remove);

module.exports = router;
