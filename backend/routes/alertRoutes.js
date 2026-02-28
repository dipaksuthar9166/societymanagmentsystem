const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { protect } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/activityLogger');

// Get Alerts for Admin's Society
router.get('/', protect, async (req, res) => {
    try {
        const societyId = req.user.company || req.user._id; // Adjust based on admin model
        // Fetch alerts where societyId matches
        const alerts = await Alert.find({ societyId: societyId }).sort({ createdAt: -1 }).limit(50);
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Resolve Alert
router.patch('/:id/resolve', protect, async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { status: 'Resolved', resolvedBy: req.user._id },
            { new: true }
        );

        // ✅ LOG ALERT RESOLUTION
        if (alert && req.user.company) {
            await logActivity({
                userId: req.user._id,
                societyId: req.user.company,
                action: 'EMERGENCY_ALERT',
                category: 'SUCCESS',
                description: `✅ ${req.user.name} resolved emergency alert from ${alert.userName}`,
                metadata: {
                    alertId: alert._id,
                    alertType: alert.type,
                    userName: alert.userName
                },
                req
            });
        }

        res.json(alert);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
