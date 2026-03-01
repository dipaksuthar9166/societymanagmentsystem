const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');

/**
 * @route   GET /api/analytics/user-analytics
 * @desc    Get comprehensive user analytics
 * @access  Admin
 */
const getUserAnalytics = async (req, res) => {
    try {
        const societyId = req.user.company;
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get all users in society with minimal fields
        const users = await User.find({ company: societyId }).select('name email flatNo _id').lean();
        const userIds = users.map(u => u._id);

        // Fetch all transactions, pending invoices, complaints, and last activities in bulk
        const [transactions, pendingInvoices, complaints, lastActivities] = await Promise.all([
            Transaction.aggregate([
                {
                    $match: {
                        userId: { $in: userIds },
                        status: 'Success',
                        createdAt: { $gte: startDate }
                    }
                },
                { $group: { _id: '$userId', totalPaid: { $sum: '$amount' } } }
            ]),
            Invoice.aggregate([
                {
                    $match: {
                        customerId: { $in: userIds },
                        status: 'Pending'
                    }
                },
                { $group: { _id: '$customerId', totalPending: { $sum: '$totalAmount' } } }
            ]),
            Complaint.aggregate([
                {
                    $match: {
                        raisedBy: { $in: userIds },
                        createdAt: { $gte: startDate }
                    }
                },
                { $group: { _id: '$raisedBy', count: { $sum: 1 } } }
            ]),
            ActivityLog.aggregate([
                {
                    $match: {
                        user: { $in: userIds }
                    }
                },
                { $sort: { createdAt: -1 } },
                {
                    $group: {
                        _id: '$user',
                        lastActive: { $first: '$createdAt' }
                    }
                }
            ])
        ]);

        // Create lookup maps for O(1) matching
        const txMap = new Map(transactions.map(t => [t._id.toString(), t.totalPaid]));
        const invMap = new Map(pendingInvoices.map(i => [i._id.toString(), i.totalPending]));
        const compMap = new Map(complaints.map(c => [c._id.toString(), c.count]));
        const actMap = new Map(lastActivities.map(a => [a._id.toString(), a.lastActive]));

        const userPayments = users.map(user => {
            const uid = user._id.toString();
            return {
                name: user.name,
                email: user.email,
                flatNo: user.flatNo || 'N/A',
                paid: txMap.get(uid) || 0,
                pending: invMap.get(uid) || 0,
                complaints: compMap.get(uid) || 0,
                lastActive: actMap.get(uid)
                    ? new Date(actMap.get(uid)).toLocaleDateString()
                    : 'Never'
            };
        });

        // Summary statistics
        const summary = {
            totalUsers: users.length,
            totalCollected: userPayments.reduce((sum, u) => sum + u.paid, 0),
            totalPending: userPayments.reduce((sum, u) => sum + u.pending, 0),
            activeComplaints: await Complaint.countDocuments({
                societyId,
                status: { $ne: 'Resolved' }
            })
        };

        // Payment distribution
        const paymentDistribution = [
            {
                name: 'Paid',
                value: summary.totalCollected
            },
            {
                name: 'Pending',
                value: summary.totalPending
            }
        ];

        // Activity timeline
        const activityTimeline = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            const logins = await ActivityLog.countDocuments({
                society: societyId,
                action: 'LOGIN',
                createdAt: { $gte: dayStart, $lte: dayEnd }
            });

            const payments = await Transaction.countDocuments({
                createdAt: { $gte: dayStart, $lte: dayEnd },
                status: 'Success'
            });

            const complaints = await Complaint.countDocuments({
                societyId,
                createdAt: { $gte: dayStart, $lte: dayEnd }
            });

            activityTimeline.push({
                date: dateStr,
                logins,
                payments,
                complaints
            });
        }

        // User payment chart data
        const userPaymentChart = userPayments
            .slice(0, 10) // Top 10 users
            .map(u => ({
                name: u.flatNo,
                paid: u.paid,
                pending: u.pending
            }));

        res.json({
            summary,
            userPayments: userPaymentChart,
            paymentDistribution,
            activityTimeline,
            userDetails: userPayments
        });
    } catch (error) {
        console.error('User analytics error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserAnalytics
};
