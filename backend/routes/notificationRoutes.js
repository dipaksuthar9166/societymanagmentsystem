const express = require('express');
const router = express.Router();
const { sendReminder, getSystemNotifications, markAsRead } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/remind', protect, authorize('admin'), sendReminder);
router.get('/', protect, getSystemNotifications);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
