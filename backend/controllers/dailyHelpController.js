const DailyHelp = require('../models/DailyHelp');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all daily help for a society
// @route   GET /api/staff
const getStaffList = async (req, res) => {
    try {
        const societyId = req.user.company;
        const staff = await DailyHelp.find({ company: societyId }).populate('workingFlats', 'flatNo');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Add new daily help (Admin/Guard)
// @route   POST /api/staff
const addStaffMember = async (req, res) => {
    try {
        const { name, role, mobile, address, aadharNumber } = req.body;
        const societyId = req.user.company;

        const exists = await DailyHelp.findOne({ mobile });
        if (exists) return res.status(400).json({ message: 'Staff with this mobile already registered' });

        const staff = await DailyHelp.create({
            name, 
            role, 
            mobile, 
            address, 
            aadharNumber, 
            company: societyId,
            status: 'active'
        });

        res.status(201).json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Staff Check-In/Check-Out
// @route   POST /api/staff/:id/entry
const toggleStaffStatus = async (req, res) => {
    try {
        const staff = await DailyHelp.findById(req.params.id);
        if (!staff) return res.status(404).json({ message: 'Staff not found' });

        staff.currentlyInside = !staff.currentlyInside;
        await staff.save();

        res.json({ success: true, currentlyInside: staff.currentlyInside });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Verify Staff (Admin)
// @route   PATCH /api/staff/:id/verify
const verifyStaff = async (req, res) => {
    try {
        const staff = await DailyHelp.findById(req.params.id);
        if (!staff) return res.status(404).json({ message: 'Staff not found' });

        staff.isVerified = true;
        await staff.save();

        res.json({ success: true, message: 'Staff Verified' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getStaffList, addStaffMember, toggleStaffStatus, verifyStaff };
