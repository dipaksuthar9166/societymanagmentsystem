const mongoose = require('mongoose');

const commLogSchema = mongoose.Schema({
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['WhatsApp', 'SMS', 'Email'],
        required: true
    },
    status: {
        type: String,
        enum: ['Sent', 'Delivered', 'Failed'],
        default: 'Sent'
    },
    content: String,
    errorMessage: String,
    sentAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CommLog', commLogSchema);
