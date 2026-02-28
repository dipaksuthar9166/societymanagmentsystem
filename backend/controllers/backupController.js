const User = require('../models/User');
const Company = require('../models/Company');
const ActivityLog = require('../models/ActivityLog');
const Ticket = require('../models/Ticket');
const fs = require('fs');
const path = require('path');

// @desc    Generate Full System Backup (JSON)
// @route   GET /api/superadmin/backup
// @access  Super Admin
const createBackup = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const companies = await Company.find();
        const logs = await ActivityLog.find().limit(1000); // Limit logs
        const tickets = await Ticket.find();

        const backupData = {
            timestamp: new Date(),
            version: '1.0',
            data: {
                users,
                companies,
                activityLogs: logs,
                tickets
            }
        };

        const fileName = `backup-${Date.now()}.json`;
        const filePath = path.join(__dirname, '..', '..', 'backups', fileName);

        // Ensure backups directory exists
        const backupDir = path.join(__dirname, '..', '..', 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error(err);
            }
            // Optional: Delete after download
            // fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Backup Generation Failed' });
    }
};

// @desc    Export specific user data (GDPR)
// @route   GET /api/superadmin/export-user/:id
// @access  Super Admin
const exportUserData = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });

        const userData = {
            profile: user,
            logs: await ActivityLog.find({ user: userId }),
            tickets: await Ticket.find({ raisedBy: userId })
        };

        res.set({
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="user-export-${userId}.json"`
        });

        res.json(userData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Export Failed' });
    }
};

module.exports = { createBackup, exportUserData };
