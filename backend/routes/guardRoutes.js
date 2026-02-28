const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const Parcel = require('../models/Parcel');
const ServiceProvider = require('../models/ServiceProvider');
const Flat = require('../models/Flat');

// @route   POST /api/guard/entry
// @desc    Manual Visitor Entry
router.post('/entry', protect, async (req, res) => {
    try {
        const { name, mobile, flatId, purpose, visitorType } = req.body;

        // Find Host Flat/User logic if needed
        // For simplicity, just recording log linked to admin's society
        const societyId = req.user.company || req.user._id;

        const visitor = new Visitor({
            name,
            mobile,
            flatId, // Assuming flatId is passed or resolved
            societyId: societyId,
            purpose,
            visitorType,
            checkInTime: Date.now(),
            approvalStatus: 'Approved' // Gate entry implies approval by guard
        });

        await visitor.save();

        // Notify Resident (Socket.io) - To be implemented in controller or efficient socket hook
        const io = req.app.get('io');
        if (io && flatId) {
            // Logic to find user by flat and emit 'guest_arrival'
        }

        res.status(201).json(visitor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/guard/verify-qr
// @desc    Verify QR Code
router.post('/verify-qr', protect, async (req, res) => {
    try {
        const { qrCode } = req.body;
        console.log("Verifying QR:", qrCode);

        // Populate with error handling check
        const visitor = await Visitor.findOne({ qrCode })
            .populate('hostFlatId', 'flatNo block')
            .populate('hostUserId', 'name mobile flatNo');

        console.log("Found Visitor:", visitor ? visitor._id : "None");

        if (!visitor) {
            return res.status(404).json({ message: 'Invalid QR Code' });
        }

        if (visitor.checkInTime && visitor.checkOutTime) {
            return res.status(400).json({ message: 'Pass already expired' });
        }

        // Mark Check-in if not checked in
        if (!visitor.checkInTime || visitor.status === 'Pending' || visitor.status === 'Expected') {
            visitor.checkInTime = Date.now();
            visitor.approvalStatus = 'Approved'; // Fixed: CheckedIn was invalid enum
            visitor.status = 'In'; // Ensure status update
            await visitor.save();

            // Notify Resident
            const io = req.app.get('io');
            if (io && visitor.hostUserId) {
                console.log("Emitting guest_arrival to:", visitor.hostUserId._id);
                io.to(visitor.hostUserId._id.toString()).emit('guest_arrival', { visitor: visitor.name });
            }

            return res.json({ message: 'Access Granted: Check-in Successful', visitor });
        }

        // Already In
        res.json({ message: 'Valid Pass (Already In)', visitor });

    } catch (err) {
        console.error("QR Verification Error:", err);
        res.status(500).json({ message: err.message, stack: err.stack });
    }
});

// @route   GET /api/guard/visitors
// @desc    Get Today's Logs and Visitors currently IN
router.get('/visitors', protect, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const logs = await Visitor.find({
            societyId: req.user.company || req.user._id,
            $or: [
                { createdAt: { $gte: today } },
                { checkOutTime: { $exists: false } } // Also show those who haven't left
            ]
        }).sort({ createdAt: -1 });

        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/guard/visitors/:id/checkout
// @desc    Mark Visitor Out
router.put('/visitors/:id/checkout', protect, async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);
        if (!visitor) return res.status(404).json({ message: 'Visitor not found' });

        visitor.checkOutTime = Date.now();
        await visitor.save();
        res.json(visitor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- PARCEL ROUTES ---

router.get('/parcels', protect, async (req, res) => {
    try {
        const parcels = await Parcel.find({
            societyId: req.user.company || req.user._id,
            status: 'At Gate'
        }).sort({ createdAt: -1 });
        res.json(parcels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/parcels', protect, async (req, res) => {
    try {
        const parcel = new Parcel({
            ...req.body,
            enteredBy: req.user._id,
            societyId: req.user.company || req.user._id
        });
        await parcel.save();
        // Notify Resident Logic Here (Socket)
        res.status(201).json(parcel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/parcels/:id/collect', protect, async (req, res) => {
    try {
        const parcel = await Parcel.findById(req.params.id);
        if (!parcel) return res.status(404).json({ message: 'Parcel not found' });

        parcel.status = 'Collected';
        parcel.collectedAt = Date.now();
        await parcel.save();
        res.json(parcel);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- STAFF ROUTES ---

router.get('/staff', protect, async (req, res) => {
    try {
        // Fetch all registered service providers for this society
        const staff = await ServiceProvider.find({
            societyId: req.user.company || req.user._id
        });

        // Check their attendance status for today?
        // For simplicity, we just list them. Real attendance needs a separate collection or smarter query.
        // We will misuse 'Visitor' log to check if they are currently IN.

        const activeVisitors = await Visitor.find({
            visitorType: 'Service',
            checkOutTime: { $exists: false },
            societyId: req.user.company || req.user._id
        });

        const staffWithStatus = staff.map(s => {
            const isActive = activeVisitors.some(v => v.mobile === s.mobile);
            // Matching by mobile for now, ideally ID
            return { ...s._doc, isInside: isActive };
        });

        res.json(staffWithStatus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- VEHICLE SEARCH ---
router.post('/vehicle-search', protect, async (req, res) => {
    try {
        const { plateNo } = req.body;
        // Search in Users (vehicleDetails)
        const user = await User.findOne({
            company: req.user.company || req.user._id,
            vehicleDetails: { $regex: plateNo, $options: 'i' }
        }).select('name flatNo block mobile vehicleDetails');

        if (user) {
            return res.json({ found: true, owner: user });
        }
        res.json({ found: false });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
