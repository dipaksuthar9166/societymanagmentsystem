const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Email', 'WhatsApp', 'SMS'],
        required: true
    },
    trigger: {
        type: String,
        enum: ['MANUAL', 'SCHEDULED_MONTHLY', 'USER_REGISTERED', 'PAYMENT_FAILED'],
        default: 'MANUAL'
    },
    content: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SmartAutomation', automationSchema);
