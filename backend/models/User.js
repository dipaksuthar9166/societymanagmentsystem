const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        required: true,
        unique: true,
    },
    contactNumber: {
        type: String,
        required: false,
    },
    profileImage: {
        type: String, // URL to image
        default: null
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin', 'employee', 'user', 'guard', 'chairman', 'secretary', 'treasurer', 'committee_member'],
        default: 'user',
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
    },
    flatNo: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    isOwner: {
        type: Boolean,
        default: false
    },
    familyMembers: {
        type: Number, // Count of members
        default: 0
    },
    vehicleDetails: {
        type: String,
        default: ''
    },
    // Email Verification Fields
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
    verificationTokenExpiry: {
        type: Date,
        default: null
    },
    // Password Reset Fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // Committee Fields
    isCommitteeMember: {
        type: Boolean,
        default: false
    },
    designation: {
        type: String,
        enum: ['None', 'Chairman', 'Secretary', 'Treasurer', 'Member'],
        default: 'None'
    },
    memberPortfolio: String, // E.g., "Handlings Water Issues"
    officeHours: String      // E.g., "7 PM to 9 PM"
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
