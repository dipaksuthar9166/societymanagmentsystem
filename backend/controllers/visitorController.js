const Visitor = require('../models/Visitor');
const Blacklist = require('../models/Blacklist');
const Flat = require('../models/Flat');

// @desc    Get Visitors (Real-time logs)
// @route   GET /api/visitors
// @access  Private
const getVisitors = async (req, res) => {
    try {
        const societyId = req.user.company || req.query.societyId;
        const filters = { societyId };

        if (req.query.status) filters.status = req.query.status;

        const visitors = await Visitor.find(filters)
            .sort({ checkInTime: -1 })
            .limit(100)
            .populate('hostFlatId', 'flatNo')
            .populate('hostUserId', 'name mobile');

        res.json(visitors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Entry Visitor
// @route   POST /api/visitors/entry
// @access  Private (Guard/Admin)
const entryVisitor = async (req, res) => {
    try {
        const { name, mobile, visitorType, vehicleNo, flatId, purpose, photo } = req.body;
        const societyId = req.user.company || req.user.societyId;

        // Check Blacklist
        const isBlacklisted = await Blacklist.findOne({ societyId, mobile });
        if (isBlacklisted) {
            return res.status(403).json({ message: 'Visitor is Blacklisted!', reason: isBlacklisted.reason });
        }

        const visitor = await Visitor.create({
            societyId,
            name,
            mobile,
            visitorType,
            vehicleNo,
            hostFlatId: flatId,
            purpose,
            photo,
            enteredBy: req.user._id,
            status: 'In',
            checkInTime: new Date()
        });

        // ✅ REAL-TIME NOTIFICATION TO RESIDENT
        if (flatId) {
            const User = require('../models/User');
            // Find resident of this flat
            const hostUser = await User.findOne({ company: societyId, flatNo: (await Flat.findById(flatId))?.flatNo, role: 'user' });

            if (hostUser) {
                const io = req.app.get('io');
                if (io) {
                    io.to(hostUser._id.toString()).emit('new_visitor', {
                        title: 'Visitor Arrived',
                        message: `${name} (${visitorType}) has arrived at the gate for your flat.`,
                        visitor: visitor
                    });
                }
            }
        }

        res.status(201).json(visitor);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Exit Visitor
// @route   PATCH /api/visitors/:id/exit
// @access  Private (Guard/Admin)
const exitVisitor = async (req, res) => {
    try {
        const visitor = await Visitor.findByIdAndUpdate(
            req.params.id,
            { status: 'Out', checkOutTime: new Date() },
            { new: true }
        );
        res.json(visitor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get Blacklist
// @route   GET /api/visitors/blacklist
// @access  Private
const getBlacklist = async (req, res) => {
    try {
        const list = await Blacklist.find({ societyId: req.user.company }).sort({ createdAt: -1 });
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add to Blacklist
// @route   POST /api/visitors/blacklist
// @access  Private (Admin)
const addToBlacklist = async (req, res) => {
    try {
        const { name, mobile, reason, photo } = req.body;
        const exists = await Blacklist.findOne({ societyId: req.user.company, mobile });
        if (exists) return res.status(400).json({ message: 'Already blacklisted' });

        const item = await Blacklist.create({
            societyId: req.user.company,
            name,
            mobile,
            reason,
            photo,
            addedBy: req.user._id
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Remove from Blacklist
// @route   DELETE /api/visitors/blacklist/:id
// @access  Private (Admin)
const removeFromBlacklist = async (req, res) => {
    try {
        await Blacklist.findByIdAndDelete(req.params.id);
        res.json({ message: 'Removed from blacklist' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Pre-Approve Visitor / Generate Pass
// @route   POST /api/visitors/pre-approve
// @access  Private (Resident)
const preApproveVisitor = async (req, res) => {
    try {
        const { name, mobile, purpose, visitorType = 'Guest' } = req.body;

        // Resolve Host Flat
        let hostFlatId = null;
        if (req.user.flatNo) {
            const flat = await Flat.findOne({
                societyId: req.user.company,
                flatNo: req.user.flatNo
            });
            if (flat) hostFlatId = flat._id;
        }

        // Generate Unique Code (6 chars)
        let uniqueCode;
        let isUnique = false;
        while (!isUnique) {
            uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const exists = await Visitor.findOne({ qrCode: uniqueCode });
            if (!exists) isUnique = true;
        }

        const visitor = await Visitor.create({
            societyId: req.user.company,
            name,
            mobile,
            visitorType,
            qrCode: uniqueCode,
            hostUserId: req.user._id,
            hostFlatId: hostFlatId,
            purpose,
            isPreApproved: true,
            approvalStatus: 'Approved',
            status: 'Expected',
            checkInTime: null
        });

        res.status(201).json({
            code: uniqueCode,
            visitor,
            qrCodeString: JSON.stringify({ id: visitor._id, code: uniqueCode })
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate pass' });
    }
};

module.exports = {
    getVisitors,
    entryVisitor,
    exitVisitor,
    getBlacklist,
    addToBlacklist,
    removeFromBlacklist,
    preApproveVisitor
};
