const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Expense = require('../models/Expense');

// @route   GET /api/expenses
// @desc    Get all expenses for admin's society
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const expenses = await Expense.find({ societyId: req.user.company })
            .sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { title, amount, category, date, paidTo, notes } = req.body;

        const expense = await Expense.create({
            societyId: req.user.company,
            adminId: req.user._id,
            title,
            amount,
            category,
            date,
            paidTo,
            notes
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check if expense belongs to admin's society
        if (expense.societyId.toString() !== req.user.company.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await expense.deleteOne();
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
