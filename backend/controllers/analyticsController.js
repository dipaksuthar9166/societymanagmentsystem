const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const User = require('../models/User');
const Flat = require('../models/Flat');
const mongoose = require('mongoose');

// @desc    Get dashboard analytics (finance overview)
// @route   GET /api/analytics/overview
// @access  Private (Admin)
// @desc    Get dashboard analytics (finance overview)
// @route   GET /api/analytics/overview
// @access  Private (Admin)
const getAnalyticsOverview = async (req, res) => {
    try {
        const societyId = new mongoose.Types.ObjectId(req.user.company); // User model uses 'company', Invoice/Expense uses 'societyId'

        // 1. Total Financials
        const totalCollectedResult = await Invoice.aggregate([
            { $match: { societyId: societyId, status: 'Paid' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalCollected = totalCollectedResult[0]?.total || 0;

        const totalPendingResult = await Invoice.aggregate([
            { $match: { societyId: societyId, status: 'Pending' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalPending = totalPendingResult[0]?.total || 0;

        const totalExpensesResult = await Expense.aggregate([
            { $match: { societyId: societyId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalExpenses = totalExpensesResult[0]?.total || 0;

        // 2. Monthly Trends (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const incomeTrend = await Invoice.aggregate([
            { $match: { societyId: societyId, status: 'Paid', updatedAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: "$updatedAt" },
                    amount: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const expenseTrend = await Expense.aggregate([
            { $match: { societyId: societyId, date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: "$date" },
                    amount: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 3. Expense Distribution (by Category)
        const expenseCategory = await Expense.aggregate([
            { $match: { societyId: societyId } },
            {
                $group: {
                    _id: "$category",
                    value: { $sum: "$amount" }
                }
            }
        ]);


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

        // Find Pending Invoices and group by User/Flat
        // We want to know WHO owns money and for WHICH flat
        const defaulters = await Invoice.aggregate([
            { $match: { societyId: societyId, status: 'Pending' } },
            {
                $group: {
                    _id: "$customerId", // User ID
                    totalDue: { $sum: "$totalAmount" },
                    invoices: { $push: { id: "$_id", amount: "$totalAmount", date: "$createdAt", type: "$type" } }
                }
            },
            { $sort: { totalDue: -1 } },
            // Lookup user details
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
            // Lookup flat details (optional, if user has flatId populated usually)
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
    getAdminStats: getAnalyticsOverview, // Alias for backward compatibility
    getAdminDetailedAnalytics: getAnalyticsOverview, // Alias for now
    getDefaulters
};
