const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');
const Complaint = require('../models/Complaint');
const ActivityLog = require('../models/ActivityLog');

/**
 * @route   POST /api/test/generate-analytics-data
 * @desc    Generate sample data for analytics testing
 * @access  Private (Admin)
 */
router.post('/generate-analytics-data', protect, async (req, res) => {
    try {
        const societyId = req.user.company;

        if (!societyId) {
            return res.status(400).json({ message: 'Society ID not found' });
        }

        // Get existing users
        const users = await User.find({ company: societyId }).limit(5);

        if (users.length === 0) {
            return res.status(400).json({ message: 'No users found in society' });
        }

        let created = {
            transactions: 0,
            invoices: 0,
            complaints: 0,
            activities: 0
        };

        // Generate sample data for each user
        for (const user of users) {
            // Create transactions (payments)
            const transactionCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < transactionCount; i++) {
                const daysAgo = Math.floor(Math.random() * 30);
                const amount = [3000, 5000, 7000, 10000][Math.floor(Math.random() * 4)];

                await Transaction.create({
                    userId: user._id,
                    amount,
                    status: 'Success',
                    paymentMethod: 'Razorpay',
                    razorpayOrderId: `order_${Date.now()}${i}`,
                    razorpayPaymentId: `pay_${Date.now()}${i}`,
                    createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
                });
                created.transactions++;
            }

            // Create invoices (some pending)
            const invoiceCount = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < invoiceCount; i++) {
                const daysAgo = Math.floor(Math.random() * 30);
                const isPending = Math.random() > 0.5;

                await Invoice.create({
                    userId: user._id,
                    societyId,
                    flatNo: user.flatNo,
                    month: new Date().toLocaleString('default', { month: 'long' }),
                    year: new Date().getFullYear(),
                    maintenanceCharge: 3000,
                    waterCharge: 500,
                    parkingCharge: 1000,
                    totalAmount: 4500,
                    status: isPending ? 'Pending' : 'Paid',
                    createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
                });
                created.invoices++;
            }

            // Create complaints
            const complaintCount = Math.floor(Math.random() * 3);
            for (let i = 0; i < complaintCount; i++) {
                const daysAgo = Math.floor(Math.random() * 30);
                const categories = ['Plumbing', 'Electrical', 'Maintenance', 'Security'];
                const statuses = ['Pending', 'In Progress', 'Resolved'];

                await Complaint.create({
                    raisedBy: user._id,
                    societyId,
                    category: categories[Math.floor(Math.random() * categories.length)],
                    description: `Sample complaint ${i + 1} from ${user.name}`,
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
                });
                created.complaints++;
            }

            // Create activity logs
            const activityCount = Math.floor(Math.random() * 5) + 2;
            for (let i = 0; i < activityCount; i++) {
                const daysAgo = Math.floor(Math.random() * 30);
                const actions = ['LOGIN', 'PAYMENT_SUCCESS', 'COMPLAINT_CREATED', 'FACILITY_BOOKED'];
                const categories = ['INFO', 'SUCCESS', 'WARNING'];

                await ActivityLog.create({
                    user: user._id,
                    society: societyId,
                    action: actions[Math.floor(Math.random() * actions.length)],
                    category: categories[Math.floor(Math.random() * categories.length)],
                    description: `${user.name} performed an action`,
                    metadata: { flatNo: user.flatNo },
                    createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
                });
                created.activities++;
            }
        }

        res.json({
            success: true,
            message: 'Sample analytics data generated successfully!',
            created,
            usersProcessed: users.length
        });
    } catch (error) {
        console.error('Generate analytics data error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
