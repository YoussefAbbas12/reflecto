const express = require('express');
const router = express.Router();
const {
  getAll,
  getOne,
  create,
  update,
  remove,
  resetPassword,
  awardPoints,
  activateWarranties,
  search,
  getTechnicians,
  getCompanyIcons,
  uploadCompanyIcon
} = require('../controllers/clients.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { requirePermission } = require('../middleware/requirePermission');

router.use(requireAuth);
router.get('/technicians', getTechnicians);
router.get('/company-icons', getCompanyIcons);
router.post('/company-icons/upload', uploadCompanyIcon);

router.use(requireRole('admin'));

router.get('/search', requirePermission('view_clients'), search);
router.get('/',       requirePermission('view_clients'), getAll);
router.post('/',      requirePermission('create_client'), create);
router.get('/:id',    requirePermission('view_client_details'), getOne);
router.put('/:id',    requirePermission('edit_client'), update);
router.delete('/:id', requirePermission('delete_client'), remove);

router.post('/:id/reset-password',     requirePermission('edit_client'), resetPassword);
router.post('/:id/award-points',       requirePermission('edit_client'), awardPoints);
router.post('/:id/activate-warranties', requirePermission('edit_client'), activateWarranties);

module.exports = router;
