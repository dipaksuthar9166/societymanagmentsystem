const express = require('express');
const router = express.Router();
const { getComplaints, createComplaint, updateComplaintStatus, deleteComplaint } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getComplaints)
    .post(protect, authorize('user', 'employee', 'admin'), createComplaint);

router.route('/:id')
    .put(protect, authorize('admin', 'employee'), updateComplaintStatus)
    .delete(protect, authorize('admin', 'employee'), deleteComplaint);

module.exports = router;
