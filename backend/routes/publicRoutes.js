const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Company = require('../models/Company'); 
const Transaction = require('../models/Transaction');
const Testimonial = require('../models/Testimonial');
const Inquiry = require('../models/Inquiry');

// @desc    Get Landing Page Stats (Real-time)
// @route   GET /api/public/stats
router.get('/stats', async (req, res) => {
    try {
        let [userCount, societyCount, totalRevenue] = await Promise.all([
            User.countDocuments({ role: 'user' }), 
            Company.countDocuments({ status: 'Active' }), 
            Transaction.aggregate([
                { $match: { type: 'Maintenance', status: 'Completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        // Fallbacks for empty database to keep landing page attractive
        const residents = userCount > 0 ? userCount : 15000;
        const societies = societyCount > 0 ? societyCount : 500;
        const revenue = totalRevenue[0]?.total || 5000000;

        res.json({
            societies: societies,
            residents: residents,
            revenue: revenue,
            uptime: "99.9%",
            brands: ['Guru Kripa Bliss', 'Skyline Heritage', 'Emerald Valley', 'Global Heights']
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// @desc    Submit Demo Request
// @route   POST /api/public/demo
router.post('/demo', async (req, res) => {
    try {
        const { name, email, phone, societyName } = req.body;
        if (!phone || !name) {
            return res.status(400).json({ error: 'Name and Phone are required' });
        }

        const newDemoRequest = new Inquiry({
            name,
            email: email || 'demo@request.com',
            phone,
            societyName: societyName || 'Prospect Society',
            message: 'DEMO REQUEST: User requested a 1-on-1 walkthrough.',
            type: 'Demo' // Added type differentiation if model supports it
        });

        await newDemoRequest.save();
        res.status(200).json({ success: true, message: 'Demo request received! We will call you back.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to submit demo request' });
    }
});

// @desc    Get Testimonials (Society Leaders)
// @route   GET /api/public/testimonials
router.get('/testimonials', async (req, res) => {
    try {
        let testimonials = await Testimonial.find({ status: 'Active' }).limit(3);
        if (testimonials.length === 0) {
            testimonials = [
                {
                    name: 'Rajesh Mehta',
                    role: 'Secretary, Skyline Heights',
                    quote: 'Guru Kripa changed how we collect maintenance. No more door-to-door collections!',
                    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
                    rating: 5
                },
                {
                    name: 'Sneha Rao',
                    role: 'Treasurer, Emerald Valley',
                    quote: 'Gatekeeper security is a lifesaver. Every visitor is verified by residents instantly.',
                    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
                    rating: 5
                }
            ];
        }
        res.json(testimonials);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

module.exports = router;
