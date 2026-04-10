const mongoose = require('mongoose');

const dailyHelpSchema = mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String, // Maid, Driver, Cook, etc.
        required: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    profileImage: String,
    rating: {
        type: Number,
        default: 5.0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    currentlyInside: {
        type: Boolean,
        default: false
    },
    workingFlats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flat'
    }],
    aadharNumber: String,
    address: String,
    reviews: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now }
    }],
    salaryLogs: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: Number,
        month: String,
        status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
        date: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('DailyHelp', dailyHelpSchema);
