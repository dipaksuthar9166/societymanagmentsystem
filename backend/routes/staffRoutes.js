const express = require('express');
const router = express.Router();
const { getStaffList, addStaffMember, toggleStaffStatus, verifyStaff } = require('../controllers/dailyHelpController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getStaffList)
    .post(protect, addStaffMember);

router.patch('/:id/entry', protect, toggleStaffStatus);
router.patch('/:id/verify', protect, admin, verifyStaff);

module.exports = router;
