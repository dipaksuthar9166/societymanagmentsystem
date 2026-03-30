const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all tenants/owners for the logged-in admin's building
// @route   GET /api/admin/customers
// @access  Admin
const getCustomers = async (req, res) => {
    try {
        if (!req.user.company) {
            return res.status(400).json({ message: 'User not associated with a society' });
        }

        // Fetch users who belong to this company AND have role 'user' OR 'guard'
        const customers = await User.find({
            company: req.user.company,
            role: { $in: ['user', 'guard'] }
        }).select('-password');

        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new tenant (user) for the building
// @route   POST /api/admin/customers
// @access  Admin
const createCustomer = async (req, res) => {
    const { name, email, password, flatNo, mobile } = req.body;

    if (!req.user.company) {
        return res.status(400).json({ message: 'User not associated with a society' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check if flat is already assigned in this society (unless it is 'Main Gate')
        if (flatNo && flatNo !== 'Main Gate') {
            const flatOccupied = await User.findOne({ company: req.user.company, flatNo: flatNo });
            // ... strict check logic ...
            if (flatOccupied) {
                return res.status(400).json({ message: `Flat ${flatNo} is already assigned to ${flatOccupied.name}` });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: req.body.role || 'user', // Allow creating 'guard' or default to 'user'
            company: req.user.company,
            flatNo: flatNo || 'Unassigned',
            contactNumber: req.body.contactNumber || mobile
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                company: user.company
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a tenant
// @route   DELETE /api/admin/customers/:id
// @access  Admin/Superadmin
const deleteCustomer = async (req, res) => {
    try {
        console.log(`[Admin] DELETE call for User: ${req.params.id} by Requester: ${req.user._id} (${req.user.role})`);
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Allow Superadmins to delete anyone, or Admins to delete from their own society
        if (req.user.role !== 'superadmin') {
            const userCompanyId = user.company ? user.company.toString() : 'None';
            const adminCompanyId = req.user.company ? req.user.company.toString() : 'None';

            console.log(`[Auth Check] Resident Co: ${userCompanyId}, Requester Co: ${adminCompanyId}`);

            if (userCompanyId !== adminCompanyId) {
                return res.status(401).json({ 
                    message: 'Not authorized to delete users from other societies',
                    debug: { residentSociety: userCompanyId, requesterSociety: adminCompanyId }
                });
            }
        }

        // Check if deleting self
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Security: You cannot delete your own account from here.' });
        }

        await user.deleteOne();
        console.log(`[Admin] User ${req.params.id} deleted successfully`);
        res.json({ message: 'User removed successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Update a tenant's details
// @route   PUT /api/admin/customers/:id
// @access  Admin/Superadmin
const updateCustomer = async (req, res) => {
    try {
        const { name, email, password, flatNo, mobile, role, contactNumber } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Authority check
        if (req.user.role !== 'superadmin' && user.company.toString() !== req.user.company.toString()) {
            return res.status(401).json({ message: 'Not authorized to update users from other societies' });
        }

        // Update fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.flatNo = flatNo || user.flatNo;
        user.contactNumber = contactNumber || mobile || user.contactNumber;

        // If password is provided, hash it
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            flatNo: updatedUser.flatNo,
            contactNumber: updatedUser.contactNumber
        });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Twilio SMS Balance
// @route   GET /api/admin/sms-balance
// @access  Admin/Superadmin
const getSMSBalance = async (req, res) => {
    try {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const auth = process.env.TWILIO_AUTH_TOKEN;

        if (!sid || !auth) {
            return res.status(404).json({ message: 'SMS Service (Twilio) not configured.' });
        }

        const client = require('twilio')(sid, auth);
        
        // Twilio Account Fetch returns basic info including balance for some account types
        // But the most reliable for balance is the balance resource (may require upgraded account)
        try {
            const balanceData = await client.balance.fetch();
            res.json({
                balance: balanceData.balance,
                currency: balanceData.currency || 'USD',
                accountName: balanceData.accountSid === sid ? 'Primary Account' : balanceData.accountName
            });
        } catch (err) {
            // Fallback: Just fetch account info
            const account = await client.api.v2010.accounts(sid).fetch();
            res.json({
                status: account.status,
                type: account.type,
                balance: 'Upgraded Account Required for Live Balance',
                note: 'Twilio Trial accounts do not expose balance via API.'
            });
        }
    } catch (error) {
        console.error('Twilio Balance Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch balance: ' + error.message });
    }
};

module.exports = {
    getCustomers,
    createCustomer,
    deleteCustomer,
    updateCustomer,
    getSMSBalance
};
