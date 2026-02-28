const Expense = require('../models/Expense');

// @desc    Get all expenses for a society
// @route   GET /api/admin/expenses
// @access  Admin
const getExpenses = async (req, res) => {
    try {
        const societyId = req.user.company;
        if (!societyId) {
            return res.status(400).json({ message: 'No society associated' });
        }
        const expenses = await Expense.find({ societyId }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create an expense
// @route   POST /api/admin/expenses
// @access  Admin
const createExpense = async (req, res) => {
    const { title, amount, category, date, description, paidTo } = req.body;
    try {
        const societyId = req.user.company;
        if (!societyId) {
            return res.status(400).json({ message: 'No society associated' });
        }
        const expense = await Expense.create({
            societyId,
            title,
            amount,
            category,
            date,
            description,
            paidTo
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/admin/expenses/:id
// @access  Admin
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        if (expense.societyId.toString() !== req.user.company.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await expense.deleteOne();
        res.json({ message: 'Expense removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getExpenses,
    createExpense,
    deleteExpense
};
