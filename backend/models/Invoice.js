const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    customerName: {
        type: String,
        required: true,
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        default: 'Maintenance' // Maintenance, Rent, Adhoc
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Overdue'],
        default: 'Pending',
    },
    oldArrears: {
        type: Number,
        default: 0
    },
    billingPeriod: {
        from: { type: Date },
        to: { type: Date }
    },
    dueDate: {
        type: Date
    },
    penalty: {
        type: Number,
        default: 0
    },
    lastPenaltyDate: { type: Date },
    notes: { type: String },
    subtotal: {
        type: Number,
        default: 0
    },
    gstPercentage: {
        type: Number,
        default: 18
    },
    gstAmount: {
        type: Number,
        default: 0
    },
    lastRemindedAt: { type: Date }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Invoice', invoiceSchema);
