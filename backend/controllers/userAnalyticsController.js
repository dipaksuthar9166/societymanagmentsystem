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

        // Get all users in society
        const users = await User.find({ company: societyId }).select('name email flatNo');

        // Get payment data for each user
        const userPayments = await Promise.all(
            users.map(async (user) => {
                const paid = await Transaction.aggregate([
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(user._id),
                            status: 'Success',
                            createdAt: { $gte: startDate }
                        }
                    },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);

                // Pending should calculate ALL outstanding invoices, regardless of date
                const pending = await Invoice.aggregate([
                    {
                        $match: {
                            customerId: new mongoose.Types.ObjectId(user._id),
                            status: 'Pending'
                        }
                    },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                ]);

                const complaints = await Complaint.countDocuments({
                    raisedBy: user._id,
                    createdAt: { $gte: startDate }
                });

                const lastActivity = await ActivityLog.findOne({
                    user: user._id
                }).sort({ createdAt: -1 });

                return {
                    name: user.name,
                    email: user.email,
                    flatNo: user.flatNo || 'N/A',
                    paid: paid[0]?.total || 0,
                    pending: pending[0]?.total || 0,
                    complaints,
                    lastActive: lastActivity
                        ? new Date(lastActivity.createdAt).toLocaleDateString()
                        : 'Never'
                };
            })
        );

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
