const mongoose = require('mongoose');

const LegalNoticeSchema = new mongoose.Schema({
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    },
    noticeNumber: {
        type: String,
        required: true,
        unique: true
    },
    subject: {
        type: String,
        default: 'LEGAL NOTICE: Final Demand for Payment'
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Acknowledged', 'Resolved'],
        default: 'Draft'
    },
    sentAt: Date,
    documents: [String], // URLs to signed copies/PDFs
    history: [{
        action: String,
        date: { type: Date, default: Date.now },
        note: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('LegalNotice', LegalNoticeSchema);
