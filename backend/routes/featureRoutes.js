const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const { getSkills, addSkill, getPendingSkills, updateSkillStatus } = require('../controllers/skillController');
const { getSlots, bookSlot, getMyBookings, toggleSlotStatus } = require('../controllers/parkingController');

// Skill Routes
router.get('/skills', protect, getSkills);
router.post('/skills', protect, addSkill);
router.get('/skills/admin/pending', protect, authorize('admin', 'superadmin'), getPendingSkills);
router.put('/skills/:id/status', protect, authorize('admin', 'superadmin'), updateSkillStatus);

// Parking Routes
router.get('/parking/slots', protect, getSlots);
router.post('/parking/book', protect, bookSlot);
router.get('/parking/my-bookings', protect, getMyBookings);
router.put('/parking/slots/:id/toggle', protect, authorize('guard', 'admin', 'superadmin'), toggleSlotStatus);

module.exports = router;
