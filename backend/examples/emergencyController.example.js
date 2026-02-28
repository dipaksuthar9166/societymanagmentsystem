// Example: Emergency/SOS Controller with Activity Logging

const { logActivity } = require('../utils/activityLogger');

// @desc    Trigger SOS Alert
// @route   POST /api/emergency/sos
exports.triggerSOS = async (req, res) => {
    try {
        const { message, location } = req.body;

        // ✅ LOG CRITICAL EMERGENCY ALERT
        await logActivity({
            userId: req.user._id,
            societyId: req.user.society,
            action: 'SOS_TRIGGERED',
            category: 'CRITICAL', // This will trigger browser notification!
            description: `🚨 EMERGENCY SOS from ${req.user.flatNumber} - ${message || 'Immediate assistance required'}`,
            metadata: {
                flatNumber: req.user.flatNumber,
                userName: req.user.name,
                userPhone: req.user.phone,
                message,
                location: location || req.user.flatNumber,
                timestamp: new Date(),
                priority: 'URGENT'
            },
            req
        });

        // Send WhatsApp/SMS to admin (if integrated)
        // await sendWhatsAppAlert(adminPhone, `Emergency from ${req.user.flatNumber}`);

        // Emit real-time alert to all admins
        if (global.io) {
            global.io.to(`society_${req.user.society}`).emit('criticalAlert', {
                type: 'SOS',
                from: req.user.flatNumber,
                message,
                timestamp: new Date()
            });
        }

        res.json({
            message: 'SOS alert sent successfully',
            alertId: 'SOS_' + Date.now()
        });
    } catch (error) {
        console.error('SOS trigger error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Report Emergency
// @route   POST /api/emergency/report
exports.reportEmergency = async (req, res) => {
    try {
        const { type, description, severity } = req.body;
        // type: 'Fire', 'Medical', 'Security', 'Other'
        // severity: 'Low', 'Medium', 'High', 'Critical'

        const category = severity === 'Critical' || severity === 'High' ? 'CRITICAL' : 'WARNING';

        // ✅ LOG EMERGENCY REPORT
        await logActivity({
            userId: req.user._id,
            societyId: req.user.society,
            action: 'EMERGENCY_ALERT',
            category,
            description: `🚨 ${type} Emergency reported by ${req.user.name} (${req.user.flatNumber})`,
            metadata: {
                emergencyType: type,
                severity,
                description,
                flatNumber: req.user.flatNumber,
                userName: req.user.name,
                userPhone: req.user.phone,
                timestamp: new Date()
            },
            req
        });

        // If critical, send immediate notifications
        if (category === 'CRITICAL') {
            // Send push notifications, WhatsApp, etc.
            if (global.io) {
                global.io.to(`society_${req.user.society}`).emit('criticalAlert', {
                    type: 'EMERGENCY',
                    emergencyType: type,
                    from: req.user.flatNumber,
                    severity,
                    description
                });
            }
        }

        res.json({
            message: 'Emergency reported successfully',
            severity,
            responseTime: 'Immediate'
        });
    } catch (error) {
        console.error('Emergency report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
