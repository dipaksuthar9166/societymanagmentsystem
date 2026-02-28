const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['SYSTEM', 'BROADCAST', 'BILLING', 'ALERT'],
        default: 'SYSTEM'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['LOW', 'NORMAL', 'HIGH'],
        default: 'NORMAL'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
