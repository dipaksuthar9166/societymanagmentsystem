const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Company = require('../models/Company'); // Society
const Transaction = require('../models/Transaction');
const Testimonial = require('../models/Testimonial');

// @desc    Get Landing Page Stats
// @route   GET /api/public/stats
// @access  Public
router.get('/stats', async (req, res) => {
    try {
        const [userCount, societyCount, totalRevenue] = await Promise.all([
            User.countDocuments({ role: 'user' }), // Total Residents
            Company.countDocuments({ status: 'Active' }), // Total Societies
            Transaction.aggregate([
                { $match: { type: 'Maintenance', status: 'Completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        res.json({
            societies: societyCount || 0,
            residents: userCount || 0,
            revenue: totalRevenue[0]?.total || 0,
            uptime: "99.9%"
        });
    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// @desc    Get Active Societies (Projects)
// @route   GET /api/public/projects
// @access  Public
router.get('/projects', async (req, res) => {
    try {
        // Return top 4 active societies for the Project Section
        const projects = await Company.find({ status: 'Active' })
            .select('name address logo _id plan')
            .limit(4)
            .sort({ createdAt: -1 });

        // Transform for frontend
        const formattedProjects = projects.map(p => ({
            id: p._id,
            title: p.name,
            location: p.address || 'Premium Location',
            img: p.logo || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', // Fallback
            badge: p.plan || 'Premium',
            price: '98% Occupancy' // Mock for now
        }));

        res.json(formattedProjects);
    } catch (err) {
        console.error('Projects Error:', err);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// @desc    Get Testimonials
// @route   GET /api/public/testimonials
// @access  Public
router.get('/testimonials', async (req, res) => {
    try {
        let testimonials = await Testimonial.find({ status: 'Active' }).sort({ createdAt: -1 });

        // Seed if empty (for demo purposes)
        if (testimonials.length === 0) {
            const seedData = [
                {
                    name: 'Renu S.',
                    role: 'Secretary, Gokuldham',
                    quote: 'Nexus OS has transformed our community management, making it secure, transparent, and absolutely seamless.',
                    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
                    rating: 5,
                    status: 'Active'
                },
                {
                    name: 'Ankit Verma',
                    role: 'Treasurer, Blue Ridge',
                    quote: 'The automated billing saved us 40 hours of manual work every month. Best investment for our society.',
                    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
                    rating: 5,
                    status: 'Active'
                }
            ];
            await Testimonial.insertMany(seedData);
            testimonials = await Testimonial.find({ status: 'Active' });
        }

        res.json(testimonials);
    } catch (err) {
        console.error('Testimonials Error:', err);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

// @desc    Get Trusted Brands/Stats for Trust Section
// @route   GET /api/public/trust
// @access  Public
router.get('/trust', async (req, res) => {
    // Return mock brands for now, or fetch if we had a Partner model
    res.json(['Gecina', 'Booking.com', 'Brookfield', 'Century 21', 'JLL']);
});

const Inquiry = require('../models/Inquiry');

// @desc    Submit Contact Form
// @route   POST /api/public/contact
// @access  Public
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, societyName, message } = req.body;

        // Validate
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Please enter all required fields' });
        }

        const newInquiry = new Inquiry({
            name,
            email,
            phone: phone || 'N/A',
            societyName: societyName || 'N/A',
            message
        });

        await newInquiry.save();

        // TODO: Add Nodemailer here for real-time email notifications
        console.log(`[Contact Form Saved] From: ${name} (${email})`);

        res.status(200).json({
            success: true,
            message: 'Your message has been received. We will contact you shortly.'
        });
    } catch (err) {
        console.error('Contact Submit Error:', err);
        res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }
});

module.exports = router;
