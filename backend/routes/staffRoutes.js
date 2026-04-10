const express = require('express');
const router = express.Router();
const { getStaffList, addStaffMember, toggleStaffStatus, verifyStaff } = require('../controllers/dailyHelpController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getStaffList)
    .post(protect, addStaffMember);

router.patch('/:id/entry', protect, toggleStaffStatus);
router.patch('/:id/verify', protect, authorize('admin', 'superadmin'), verifyStaff);

module.exports = router;
