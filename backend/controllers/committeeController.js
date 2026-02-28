const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Meeting = require('../models/Meeting');
const Vendor = require('../models/Vendor');
const Poll = require('../models/Poll');

// ... (Existing assignRole, etc. keep them) ...

// ================= MEETINGS =================
// @desc    Get All Meetings
// @route   GET /api/committee/meetings
// @access  Committee/Admin
const getMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({ company: req.user.company }).sort({ date: 1 });
        res.json(meetings);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Create Meeting
// @route   POST /api/committee/meetings
// @access  Chairman/Admin
const createMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.create({
            ...req.body,
            company: req.user.company,
            createdBy: req.user._id
        });
        res.status(201).json(meeting);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// ================= VENDORS =================
// @desc    Get All Vendors
// @route   GET /api/committee/vendors
// @access  Committee/Admin
const getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find({ company: req.user.company });
        res.json(vendors);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Create Vendor
// @route   POST /api/committee/vendors
// @access  Secretary/Admin
const createVendor = async (req, res) => {
    try {
        const vendor = await Vendor.create({
            ...req.body,
            company: req.user.company
        });
        res.status(201).json(vendor);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// ================= POLLS =================
// @desc    Get All Polls
// @route   GET /api/committee/polls
// @access  Committee/Admin
const getPolls = async (req, res) => {
    try {
        const polls = await Poll.find({ company: req.user.company }).sort({ createdAt: -1 }).populate('votes.user', 'name designation role').populate('createdBy', 'name designation');

        // Add "hasVoted" flag for current user
        const pollsWithStatus = polls.map(p => {
            const pObj = p.toObject();
            const userVote = pObj.votes.find(v => v.user && (v.user._id || v.user).toString() === req.user._id.toString());
            return {
                ...pObj,
                userHasVoted: !!userVote,
                userVoteOption: userVote ? userVote.optionIndex : null
            };
        });

        res.json(pollsWithStatus);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Create Poll
// @route   POST /api/committee/polls
// @access  Committee/Admin
const createPoll = async (req, res) => {
    try {
        const poll = await Poll.create({
            ...req.body,
            company: req.user.company,
            createdBy: req.user._id
        });
        res.status(201).json(poll);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Vote on Poll
// @route   POST /api/committee/polls/:id/vote
// @access  Committee
const votePoll = async (req, res) => {
    const { optionIndex } = req.body;
    try {
        const poll = await Poll.findOne({ _id: req.params.id, company: req.user.company });
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        // Check if already voted
        const existingVote = poll.votes.find(v => v.user.toString() === req.user._id.toString());
        if (existingVote) return res.status(400).json({ message: 'You have already voted' });

        // Add vote
        poll.votes.push({ user: req.user._id, optionIndex });

        // Update counts
        poll.options[optionIndex].votes += 1;

        await poll.save();
        res.json(poll);
    } catch (error) { res.status(500).json({ message: error.message }); }
};



// @desc    Assign Committee Role to a User
// @route   POST /api/committee/assign
// @access  Admin
const assignRole = async (req, res) => {
    const { userId, designation, portfolio, officeHours } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user belongs to same society (security)
        if (user.company.toString() !== req.user.company.toString()) {
            return res.status(403).json({ message: 'User does not belong to your society' });
        }

        user.isCommitteeMember = true;
        user.designation = designation;

        // Update System Role based on Designation
        const roleMap = {
            'Chairman': 'chairman',
            'Secretary': 'secretary',
            'Treasurer': 'treasurer',
            'Member': 'committee_member'
        };
        if (roleMap[designation]) {
            user.role = roleMap[designation];
        }

        user.memberPortfolio = portfolio;
        user.officeHours = officeHours;

        await user.save();

        res.json({ message: 'Committee Role Assigned Successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove Committee Role
// @route   POST /api/committee/remove
// @access  Admin
const removeRole = async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.company.toString() !== req.user.company.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        user.isCommitteeMember = false;
        user.designation = 'None';
        user.memberPortfolio = '';
        user.officeHours = '';
        user.role = 'user'; // Revert to standard user

        await user.save();
        res.json({ message: 'Removed from Committee', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get All Committee Members for Society
// @route   GET /api/committee
// @access  User/Admin
const getCommittee = async (req, res) => {
    try {
        const societyId = req.user.company;
        const members = await User.find({
            company: societyId,
            isCommitteeMember: true
        }).select('name email contactNumber profileImage designation memberPortfolio officeHours flatNo');

        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a NEW user and assign Committee Role
// @route   POST /api/committee/create
// @access  Admin
const createCommitteeMember = async (req, res) => {
    const { name, email, password, flatNo, mobile, designation, portfolio, officeHours } = req.body;

    try {
        // 1. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists. Please select them from the list.' });
        }

        // 2. Create User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            flatNo,
            mobile,
            role: 'user',
            company: req.user.company, // Assumes Admin is logged in
            status: 'active'
        });

        // 3. Assign Role Logic
        newUser.isCommitteeMember = true;
        newUser.designation = designation;
        newUser.memberPortfolio = portfolio;
        newUser.officeHours = officeHours;

        const roleMap = {
            'Chairman': 'chairman',
            'Secretary': 'secretary',
            'Treasurer': 'treasurer',
            'Member': 'committee_member'
        };
        if (roleMap[designation]) {
            newUser.role = roleMap[designation];
        }

        await newUser.save();

        res.status(201).json({ message: 'Committee Member Created & Assigned', member: newUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    assignRole,
    removeRole,
    createCommitteeMember,
    getCommittee,
    getMeetings, createMeeting,
    getVendors, createVendor,
    getPolls, createPoll, votePoll
};
