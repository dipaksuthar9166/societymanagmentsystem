const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getPublicConfig, updateConfig } = require('../controllers/configController');

// Public route to get theme/maintenance status
router.get('/public', getPublicConfig);

// Admin route to update settings
// Note: In strict multi-tenant, this should be super-admin or tied to society (using Company model).
// For this project scope, we allow 'admin' role to change global config.
router.put('/', protect, authorize('admin'), updateConfig);

module.exports = router;
