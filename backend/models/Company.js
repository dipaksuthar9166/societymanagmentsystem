const mongoose = require('mongoose');

const companySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a company name'],
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'Please add a company email'],
        unique: true,
    },
    address: {
        type: String,
    },
    contactNumber: {
        type: String,
    },
    gstNumber: {
        type: String, // Added GST
    },
    upiId: {
        type: String, // Added UPI ID for QR Code
    },
    logo: {
        type: String, // URL to logo
        default: 'https://cdn-icons-png.flaticon.com/512/270/270014.png' // Default placeholder
    },
    plan: {
        type: String,
        enum: ['Basic', 'Pro', 'Enterprise'],
        default: 'Basic',
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended', 'Frozen'],
        default: 'Active',
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    settings: {
        maxRooms: { type: Number, default: 50 },
        whatsappEnabled: { type: Boolean, default: false },
        structureGenerated: { type: Boolean, default: false },
        lateFeeRule: {
            enabled: { type: Boolean, default: false },
            gracePeriodDays: { type: Number, default: 10 },
            dailyFine: { type: Number, default: 0 }
        }
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        default: null
    },
    paymentGateway: {
        keyId: { type: String }, // Razorpay Key ID
        keySecret: { type: String }, // Razorpay Key Secret
        isActive: { type: Boolean, default: false }
    },
    subscription: {
        planName: String, // Cached for easier access
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        status: {
            type: String,
            enum: ['Active', 'Expired', 'Grace'],
            default: 'Active'
        },
        autoRenew: { type: Boolean, default: false }
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Company', companySchema);
