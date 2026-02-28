const express = require('express');
const router = express.Router();
const {
    assignRole, removeRole, getCommittee, createCommitteeMember,
    getMeetings, createMeeting,
    getVendors, createVendor,
    getPolls, createPoll, votePoll
} = require('../controllers/committeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getCommittee);
router.post('/create', protect, authorize('admin', 'superadmin'), createCommitteeMember);
router.post('/assign', protect, authorize('admin', 'superadmin'), assignRole);
router.post('/remove', protect, authorize('admin', 'superadmin'), removeRole);

// Meetings
router.get('/meetings', protect, getMeetings);
router.post('/meetings', protect, authorize('chairman', 'admin'), createMeeting);

// Vendors
router.get('/vendors', protect, getVendors);
router.post('/vendors', protect, authorize('secretary', 'admin'), createVendor);

// Polls
router.get('/polls', protect, getPolls);
router.post('/polls', protect, authorize('chairman', 'secretary', 'treasurer', 'admin'), createPoll);
router.post('/polls/:id/vote', protect, votePoll);

module.exports = router;
