const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getRecentActivities, markAsRead, getUnreadCount } = require('../utils/activityLogger');

/**
 * @route   GET /api/activities
 * @desc    Get recent activities for admin
 * @access  Admin only
 */
router.get('/', protect, authorize('Admin', 'admin', 'superadmin'), async (req, res) => {
    try {
        const { limit = 50, category } = req.query;
        const societyId = req.user.company || req.user.society;

        if (!societyId) {
            return res.status(400).json({ message: 'Society ID not found' });
        }

        const activities = await getRecentActivities(
            societyId,
            parseInt(limit),
            category
        );

        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/activities/unread-count
 * @desc    Get unread activity count
 * @access  Admin only
 */
router.get('/unread-count', protect, authorize('Admin', 'admin', 'superadmin'), async (req, res) => {
    try {
        const societyId = req.user.company || req.user.society;

        if (!societyId) {
            return res.status(400).json({ message: 'Society ID not found' });
        }

        const count = await getUnreadCount(societyId);

        res.json({ count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/activities/mark-read
 * @desc    Mark activities as read
 * @access  Admin only
 */
router.post('/mark-read', protect, authorize('Admin', 'admin', 'superadmin'), async (req, res) => {
    try {
        const { activityIds } = req.body;

        if (!activityIds || !Array.isArray(activityIds)) {
            return res.status(400).json({ message: 'Invalid activity IDs' });
        }

        await markAsRead(activityIds);

        res.json({ message: 'Activities marked as read' });
    } catch (error) {
        console.error('Error marking activities as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
