const User = require('../models/User');
const Company = require('../models/Company');
const bcrypt = require('bcryptjs');


// @desc    Get all tenants/owners for the logged-in admin's building
// @route   GET /api/admin/customers
// @access  Admin
const getCustomers = async (req, res) => {
    try {
        if (!req.user.company) {
            return res.status(400).json({ message: 'User not associated with a society' });
        }

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
    const { name, email, password, flatNo, mobile, contactNumber } = req.body;

    if (!req.user.company) {
        return res.status(400).json({ message: 'User not associated with a society' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: req.body.role || 'user',
            company: req.user.company,
            flatNo: flatNo || 'Unassigned',
            contactNumber: contactNumber || mobile
        });

        if (user) {
            // Trigger automatic verification (Email + SMS)
            const { generateVerificationToken, sendVerificationEmail } = require('../utils/emailService');
            const { sendOTP } = require('../utils/otpService');
            
            const verificationToken = generateVerificationToken();
            const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            user.verificationToken = verificationToken;
            user.verificationTokenExpiry = tokenExpiry;
            await user.save();

            // 1. Send SMS Onboarding
            if (user.contactNumber) {
                try {
                    const company = await Company.findById(user.company);
                    const twilioConfig = company?.twilioConfig?.isActive ? company.twilioConfig : null;
                    await sendOTP(user.email, user.name, user.contactNumber, twilioConfig);
                } catch (smsErr) { console.error('SMS Onboard Fail:', smsErr.message); }
            }

            // 2. Send Email Onboarding
            try {
                await sendVerificationEmail(user, verificationToken);
            } catch (mailErr) { console.error('Mail Onboard Fail:', mailErr.message); }

            res.status(201).json(user);
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Delete a tenant
// @route   DELETE /api/admin/customers/:id
// @access  Admin/Superadmin
const deleteCustomer = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.user.role !== 'superadmin' && user.company?.toString() !== req.user.company?.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete users from other societies' });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Security: You cannot delete your own account from here.' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed successfully' });
    } catch (error) {
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

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.user.role !== 'superadmin' && user.company?.toString() !== req.user.company?.toString()) {
            return res.status(401).json({ message: 'Not authorized to update users from other societies' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.flatNo = flatNo || user.flatNo;
        user.contactNumber = contactNumber || mobile || contactNumber || user.contactNumber;

        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Twilio Configuration
// @route   POST /api/admin/society/twilio
// @access  Admin/Superadmin
const saveTwilioConfig = async (req, res) => {
    try {
        const { accountSid, authToken, phoneNumber, isActive } = req.body;
        const companyId = req.user.company;

        console.log(`[Admin] Saving Twilio Config for Company: ${companyId} by User: ${req.user._id}`);
        console.log(`[Data] SID: ${accountSid ? '***' + accountSid.slice(-4) : 'Empty'}, Active: ${isActive}`);

        if (!companyId) return res.status(400).json({ message: 'User not associated with any society/company.' });

        const company = await Company.findById(companyId);
        if (!company) return res.status(404).json({ message: 'Society record not found in database.' });

        // Update config
        company.twilioConfig = {
            accountSid: accountSid || company.twilioConfig?.accountSid,
            authToken: authToken || company.twilioConfig?.authToken,
            phoneNumber: phoneNumber || company.twilioConfig?.phoneNumber,
            isActive: isActive !== undefined ? isActive : (company.twilioConfig?.isActive || false)
        };

        // If explicitly setting to inactive, make sure it's caught
        if (isActive === false) company.twilioConfig.isActive = false;

        await company.save();
        console.log(`✅ Twilio Config saved successfully for ${company.name}`);
        
        res.json({ 
            success: true, 
            message: 'Twilio Settings Updated Successfully!', 
            config: {
                accountSid: company.twilioConfig.accountSid,
                phoneNumber: company.twilioConfig.phoneNumber,
                isActive: company.twilioConfig.isActive
            }
        });
    } catch (error) {
        console.error('❌ Save Twilio Error:', error);
        res.status(500).json({ message: 'Server error while saving: ' + error.message });
    }
};

// @desc    Get Twilio SMS Balance
// @route   GET /api/admin/sms-balance
// @access  Admin/Superadmin
const getSMSBalance = async (req, res) => {
    try {
        let sid, auth;

        // 1. Try fetching from Society (Company) first
        const company = await Company.findById(req.user.company);
        if (company && company.twilioConfig && company.twilioConfig.isActive && company.twilioConfig.accountSid) {
            sid = company.twilioConfig.accountSid;
            auth = company.twilioConfig.authToken;
            console.log(`[Twilio] Using Society-specific keys for ${company.name}`);
        } else {
            // 2. Fallback to ENV (System Default)
            sid = process.env.TWILIO_ACCOUNT_SID;
            auth = process.env.TWILIO_AUTH_TOKEN;
            console.log(`[Twilio] Using Global System keys`);
        }

        if (!sid || !auth) {
            return res.status(404).json({ message: 'SMS Service (Twilio) not configured.' });
        }

        const client = require('twilio')(sid, auth);
        
        try {
            const balanceData = await client.balance.fetch();
            res.json({
                balance: balanceData.balance,
                currency: balanceData.currency || 'USD',
                accountName: balanceData.accountSid === sid ? 'Active Account' : balanceData.accountName,
                isGlobal: !company?.twilioConfig?.isActive
            });
        } catch (err) {
            const account = await client.api.v2010.accounts(sid).fetch();
            res.json({
                status: account.status,
                type: account.type,
                balance: 'Upgraded Account Required for Live Balance API',
                note: 'Twilio Trial or certain regions do not support direct balance fetch.',
                isGlobal: !company?.twilioConfig?.isActive
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
    getSMSBalance,
    saveTwilioConfig
};
