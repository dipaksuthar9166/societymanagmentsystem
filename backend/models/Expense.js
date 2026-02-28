const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema({
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Company',
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        enum: ['Guard Salary', 'Cleaning Staff Salary', 'Electrician Charges', 'Plumber Charges', 'Gardener Charges', 'Maintenance Staff', 'Security Equipment', 'Cleaning', 'Security', 'Repairs', 'Electricity', 'Water', 'Staff Salary', 'Others'],
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    description: {
        type: String,
    },
    paidTo: {
        type: String,
        required: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Expense', expenseSchema);
