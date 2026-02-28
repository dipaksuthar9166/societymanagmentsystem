const ActivityLog = require('../models/ActivityLog');

/**
 * Log user activity to database
 * @param {Object} params - Activity parameters
 * @param {String} params.userId - User ID
 * @param {String} params.societyId - Society ID
 * @param {String} params.action - Action type (from enum)
 * @param {String} params.category - Category: INFO, SUCCESS, WARNING, CRITICAL
 * @param {String} params.description - Human-readable description
 * @param {Object} params.metadata - Additional data
 * @param {Object} params.req - Express request object (optional)
 */
const logActivity = async ({
    userId,
    societyId,
    action,
    category = 'INFO',
    description,
    metadata = {},
    req = null
}) => {
    try {
        const activityData = {
            user: userId,
            society: societyId,
            action,
            category,
            description,
            metadata
        };

        // Extract IP and User Agent if request object is provided
        if (req) {
            activityData.ipAddress = req.ip || req.connection.remoteAddress;
            activityData.userAgent = req.get('user-agent');
        }

        const activity = await ActivityLog.create(activityData);

        // Fetch populated user details for realtime update
        const userDetails = await require('../models/User').findById(userId).select('name flatNo email role');

        // Emit real-time event via Socket.io (if available)
        if (global.io) {
            // Determine Society Room ID (some legacies might use different room formats, enforcing society_ID)
            const roomName = societyId.toString(); // or `society_${societyId}` - verify with server.js

            // In server.js line 155: socket.join(`society_${societyId}`);
            // But line 160: socket.join(societyId);
            // We should ideally emit to both or standarize. Let's emit to `society_${societyId}` as per server.js line 155 logic, 
            // but wait, server.js line 156 logs joined society_${societyId}.
            // However, line 161 joins societyId directly.
            // Let's emit to the direct ID as frontend joins that potentially?
            // Re-checking LiveActivityFeed.jsx: socketRef.current.emit('joinSociety', societyId);
            // server.js: socket.join(`society_${societyId}`);

            global.io.to(`society_${societyId}`).emit('newActivity', {
                _id: activity._id,
                user: userDetails ? {
                    name: userDetails.name,
                    flatNumber: userDetails.flatNo, // Frontend expects flatNumber or checks flatNo logic
                    email: userDetails.email,
                    role: userDetails.role
                } : null,
                action,
                category,
                description,
                metadata,
                createdAt: activity.createdAt,
                isRead: false
            });
        }

        return activity;
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw error to prevent breaking main flow
        return null;
    }
};

/**
 * Get recent activities for a society
 */
const getRecentActivities = async (societyId, limit = 50, category = null) => {
    try {
        const query = { society: societyId };
        if (category) {
            query.category = category;
        }

        const activities = await ActivityLog.find(query)
            .populate('user', 'name email role flatNumber')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return activities;
    } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
};

/**
 * Mark activities as read
 */
const markAsRead = async (activityIds) => {
    try {
        await ActivityLog.updateMany(
            { _id: { $in: activityIds } },
            { $set: { isRead: true } }
        );
        return true;
    } catch (error) {
        console.error('Error marking activities as read:', error);
        return false;
    }
};

/**
 * Get unread count
 */
const getUnreadCount = async (societyId) => {
    try {
        const count = await ActivityLog.countDocuments({
            society: societyId,
            isRead: false
        });
        return count;
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
};

module.exports = {
    logActivity,
    getRecentActivities,
    markAsRead,
    getUnreadCount
};
