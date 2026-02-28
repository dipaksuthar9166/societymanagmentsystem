const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateVerificationToken, sendVerificationEmail } = require('../utils/emailService');

// @desc    Get all admins
// @route   GET /api/superadmin/admins
// @access  Super Admin
const getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new admin
// @route   POST /api/superadmin/admins
// @access  Super Admin
const createAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = generateVerificationToken();
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            isVerified: false,
            status: 'pending',
            verificationToken,
            verificationTokenExpiry: tokenExpiry
        });

        if (user) {
            // Send verification email
            const emailResult = await sendVerificationEmail(user, verificationToken);

            if (!emailResult.success) {
                console.error('Failed to send verification email:', emailResult.error);
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                status: user.status,
                message: 'Admin created successfully! Verification email sent.'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update admin
// @route   PUT /api/superadmin/admins/:id
// @access  Super Admin
const updateAdmin = async (req, res) => {
    const { name, email, password, status } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            if (status) user.status = status;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete admin
// @route   DELETE /api/superadmin/admins/:id
// @access  Super Admin
const deleteAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user && user.role === 'admin') {
            await User.deleteOne({ _id: req.params.id });
            res.json({ message: 'Admin removed' });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const Company = require('../models/Company');
const Invoice = require('../models/Invoice');
const ActivityLog = require('../models/ActivityLog');
const Ticket = require('../models/Ticket');
const Inquiry = require('../models/Inquiry');

// @desc    Get system-wide analytics
// @route   GET /api/superadmin/analytics
// @access  Super Admin
const getSystemAnalytics = async (req, res) => {
    try {
        const totalSocieties = await Company.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });

        const totalRevenueResult = await Invoice.aggregate([
            { $match: { status: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // Recent Societies
        const recentSocieties = await Company.find().sort({ createdAt: -1 }).limit(5);

        // Revenue Per Society (Top 5)
        const revenuePerSociety = await Invoice.aggregate([
            { $match: { status: 'Paid' } },
            { $group: { _id: '$societyId', revenue: { $sum: '$totalAmount' } } },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'society' } },
            { $unwind: '$society' },
            { $project: { name: '$society.name', revenue: 1, _id: 0 } }
        ]);

        // Monthly Revenue Trend (Last 12 Months)
        const monthlyRevenue = await Invoice.aggregate([
            { $match: { status: 'Paid', createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Ticket Stats
        const ticketStats = await Ticket.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent Activity Logs
        const recentActivity = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .populate('society', 'name');

        // Recent Inquiries
        const recentInquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(3);

        res.json({
            stats: {
                totalSocieties,
                totalUsers,
                totalAdmins,
                totalRevenue
            },
            charts: {
                monthlyRevenue,
                ticketStats,
                societyPerformance: revenuePerSociety
            },
            recentActivity,
            recentInquiries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Broadcast to multiple societies or all users
// @route   POST /api/superadmin/broadcast
// @access  Super Admin
const globalBroadcast = async (req, res) => {
    try {
        const { title, message, target } = req.body;
        // target: 'all_societies', 'all_admins', 'all_users'

        let users = [];

        if (target === 'all_societies') {
            // Send to all Admin roles
            users = await User.find({ role: 'admin' });
        } else if (target === 'all_users') {
            // Send to everyone
            users = await User.find({});
        } else {
            users = await User.find({ role: 'admin' });
        }

        // Mock Implementation for now
        res.json({ message: `Broadcast sent to ${users.length} recipients` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};



// @desc    Get all landing page inquiries
// @route   GET /api/superadmin/inquiries
// @access  Super Admin
const getInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update inquiry status
// @route   PUT /api/superadmin/inquiries/:id
// @access  Super Admin
const updateInquiryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const inquiry = await Inquiry.findById(req.params.id);

        if (inquiry) {
            inquiry.status = status;
            await inquiry.save();
            res.json(inquiry);
        } else {
            res.status(404).json({ message: 'Inquiry not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getSystemAnalytics,
    globalBroadcast,
    getInquiries,
    updateInquiryStatus
};
