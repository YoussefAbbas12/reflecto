const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/requirePermission');

router.use(requireAuth, requirePermission('manage_permissions'));

router.get('/', rolesController.getAllRoles);
router.post('/', rolesController.createRole);
router.put('/:id', rolesController.updateRole);
router.delete('/:id', rolesController.deleteRole);
router.put('/user/:userId', rolesController.updateUserPermissions);

module.exports = router;
