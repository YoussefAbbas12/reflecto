const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companies.controller');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/requirePermission');

router.use(requireAuth);

router.get('/', requirePermission('view_companies'), companiesController.getAll);
router.get('/:id', requirePermission('view_companies'), companiesController.getOne);
router.post('/', requirePermission('manage_companies'), companiesController.create);
router.put('/:id', requirePermission('manage_companies'), companiesController.update);
router.delete('/:id', requirePermission('manage_companies'), companiesController.remove);

module.exports = router;

