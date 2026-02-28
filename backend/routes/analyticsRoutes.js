const express = require('express');
const router = express.Router();
const VisitorAnalytics = require('../models/VisitorAnalytics');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken'); // New import
const User = require('../models/User'); // New import

// @desc    Track a page view
// @route   POST /api/analytics/track
// @access  Public
router.post('/track', async (req, res) => {
    try {
        const { path, referrer, sessionId } = req.body;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;

        // --- SOFT AUTHENTICATION ---
        let userId = null;
        let userName = 'Guest'; // Default
        let userEmail = null;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                if (token && token !== 'null') {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findById(decoded.id).select('name email');
                    if (user) {
                        userId = user._id;
                        userName = user.name;
                        userEmail = user.email;
                    }
                }
            } catch (authErr) {
                // Token invalid/expired - continue as Guest
            }
        }
        // -----------------------------

        const cleanIp = ip && ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip; // Clean IPv6 to IPv4 if needed


        let geo = geoip.lookup(cleanIp);

        // Simulation for Localhost / Development (Show random cities instead of NULL/Unknown)
        if (!geo && (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.'))) {
            const mockLocations = [
                { city: 'Mumbai', country: 'India', region: 'MH' },
                { city: 'New York', country: 'USA', region: 'NY' },
                { city: 'London', country: 'UK', region: 'ENG' },
                { city: 'Bangalore', country: 'India', region: 'KA' },
                { city: 'Tokyo', country: 'Japan', region: 'JP' },
                { city: 'Dubai', country: 'UAE', region: 'DU' }
            ];
            geo = mockLocations[Math.floor(Math.random() * mockLocations.length)];
        }

        const parser = new UAParser(req.headers['user-agent']);
        const result = parser.getResult();

        const analytics = await VisitorAnalytics.create({
            ip: cleanIp || 'unknown',
            city: geo ? geo.city : 'Unknown',
            country: geo ? geo.country : 'Unknown',
            region: geo ? geo.region : 'Unknown', // State
            browser: result.browser.name,
            os: result.os.name,
            device: result.device.type || 'desktop',
            deviceModel: result.device.model || 'Unknown',
            deviceVendor: result.device.vendor || 'Unknown',
            path: path,
            referrer: referrer,
            sessionId: sessionId || uuidv4(),
            userId: userId,
            userName: userName,
            userEmail: userEmail
        });

        // Emit real-time update to Super Admin room
        if (global.io) {
            global.io.emit('new_visitor', {
                ...analytics._doc,
                count: await VisitorAnalytics.countDocuments({ visitedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } }) // Active in last 5 min
            });
        }

        res.status(201).json({ sessionId: analytics.sessionId });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(200).send('OK'); // Fail silently to not break client
    }
});

// @desc    Get Live Visitors & Historical Data
// @route   GET /api/analytics/dashboard
// @access  Super Admin (Protected)
const { protect, authorize } = require('../middleware/authMiddleware');
const { getUserAnalytics } = require('../controllers/userAnalyticsController');

// @desc    Get Detailed User Analytics (Admin/SuperAdmin)
// @route   GET /api/analytics/user-analytics
// @access  Private (Admin, SuperAdmin)
router.get('/user-analytics', protect, authorize('admin', 'superadmin'), getUserAnalytics);

router.get('/dashboard', protect, authorize('superadmin'), async (req, res) => {
    try {
        // 1. Live Visitors (Active in last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const liveVisitorsCount = await VisitorAnalytics.distinct('sessionId', { visitedAt: { $gte: fiveMinutesAgo } });

        const liveVisitors = await VisitorAnalytics.aggregate([
            { $match: { visitedAt: { $gte: fiveMinutesAgo } } },
            { $group: { _id: '$sessionId', details: { $first: '$$ROOT' } } }, // Group by session to get unique active users
            { $replaceRoot: { newRoot: '$details' } },
            { $project: { ip: 0 } } // Hide IP for privacy in dashboard list if needed
        ]);

        // 2. Total Visits (Last 24 Hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dailyVisits = await VisitorAnalytics.countDocuments({ visitedAt: { $gte: twentyFourHoursAgo } });

        // 3. Top Countries (All Time)
        const topCountries = await VisitorAnalytics.aggregate([
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 4. Device Usage
        const devices = await VisitorAnalytics.aggregate([
            { $group: { _id: '$device', count: { $sum: 1 } } }
        ]);

        res.json({
            live: {
                count: liveVisitorsCount.length,
                visitors: liveVisitors
            },
            stats: {
                daily: dailyVisits,
                countries: topCountries,
                devices: devices
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
