const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const User = require('../models/User');
const Flat = require('../models/Flat');
const mongoose = require('mongoose');

// @desc    Get dashboard analytics (finance overview)
// @route   GET /api/analytics/overview
// @access  Private (Admin)
const getAnalyticsOverview = async (req, res) => {
    try {
        const societyId = new mongoose.Types.ObjectId(req.user.company); 
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Run all aggregations in parallel for better performance
        const [
            totalCollectedResult, 
            totalPendingResult, 
            totalExpensesResult, 
            incomeTrend, 
            expenseTrend, 
            expenseCategory
        ] = await Promise.all([
            Invoice.aggregate([
                { $match: { societyId: societyId, status: 'Paid' } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            Invoice.aggregate([
                { $match: { societyId: societyId, status: 'Pending' } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            Expense.aggregate([
                { $match: { societyId: societyId } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            Invoice.aggregate([
                { $match: { societyId: societyId, status: 'Paid', updatedAt: { $gte: sixMonthsAgo } } },
                { $group: { _id: { $month: "$updatedAt" }, amount: { $sum: "$totalAmount" } } },
                { $sort: { "_id": 1 } }
            ]),
            Expense.aggregate([
                { $match: { societyId: societyId, date: { $gte: sixMonthsAgo } } },
                { $group: { _id: { $month: "$date" }, amount: { $sum: "$amount" } } },
                { $sort: { "_id": 1 } }
            ]),
            Expense.aggregate([
                { $match: { societyId: societyId } },
                { $group: { _id: "$category", value: { $sum: "$amount" } } }
            ])
        ]);

        const totalCollected = totalCollectedResult[0]?.total || 0;
        const totalPending = totalPendingResult[0]?.total || 0;
        const totalExpenses = totalExpensesResult[0]?.total || 0;

        res.json({
            financials: {
                totalCollected,
                totalPending,
                totalExpenses,
                netBalance: totalCollected - totalExpenses
            },
            trends: {
                income: incomeTrend,
                expense: expenseTrend
            },
            expenseDistribution: expenseCategory
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get Defaulters List
// @route   GET /api/analytics/defaulters
// @access  Private (Admin)
const getDefaulters = async (req, res) => {
    try {
        const societyId = req.user.company;

        const defaulters = await Invoice.aggregate([
            { $match: { societyId: societyId, status: 'Pending' } },
            {
                $group: {
                    _id: "$customerId", 
                    totalDue: { $sum: "$totalAmount" },
                    invoices: { $push: { id: "$_id", amount: "$totalAmount", date: "$createdAt", type: "$type" } }
                }
            },
            { $sort: { totalDue: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    name: "$user.name",
                    email: "$user.email",
                    phone: "$user.phone",
                    flatId: "$user.flatId",
                    totalDue: 1,
                    invoices: 1
                }
            },
            {
                $lookup: {
                    from: "flats",
                    localField: "flatId",
                    foreignField: "_id",
                    as: "flat"
                }
            },
            { $unwind: { path: "$flat", preserveNullAndEmptyArrays: true } }
        ]);

        res.json(defaulters);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAnalyticsOverview,
    getAdminStats: getAnalyticsOverview, 
    getAdminDetailedAnalytics: getAnalyticsOverview, 
    getDefaulters
};
