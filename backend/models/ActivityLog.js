const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    society: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            // Authentication
            'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE',
            // Payments
            'PAYMENT_INITIATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED',
            // Documents
            'DOCUMENT_UPLOADED', 'DOCUMENT_DOWNLOADED', 'DOCUMENT_DELETED',
            // Complaints
            'COMPLAINT_CREATED', 'COMPLAINT_UPDATED', 'COMPLAINT_RESOLVED',
            // Emergency
            'EMERGENCY_ALERT', 'SOS_TRIGGERED',
            // Facility
            'FACILITY_BOOKED', 'FACILITY_CANCELLED',
            // Gate Pass
            'GATE_PASS_CREATED', 'GATE_PASS_USED',
            // Profile
            'PROFILE_UPDATED', 'PROFILE_VIEWED',
            // Admin Actions
            'INVOICE_GENERATED', 'USER_CREATED', 'USER_DELETED',
            'NOTICE_PUBLISHED', 'EXPENSE_ADDED',
            // Other
            'OTHER'
        ]
    },
    category: {
        type: String,
        required: true,
        enum: ['INFO', 'SUCCESS', 'WARNING', 'CRITICAL'],
        default: 'INFO'
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for faster queries
activityLogSchema.index({ society: 1, createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ category: 1, createdAt: -1 });
activityLogSchema.index({ isRead: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
