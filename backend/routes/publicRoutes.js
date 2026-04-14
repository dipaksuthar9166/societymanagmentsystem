const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Company = require('../models/Company'); 
const Transaction = require('../models/Transaction');
const Testimonial = require('../models/Testimonial');
const Inquiry = require('../models/Inquiry');
const FAQ = require('../models/FAQ');

// @desc    Get FAQs
router.get('/faqs', async (req, res) => {
    try {
        let faqs = await FAQ.find({ status: 'Active' }).sort({ order: 1 });
        if (faqs.length === 0) {
            faqs = [
                { question: "Is our society's data secure?", answer: "Yes, we use bank-level AES-256 encryption. Your resident and financial data is highly secure." },
                { question: "How long to get started?", answer: "A society can go live in less than 24 hours with our easy upload." },
                { question: "Can residents pay via UPI?", answer: "Yes! Guru Kripa supports UPI, Credit Cards, and Net Banking." }
            ];
        }
        res.json(faqs);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// @desc    Get Landing Page Stats
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
        res.json({
            societies: societyCount || 500,
            residents: userCount || 15000,
            revenue: totalRevenue[0]?.total || 5000000,
            brands: ['Guru Kripa Bliss', 'Skyline Heritage', 'Emerald Valley']
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// @desc    Real-time Search Societies
// @route   GET /api/public/search
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const societies = await Company.find({
            name: { $regex: q, $options: 'i' },
            status: 'Active'
        }).select('name address logo _id').limit(5);

        res.json(societies);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// @desc    Submit Demo Request
router.post('/demo', async (req, res) => {
    try {
        const { name, email, phone, societyName } = req.body;
        const newInquiry = new Inquiry({ name, email, phone, societyName, type: 'Demo', message: 'Requested Demo' });
        await newInquiry.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// @desc    Submit Contact Form
router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newInquiry = new Inquiry({ name, email, message, type: 'Contact' });
        await newInquiry.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

// @desc    Get Testimonials
router.get('/testimonials', async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ status: 'Active' });
        res.json(testimonials);
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
