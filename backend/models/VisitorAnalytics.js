const mongoose = require('mongoose');

const visitorAnalyticsSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true
    },
    city: String,
    country: String,
    region: String,
    browser: String,
    os: String,
    device: String,
    deviceModel: String,
    deviceVendor: String,
    path: String, // Which page they visited
    referrer: String, // Where they came from
    visitedAt: {
        type: Date,
        default: Date.now
    },
    sessionId: String, // To group page views into a session
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    userName: String,
    userEmail: String
}, { timestamps: true });

// Index for fast querying of recent visits
visitorAnalyticsSchema.index({ visitedAt: -1 });
visitorAnalyticsSchema.index({ sessionId: 1 });

module.exports = mongoose.model('VisitorAnalytics', visitorAnalyticsSchema);
