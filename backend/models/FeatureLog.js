const mongoose = require('mongoose');

// Used for SOS Alerts, Parking Bookings, Skill Listings, etc
const featureLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['SOS_ALERT', 'SKILL_LISTING', 'ASSET_RENTAL', 'PARKING_BOOKING', 'COMPLAINT', 'IOT_ALERT'],
        required: true
    },
    title: { type: String, required: true },
    description: String,
    status: {
        type: String,
        enum: ['ACTIVE', 'RESOLVED', 'PENDING', 'APPROVED', 'REJECTED'],
        default: 'ACTIVE'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    society: { // Optional if global/superadmin scope
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FeatureLog', featureLogSchema);
