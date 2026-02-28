const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true }, // Snapshot of name
    flatDetails: { type: String }, // e.g. "A-101"
    type: { type: String, required: true }, // Medical, Fire, etc.
    location: {
        lat: Number,
        lng: Number
    },
    status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin/Society ID
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
