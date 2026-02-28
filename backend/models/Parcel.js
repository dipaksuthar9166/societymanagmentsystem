const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema({
    recipientName: { type: String }, // Optional, if known
    flatNo: { type: String, required: true }, // e.g., "A-101"
    courierName: { type: String, required: true }, // Amazon, DHL, etc.
    image: { type: String }, // URL or Base64
    status: { type: String, enum: ['At Gate', 'Collected'], default: 'At Gate' },
    receivedAt: { type: Date, default: Date.now },
    collectedAt: { type: Date },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Guard ID
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Parcel', parcelSchema);
