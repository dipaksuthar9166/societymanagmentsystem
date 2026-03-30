const User = require('../models/User');
const Company = require('../models/Company');
const mongoose = require('mongoose');

// In-memory cache for SMS balance to reduce loading times
const balanceCache = new Map();

// @desc    Get all residents for a society
// @route   GET /api/admin/customers
const getCustomers = async (req, res) => {
    try {
        const societyId = req.user.company;
        const customers = await User.find({ company: societyId, role: { $in: ['user', 'guard'] } }).sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new resident
// @route   POST /api/admin/customers
const createCustomer = async (req, res) => {
    try {
        const { name, email, password, role, flatNo, mobile } = req.body;
        const societyId = req.user.company;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({
            name, email, password, role, flatNo, contactNumber: mobile, company: societyId, status: 'inactive', isVerified: false
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update resident
// @route   PUT /api/admin/customers/:id
const updateCustomer = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, password, role, flatNo, contactNumber } = req.body;
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.flatNo = flatNo || user.flatNo;
        user.contactNumber = contactNumber || user.contactNumber;
        if (password) user.password = password;

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete resident
// @route   DELETE /api/admin/customers/:id
const deleteCustomer = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify Customer Manually
// @route   POST /api/admin/customers/:id/verify-manually
const verifyCustomerManually = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isSuperAdmin = req.user.role === 'superadmin';
        const isSameSociety = user.company?.toString() === req.user.company?.toString();

        if (!isSuperAdmin && !isSameSociety) {
            return res.status(401).json({ message: 'Not authorized for this society' });
        }

        user.isVerified = true;
        user.status = 'active';
        await user.save();

        res.json({ success: true, message: 'Resident activated manually' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Verify Customer via OTP
// @route   POST /api/admin/customers/:id/verify-otp
const verifyCustomerOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { verifyOTP } = require('../utils/otpService');
        const otpResult = verifyOTP(user.email, otp);

        if (!otpResult.valid) {
            return res.status(400).json({ success: false, message: otpResult.message });
        }

        user.isVerified = true;
        user.status = 'active';
        await user.save();

        res.json({ success: true, message: 'Resident activated via OTP' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Update Twilio Configuration
const saveTwilioConfig = async (req, res) => {
    try {
        const { accountSid, authToken, phoneNumber, isActive } = req.body;
        const companyId = req.user.company;
        if (!companyId) return res.status(400).json({ message: 'No society associated.' });

        const company = await Company.findById(companyId);
        if (!company) return res.status(404).json({ message: 'Society not found.' });

        company.twilioConfig = {
            accountSid: accountSid || company.twilioConfig?.accountSid,
            authToken: authToken || company.twilioConfig?.authToken,
            phoneNumber: phoneNumber || company.twilioConfig?.phoneNumber,
            isActive: isActive !== undefined ? isActive : (company.twilioConfig?.isActive || false)
        };

        if (isActive === false) company.twilioConfig.isActive = false;
        await company.save();
        
        // Clear cache for this society
        balanceCache.delete(companyId.toString());

        res.json({ success: true, message: 'Twilio Settings Updated Successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get Twilio SMS Balance (with Caching)
const getSMSBalance = async (req, res) => {
    try {
        const companyId = req.user.company?.toString() || 'global';
        
        // Check cache (5 minutes duration)
        const cached = balanceCache.get(companyId);
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
            return res.json(cached.data);
        }

        let sid, auth;
        const company = await Company.findById(req.user.company);
        
        if (company?.twilioConfig?.isActive && company.twilioConfig.accountSid) {
            sid = company.twilioConfig.accountSid;
            auth = company.twilioConfig.authToken;
        } else {
            sid = process.env.TWILIO_ACCOUNT_SID;
            auth = process.env.TWILIO_AUTH_TOKEN;
        }

        if (!sid || !auth) {
            const data = { balance: '0.00', currency: '$', note: 'Not configured.', isGlobal: true };
            balanceCache.set(companyId, { data, timestamp: Date.now() });
            return res.json(data);
        }

        try {
            const client = require('twilio')(sid, auth);
            let finalData;
            try {
                const balanceData = await client.balance.fetch();
                finalData = {
                    balance: balanceData.balance,
                    currency: balanceData.currency || '$',
                    isGlobal: !company?.twilioConfig?.isActive,
                    timestamp: new Date().toISOString()
                };
            } catch (err) {
                const account = await client.api.v2010.accounts(sid).fetch();
                finalData = {
                    balance: account.status === 'active' ? 'Active' : 'Error',
                    note: 'Paid account required for balance.',
                    isGlobal: !company?.twilioConfig?.isActive,
                    timestamp: new Date().toISOString()
                };
            }
            // Store results in cache
            balanceCache.set(companyId, { data: finalData, timestamp: Date.now() });
            return res.json(finalData);
        } catch (twilioErr) {
            return res.json({ balance: 'Error', note: twilioErr.message });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCustomers, createCustomer, deleteCustomer, updateCustomer,
    getSMSBalance, saveTwilioConfig, verifyCustomerManually, verifyCustomerOTP
};
