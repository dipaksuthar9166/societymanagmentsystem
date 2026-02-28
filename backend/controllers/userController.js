const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Notice = require('../models/Notice');
const Complaint = require('../models/Complaint');
const Company = require('../models/Company');
const Flat = require('../models/Flat');

// @desc    Get COMPLETE user dashboard data (Real Data)
// @route   GET /api/user/dashboard
// @access  User
const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`FETCHING DATA FOR USER: ${user.name} (${user.company})`);

        // 1. Fetch Invoices (My Bills)
        const invoices = await Invoice.find({ customerId: userId }).sort({ createdAt: -1 });

        // 2. Fetch Notices (My Society's Notices)
        let notices = [];
        if (user.company) {
            notices = await Notice.find({ societyId: user.company, isActive: true })
                .sort({ createdAt: -1 })
                .limit(20);
        }

        // 3. Fetch Complaints (My Complaints)
        console.log(`DEBUG: Fetching complaints for raisedBy: ${userId}`);
        const complaints = await Complaint.find({ raisedBy: userId }).sort({ createdAt: -1 });
        console.log(`DEBUG: Found ${complaints.length} complaints`);

        // 4. Fetch Society Info
        let societyInfo = null;
        if (user.company) {
            societyInfo = await Company.findById(user.company).select('name address settings gstNumber logo contactNumber email');
        }

        // 5. Fetch Committee Members
        let committee = [];
        if (user.company) {
            committee = await User.find({
                company: user.company,
                isCommitteeMember: true
            }).select('name designation memberPortfolio officeHours contactNumber');
        }

        // 6. Fetch Flat Details (If User linked to a Flat)
        const flat = await Flat.findOne({ tenantId: userId });
        const flatInfo = flat ? {
            flatNo: flat.flatNo,
            block: flat.block,
            floor: flat.floor,
            parking: flat.parkingSlot
        } : {
            flatNo: user.flatNo,
            block: user.block
        };

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                flatNo: flatInfo.flatNo,
                block: flatInfo.block,
                parking: flatInfo.parking,
                mobile: user.mobile,
                role: user.role,
                familyMembers: user.familyMembers,
                vehicleDetails: user.vehicleDetails
            },
            society: societyInfo,
            invoices,
            notices,
            complaints,
            committee,
            meta: {
                totalDue: invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.totalAmount, 0),
                totalComplaints: complaints.length,
            }
        });

    } catch (error) {
        console.error("User Dashboard Fetch Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update User Profile
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.mobile = req.body.mobile || user.mobile;

            // Handle potentially empty string for numbers (if user clears it)
            if (req.body.familyMembers !== undefined) user.familyMembers = req.body.familyMembers;

            user.vehicleDetails = req.body.vehicleDetails || user.vehicleDetails;

            // Handle Profile Image (Multer middleware must be used in route)
            if (req.file) {
                // Remove old image if exists (implied logic, skipped for safety to avoid deleting defaults)
                user.profileImage = `/uploads/profiles/${req.file.filename}`;
            }

            if (req.body.password) {
                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profileImage: updatedUser.profileImage, // Return new image
                token: req.headers.authorization.split(' ')[1]
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getUserDashboard, updateUserProfile };
