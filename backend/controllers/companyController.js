const Company = require('../models/Company');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Create a new Company and assign an Admin
// @route   POST /api/superadmin/companies
// @access  Super Admin
const createCompany = async (req, res) => {
    const { companyName, companyEmail, adminName, adminEmail, adminPassword, address, contactNumber, plan } = req.body;

    // Start a session for transaction (if using replica set, otherwise simple async/await flow)
    // For simplicity in development, we'll do sequential checks
    try {
        // Check if company exists
        const companyExists = await Company.findOne({ email: companyEmail });
        if (companyExists) {
            return res.status(400).json({ message: 'Company with this email already exists' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email: adminEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 1. Create Company
        let logoPath = 'https://cdn-icons-png.flaticon.com/512/270/270014.png';
        if (req.file) {
            logoPath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const company = await Company.create({
            name: companyName,
            email: companyEmail,
            address,
            contactNumber,
            plan: plan || 'Basic',
            logo: logoPath,
            status: 'Active'
        });

        // 2. Create Admin User linked to Company
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const adminUser = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            company: company._id
        });

        // 3. Update Company with Owner ID
        // 3. Update Company with Owner ID
        company.ownerId = adminUser._id;

        // 4. Auto-Generate Structure (If provided)
        let { structure } = req.body;
        if (typeof structure === 'string') {
            try { structure = JSON.parse(structure); } catch (e) { structure = {}; }
        }

        if (structure && structure.blocks > 0) {
            const flatsToCreate = [];
            const blockNames = Array.from({ length: structure.blocks }, (_, i) => String.fromCharCode(65 + i)); // A, B, C...

            blockNames.forEach(block => {
                for (let f = 1; f <= structure.floors; f++) {
                    for (let r = 1; r <= structure.flatsPerFloor; r++) {
                        const flatNo = `${block}-${f}${r.toString().padStart(2, '0')}`; // A-101
                        flatsToCreate.push({
                            societyId: company._id,
                            flatNo: flatNo,
                            block: block,
                            floor: f,
                            rentAmount: 0, // Default to 0, admin sets later
                            status: 'Vacant'
                        });
                    }
                }
            });

            const Flat = require('../models/Flat');
            if (flatsToCreate.length > 0) {
                await Flat.insertMany(flatsToCreate);
                company.settings.structureGenerated = true; // Direct update
            }
        }

        await company.save();

        res.status(201).json({
            message: 'Company, Admin & Infrastructure created successfully',
            company,
            admin: {
                _id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all Companies
// @route   GET /api/superadmin/companies
// @access  Super Admin
const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find().populate('ownerId', 'name email');
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Company Status/Settings (Quota, Penalty, Status)
// @route   PUT /api/superadmin/companies/:id/settings
// @access  Super Admin
const updateCompanySettings = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const { status, settings, plan, expiryDate } = req.body;

        company.status = status || company.status;
        company.plan = plan || company.plan;

        if (settings) {
            // Check if company.settings is initialized, if not init it
            if (!company.settings) company.settings = {};

            // Iterate and assign keys to avoid replacing the whole object
            for (const key in settings) {
                if (key === 'lateFeeRule' && typeof settings[key] === 'object') {
                    if (!company.settings.lateFeeRule) company.settings.lateFeeRule = {};
                    Object.assign(company.settings.lateFeeRule, settings[key]);
                } else {
                    company.settings[key] = settings[key];
                }
            }
        }

        if (expiryDate) {
            if (!company.subscription) company.subscription = {};
            company.subscription.expiryDate = expiryDate;
        }

        await company.save();

        // Check if status implies freezing
        if (status === 'Inactive' || status === 'Frozen') {
            const io = req.app.get('io');
            if (io) {
                console.log(`[Socket] Broadcasting account_frozen to society ${company._id}`);
                io.to(company._id.toString()).emit('account_frozen', {
                    message: "The Administrator has frozen this account. You will be logged out now."
                });
            }
        }

        res.json({ message: 'Company settings updated successfully', company });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete Company
// @route   DELETE /api/superadmin/companies/:id
// @access  Super Admin
const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        await company.deleteOne();
        res.json({ message: 'Company removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Company Details
// @route   PUT /api/superadmin/companies/:id
// @access  Super Admin
const updateCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const { name, email, address, contactNumber, maxRooms, plan, expiryDate } = req.body;

        company.name = name || company.name;
        company.email = email || company.email;
        company.address = address || company.address;
        company.contactNumber = contactNumber || company.contactNumber;
        company.plan = plan || company.plan;

        if (maxRooms) {
            if (!company.settings) company.settings = {};
            company.settings.maxRooms = maxRooms;
        }

        if (expiryDate) {
            if (!company.subscription) company.subscription = {};
            company.subscription.expiryDate = expiryDate;
        }

        if (req.file) {
            company.logo = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        await company.save();
        res.json({ message: 'Company updated successfully', company });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Current Logged in User's Company Details
// @route   GET /api/admin/society
// @access  Admin/User
const getMyCompany = async (req, res) => {
    try {
        const companyId = req.user.company;
        if (!companyId) {
            return res.status(404).json({ message: 'No company associated with user' });
        }
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json(company);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Current Logged in User's Company Logo/Details
// @route   PUT /api/admin/society
// @access  Admin
const updateMyCompany = async (req, res) => {
    try {
        const companyId = req.user.company;
        if (!companyId) {
            return res.status(404).json({ message: 'No company associated with user' });
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const { name, address, contactNumber } = req.body;

        if (name) company.name = name;
        if (address) company.address = address;
        if (contactNumber) company.contactNumber = contactNumber;

        if (req.body.lateFeeEnabled !== undefined || req.body.dailyFine !== undefined) {
            if (!company.settings) company.settings = {};
            if (!company.settings.lateFeeRule) company.settings.lateFeeRule = {};

            if (req.body.lateFeeEnabled !== undefined) {
                // Handle "true"/"false" strings from multipart
                const val = req.body.lateFeeEnabled;
                company.settings.lateFeeRule.enabled = (val === true || val === 'true');
            }
            if (req.body.dailyFine !== undefined) {
                company.settings.lateFeeRule.dailyFine = Number(req.body.dailyFine);
            }
        }

        // Payment Gateway Settings
        if (req.body.razorpayKeyId || req.body.razorpayKeySecret || req.body.razorpayActive !== undefined) {
            if (!company.paymentGateway) company.paymentGateway = {};

            if (req.body.razorpayKeyId) company.paymentGateway.keyId = req.body.razorpayKeyId;
            if (req.body.razorpayKeySecret) company.paymentGateway.keySecret = req.body.razorpayKeySecret;
            if (req.body.razorpayActive !== undefined) {
                const val = req.body.razorpayActive;
                company.paymentGateway.isActive = (val === true || val === 'true');
            }
        }

        if (req.file) {
            company.logo = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        await company.save();
        res.json({ message: 'Society details updated successfully', company });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createCompany,
    getCompanies,
    updateCompanySettings,
    deleteCompany,
    updateCompany,
    getMyCompany,
    updateMyCompany
};
