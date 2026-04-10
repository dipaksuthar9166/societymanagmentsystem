const ChildExitLog = require('../models/ChildExitLog');
const Notification = require('../models/Notification');

// @desc    Initiate Child Exit Request (Guard)
// @route   POST /api/security/child-exit
const requestChildExit = async (req, res) => {
    try {
        const { childName, age, parentId, flatId, gate } = req.body;
        const societyId = req.user.company;

        const log = await ChildExitLog.create({
            childName,
            age,
            parent: parentId,
            flat: flatId,
            gate,
            guard: req.user._id,
            company: societyId,
            status: 'Pending'
        });

        // Trigger Real-time Notification via Socket (logic handled in server.js)
        
        res.status(201).json({ success: true, logId: log._id, message: 'Request sent to parent' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Respond to Child Exit Request (Parent)
// @route   POST /api/security/child-exit/:id/respond
const respondToRequest = async (req, res) => {
    try {
        const { status, approvedBy, remarks } = req.body;
        const log = await ChildExitLog.findById(req.params.id);

        if (!log) return res.status(404).json({ message: 'Request not found' });
        
        // Verify this parent owns this request
        if (log.parent.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        log.status = status; // Approved / Denied
        log.approvedBy = approvedBy;
        log.remarks = remarks;
        log.decisionTime = Date.now();
        await log.save();

        res.json({ success: true, message: `Request ${status.toLowerCase()}` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Child Exit Logs (Admin/Security)
// @route   GET /api/security/child-exit
const getExitLogs = async (req, res) => {
    try {
        const societyId = req.user.company;
        const logs = await ChildExitLog.find({ company: societyId })
            .populate('parent', 'name mobile')
            .populate('flat', 'flatNo')
            .sort({ createdAt: -1 });
        
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { requestChildExit, respondToRequest, getExitLogs };
