const mongoose = require('mongoose');

const childExitLogSchema = mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    childName: {
        type: String,
        required: true,
        trim: true
    },
    age: Number,
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    flat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flat'
    },
    gate: {
        type: String, // Main Gate, Back Gate, etc.
        required: true
    },
    guard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // The guard who initiated the request
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Denied', 'TimedOut'],
        default: 'Pending'
    },
    decisionTime: Date,
    approvedBy: String, // e.g., "Father", "Mother"
    remarks: String
}, {
    timestamps: true
});

module.exports = mongoose.model('ChildExitLog', childExitLogSchema);
