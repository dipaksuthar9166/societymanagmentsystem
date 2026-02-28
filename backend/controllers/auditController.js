const ActivityLog = require('../models/ActivityLog');

// @desc    Get System Audit Logs
// @route   GET /api/superadmin/audit-logs
// @access  Super Admin
const getAuditLogs = async (req, res) => {
    try {
        const { limit = 50, page = 1, type } = req.query;

        let query = {};
        if (type) query.action = type;

        const logs = await ActivityLog.find(query)
            .populate('user', 'name role email')
            .populate('society', 'name')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((page - 1) * limit);

        const total = await ActivityLog.countDocuments(query);

        res.json({
            logs,
            page: Number(page),
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getAuditLogs };
