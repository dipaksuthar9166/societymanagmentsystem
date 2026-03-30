const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { logActivity } = require('../utils/activityLogger');
const ActivityLog = require('../models/ActivityLog');

/**
 * @route   POST /api/test/create-sample-activities
 * @desc    Create sample activities for testing
 * @access  Private (Admin)
 */
router.post('/create-sample-activities', protect, async (req, res) => {
    try {
        const societyId = req.user.company || req.user.society;

        if (!societyId) {
            return res.status(400).json({ message: 'Society ID not found' });
        }

        // Clear existing activities for this society
        await ActivityLog.deleteMany({ society: societyId });

        // Create sample activities
        const sampleActivities = [
            {
                userId: req.user._id,
                society: societyId,
                action: 'LOGIN',
                category: 'INFO',
                description: `${req.user.name} logged in successfully`,
                metadata: { role: req.user.role, flatNo: req.user.flatNo },
                isRead: false,
                createdAt: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
            },
            {
                userId: req.user._id,
                society: societyId,
                action: 'COMPLAINT_CREATED',
                category: 'INFO',
                description: `Rajesh Shah created a new complaint: Water Leakage`,
                metadata: { category: 'Plumbing', flatNo: 'B-404' },
                isRead: false,
                createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
            },
            {
                userId: req.user._id,
                society: societyId,
                action: 'PAYMENT_SUCCESS',
                category: 'SUCCESS',
                description: `✅ Amit Patel successfully paid ₹5000 for maintenance`,
                metadata: { amount: 5000, flatNo: 'A-201' },
                isRead: false,
                createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
            },
            {
                userId: req.user._id,
                society: societyId,
                action: 'COMPLAINT_UPDATED',
                category: 'SUCCESS',
                description: `✅ Admin resolved a complaint`,
                metadata: { complaintId: 'xyz123' },
                isRead: false,
                createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
            },
            {
                userId: req.user._id,
                society: societyId,
                action: 'LOGIN',
                category: 'WARNING',
                description: `Failed login attempt for user@example.com`,
                metadata: { reason: 'Invalid password' },
                isRead: false,
                createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
            },
            {
                userId: req.user._id,
                society: societyId,
                action: 'PAYMENT_INITIATED',
                category: 'INFO',
                description: `Priya Sharma initiated payment of ₹3000`,
                metadata: { amount: 3000, flatNo: 'C-305' },
                isRead: false,
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
            },
            {
                userId: req.user._id,
                society: societyId,
                action: 'EMERGENCY_ALERT',
                category: 'CRITICAL',
                description: `🚨 EMERGENCY from B-404 - Medical assistance required`,
                metadata: { flatNo: 'B-404', type: 'Medical' },
                isRead: true,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            }
        ];

        // Insert all sample activities
        const activities = await ActivityLog.insertMany(sampleActivities);

        // Emit real-time event for the latest activity
        if (global.io) {
            global.io.to(`society_${societyId}`).emit('newActivity', activities[0]);
        }

        res.json({
            success: true,
            message: `Created ${activities.length} sample activities!`,
            count: activities.length,
            societyId,
            activities: activities.map(a => ({
                description: a.description,
                category: a.category,
                createdAt: a.createdAt
            }))
        });
    } catch (error) {
        console.error('Create sample activities error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   POST /api/test/activity
 * @desc    Test activity logging (for debugging)
 * @access  Private
 */
router.post('/activity', protect, async (req, res) => {
    try {
        const societyId = req.user.company || req.user.society;

        if (!societyId) {
            return res.status(400).json({ message: 'Society ID not found' });
        }

        // Create test activity
        await logActivity({
            userId: req.user._id,
            societyId: societyId,
            action: 'LOGIN',
            category: 'INFO',
            description: `🧪 TEST: ${req.user.name} triggered a test activity`,
            metadata: {
                test: true,
                timestamp: new Date()
            },
            req
        });

        res.json({
            success: true,
            message: 'Test activity created! Check admin dashboard bell icon.',
            societyId
        });
    } catch (error) {
        console.error('Test activity error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Import Models
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const Complaint = require('../models/Complaint');
const mongoose = require('mongoose');

// ... (Previous routes)

/**
 * @route   POST /api/test/generate-analytics-data
 * @desc    Generate comprehensive dummy data for User Analytics
 * @access  Private (Admin)
 */
router.post('/generate-analytics-data', protect, async (req, res) => {
    try {
        const societyId = req.user.company || req.user.society;
        if (!societyId) {
            return res.status(400).json({ message: 'Society ID not found' });
        }

        // 1. Fix Missing Flat Numbers & Get Users
        const users = await User.find({ company: societyId });
        const blocks = ['A', 'B', 'C', 'D'];

        for (const user of users) {
            if (!user.flatNo || user.flatNo === 'N/A') {
                const randomBlock = blocks[Math.floor(Math.random() * blocks.length)];
                const randomNumber = Math.floor(Math.random() * 900) + 101;
                user.flatNo = `${randomBlock}-${randomNumber}`;
                await user.save();
            }
        }

        // 2. Clear old test data (Optional: Remove if you want to keep history)
        // await Transaction.deleteMany({ companyId: societyId, orderId: { $regex: 'TEST_' } });
        // await Invoice.deleteMany({ societyId: societyId, notes: 'TEST DATA' });

        // 3. Generate Transactions & Invoices
        let createdTransactions = 0;
        let createdInvoices = 0;
        let createdComplaints = 0;

        for (const user of users) {
            // A. Create Paid Invoices & Transactions (History)
            const numPaid = Math.floor(Math.random() * 5); // 0-4 paid records
            for (let i = 0; i < numPaid; i++) {
                const amount = (Math.floor(Math.random() * 5) + 1) * 1000;
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Last 60 days

                // Create Invoice
                const invoice = await Invoice.create({
                    societyId,
                    adminId: req.user._id,
                    customerId: user._id,
                    customerName: user.name,
                    items: [{ name: 'Maintenance', price: amount, quantity: 1 }],
                    totalAmount: amount,
                    status: 'Paid',
                    billingPeriod: { from: date, to: date },
                    dueDate: date,
                    notes: 'TEST DATA'
                });

                // Create Transaction
                await Transaction.create({
                    companyId: societyId,
                    userId: user._id,
                    invoiceId: invoice._id,
                    amount: amount,
                    paymentId: `TEST_PAY_${Date.now()}_${i}`,
                    orderId: `TEST_ORDER_${Date.now()}_${i}`,
                    status: 'Success',
                    paymentMethod: 'UPI',
                    createdAt: date
                });
                createdTransactions++;
            }

            // B. Create Pending Invoices (Current Dues)
            if (Math.random() > 0.5) { // 50% chance of pending dues
                const amount = (Math.floor(Math.random() * 3) + 1) * 1500;
                await Invoice.create({
                    societyId,
                    adminId: req.user._id,
                    customerId: user._id,
                    customerName: user.name,
                    items: [{ name: 'Penalty / Due', price: amount, quantity: 1 }],
                    totalAmount: amount,
                    status: 'Pending',
                    billingPeriod: { from: new Date(), to: new Date() },
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    notes: 'TEST DATA'
                });
                createdInvoices++;
            }

            // C. Create Complaints
            if (Math.random() > 0.7) { // 30% chance of complaint
                await Complaint.create({
                    societyId,
                    raisedBy: user._id,
                    title: 'Sample Issue',
                    description: 'This is a test complaint description.',
                    category: 'General',
                    status: Math.random() > 0.5 ? 'Pending' : 'Resolved'
                });
                createdComplaints++;
            }
        }

        // 4. Create Activity Logs
        await ActivityLog.create({
            userId: req.user._id,
            society: societyId,
            action: 'DATA_GENERATED',
            category: 'system',
            description: 'Test analytics data generated',
            metadata: { createdTransactions, createdInvoices }
        });

        res.json({
            success: true,
            created: {
                transactions: createdTransactions,
                invoices: createdInvoices,
                complaints: createdComplaints,
                activities: 1
            }
        });

    } catch (error) {
        console.error("Generate Data Error:", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   POST /api/test/seed-system
 * @desc    Initialize the entire system with 3 premium societies and data
 * @access  Private (SuperAdmin)
 */
router.post('/seed-system', protect, async (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const Company = require('../models/Company');
        const User = require('../models/User');
        const Invoice = require('../models/Invoice');
        const Transaction = require('../models/Transaction');
        const Complaint = require('../models/Complaint');
        const Asset = require('../models/Asset');

        // 1. Create 3 Societies
        const societiesData = [
            { name: 'Status Sharan Premium', address: 'Ahmedabad, Gujarat', plan: 'Premium', status: 'Active' },
            { name: 'Nexus Heights', address: 'Mumbai, Maharashtra', plan: 'Gold', status: 'Active' },
            { name: 'Emerald Valley', address: 'Pune, Maharashtra', plan: 'Standard', status: 'Active' }
        ];

        const createdSocieties = [];
        for (const s of societiesData) {
            let soc = await Company.findOne({ name: s.name });
            if (!soc) soc = await Company.create(s);
            createdSocieties.push(soc);
        }

        // 2. For each society, create 5 residents + 1 admin
        for (const soc of createdSocieties) {
            const adminEmail = `admin@${soc.name.toLowerCase().replace(/\s/g, '')}.com`;
            let admin = await User.findOne({ email: adminEmail });
            if (!admin) {
                admin = await User.create({
                    name: `Admin of ${soc.name}`,
                    email: adminEmail,
                    password: await require('bcryptjs').hash('admin123', 10),
                    role: 'admin',
                    company: soc._id,
                    isVerified: true,
                    status: 'approved'
                });
            }

            for (let i = 1; i <= 5; i++) {
                const userEmail = `user${i}@${soc.name.toLowerCase().replace(/\s/g, '')}.com`;
                let user = await User.findOne({ email: userEmail });
                if (!user) {
                    user = await User.create({
                        name: `Resident ${i}`,
                        email: userEmail,
                        password: await require('bcryptjs').hash('user123', 10),
                        role: 'user',
                        company: soc._id,
                        flatNo: `${String.fromCharCode(64 + i)}-10${i}`,
                        isVerified: true
                    });

                    // 3. Create 3 Transactions for each user
                    for (let j = 0; j < 3; j++) {
                        const amount = 2500 + (j * 500);
                        const inv = await Invoice.create({
                            societyId: soc._id,
                            adminId: admin._id,
                            customerId: user._id,
                            customerName: user.name,
                            items: [{ name: 'Maintenance', price: amount, quantity: 1 }],
                            totalAmount: amount,
                            status: j === 2 ? 'Pending' : 'Paid'
                        });

                        if (j !== 2) {
                            await Transaction.create({
                                companyId: soc._id,
                                userId: user._id,
                                invoiceId: inv._id,
                                amount,
                                status: 'Success',
                                paymentMethod: 'UPI',
                                createdAt: new Date(Date.now() - (j * 10 * 24 * 60 * 60 * 1000))
                            });
                        }
                    }
                }
            }

            // 4. Create Assets
            const assets = ['Main Elevator', 'Diesel Generator', 'Swimming Pool Pump', 'Fire Hydrant System'];
            for (const aName of assets) {
                if (!(await Asset.findOne({ name: aName, society: soc._id }))) {
                    await Asset.create({
                        name: aName,
                        category: 'Infrastructure',
                        location: 'Ground Floor / Common Area',
                        status: 'Operational',
                        society: soc._id
                    });
                }
            }
        }

        res.json({ success: true, message: 'System Seeded with 3 Societies and real data!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
