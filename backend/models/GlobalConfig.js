const mongoose = require('mongoose');

const globalConfigSchema = mongoose.Schema({
    currency: { type: String, default: 'INR (₹)' },
    gstPercentage: { type: Number, default: 18 },
    maintenanceMode: { type: Boolean, default: false },
    lateFeeDaily: { type: Number, default: 50 },
    gracePeriod: { type: Number, default: 10 },
    whatsappEnabledGlobal: { type: Boolean, default: true },
    smsEnabledGlobal: { type: Boolean, default: false },
    paymentGatewayActive: { type: Boolean, default: false },
    razorpayKey: { type: String },
    razorpaySecret: { type: String },
    festiveThemeOverride: { type: String, default: null } // 'off', null (auto), or 'diwali', 'new_year', etc.
}, {
    timestamps: true,
});

module.exports = mongoose.model('GlobalConfig', globalConfigSchema);
