const { sendWhatsApp } = require('../utils/notificationService');
const { sendEmail } = require('../utils/emailService');
const User = require('../models/User');
const fs = require('fs');

// @desc    Send a manual reminder (WhatsApp/SMS)
// @route   POST /api/notifications/remind
// @access  Private (Admin)
const sendReminder = async (req, res) => {
    try {
        const { userId, type, message } = req.body;
        const societyId = req.user.company;

        if (!societyId) {
            return res.status(400).json({ message: 'User not associated with a society' });
        }

        // Validate User
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (type === 'whatsapp') {
            await sendWhatsApp(userId, societyId, message || "This is a payment reminder.");
        } else if (type === 'sms') {
            // Placeholder for SMS
            console.log(`[SMS MOCK] To: ${user.phoneNumber}, Message: ${message}`);
        } else if (type === 'legal') {
            // Placeholder for Legal Notice - could be email + whatsapp
            console.log(`[LEGAL NOTICE MOCK] Sent to ${user.email} and ${user.phoneNumber}`);
            await sendWhatsApp(userId, societyId, `[LEGAL NOTICE]: ${message}`);
        }

        res.json({ message: `${type.toUpperCase()} Reminder Sent Successfully` });
    } catch (error) {
        console.error('Reminder Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send Legal Notice via Email (with PDF attachment)
// @route   POST /api/notifications/legal
// @access  Private (Admin)
const sendLegalNotice = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const file = req.file;

        if (!userId || !file) {
            return res.status(400).json({ message: 'User ID and Legal Notice PDF are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.email) {
            return res.status(400).json({ message: 'User does not have an email address' });
        }

        // Send Email with Attachment
        const subject = 'URGENT: Legal Demand Notice - Outstanding Dues';
        const text = message || `Dear ${user.name},\n\nPlease find attached the Legal Demand Notice regarding your outstanding society dues.\n\nTreat this as urgent.\n\nRegards,\nSociety Management`;

        const attachments = [{
            filename: `Demand_Notice_${Date.now()}.pdf`,
            path: file.path // Multer saves to temp path
        }];

        const result = await sendEmail(user.email, subject, text, attachments);

        // Cleanup: Delete temp file
        if (file.path) {
            fs.unlink(file.path, (err) => { if (err) console.error("Failed to delete temp file", err); });
        }

        if (result.success) {
            res.json({ message: 'Legal Notice Email Sent Successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send email. Check credentials.' });
        }

    } catch (error) {
        console.error('Legal Notice Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get In-App Notifications
// @route   GET /api/notifications
// @access  Private
const getSystemNotifications = async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark Notification as Read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const Notification = require('../models/Notification');
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    sendReminder,
    sendLegalNotice,
    getSystemNotifications,
    markAsRead
};
