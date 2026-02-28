const Plan = require('../models/Plan');

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public
const getPlans = async (req, res) => {
    try {
        const plans = await Plan.find({}).sort({ price: 1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a plan
// @route   POST /api/plans
// @access  Private (Super Admin)
const createPlan = async (req, res) => {
    console.log("Create Plan Request Body:", req.body);
    console.log("User Role:", req.user.role);
    try {
        const { name, durationDays, price, features, maxRooms, isPopular } = req.body;

        // Validation
        if (!name || durationDays === undefined || price === undefined) {
            console.log("Validation Failed");
            return res.status(400).json({ message: 'Please include Name, Duration, and Price' });
        }

        const plan = await Plan.create({
            name,
            durationDays,
            price,
            features,
            maxRooms,
            isPopular
        });
        console.log("Plan Created:", plan);
        res.status(201).json(plan);
    } catch (error) {
        console.error("Create Plan Error:", error);
        res.status(400).json({ message: 'Invalid plan data', error: error.message });
    }
};

// @desc    Seed default plans
// @route   POST /api/plans/seed
// @access  Private (Super Admin)
const seedPlans = async (req, res) => {
    try {
        await Plan.deleteMany();
        const plans = [
            {
                name: 'Basic',
                durationDays: 30,
                price: 499,
                features: ['Up to 50 Flats', 'Basic Maintenance', 'Email Support'],
                maxRooms: 50,
                isPopular: false
            },
            {
                name: 'Standard',
                durationDays: 365,
                price: 4999,
                features: ['Up to 150 Flats', 'Advanced Reports', 'Priority Support', 'Email & SMS'],
                maxRooms: 150,
                isPopular: true
            },
            {
                name: 'Premium',
                durationDays: 365,
                price: 9999,
                features: ['Unlimited Flats', 'Dedicated Manager', 'API Access', 'White Labeling'],
                maxRooms: 9999,
                isPopular: false
            }
        ];
        await Plan.insertMany(plans);
        res.json({ message: 'Plans seeded' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getPlans, createPlan, seedPlans };
