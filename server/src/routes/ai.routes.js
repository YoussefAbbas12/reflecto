const express = require('express');
const router = express.Router();
const { getSystemPrompt, updateSystemPrompt, chatCompletion } = require('../controllers/ai.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { requirePermission } = require('../middleware/requirePermission');

// Public customer endpoint to chat with AI Assistant
router.post('/chat', optionalAuth, chatCompletion);

// Admin endpoints for prompt management
router.get('/prompt', requireAuth, requireRole('admin'), requirePermission('manage_ai'), getSystemPrompt);
router.put('/prompt', requireAuth, requireRole('admin'), requirePermission('manage_ai'), updateSystemPrompt);

module.exports = router;
