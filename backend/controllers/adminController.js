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
// @access  Admin
const deleteCustomer = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify user belongs to admin's company
        if (user.company.toString() !== req.user.company.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getCustomers,
    createCustomer,
    deleteCustomer
};
