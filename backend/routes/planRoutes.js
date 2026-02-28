const express = require('express');
const router = express.Router();
const { getPlans, createPlan, seedPlans } = require('../controllers/planController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getPlans);
router.post('/', protect, authorize('superadmin'), createPlan);
router.post('/seed', protect, authorize('superadmin'), seedPlans);

module.exports = router;
