const mongoose = require('mongoose');

const facilityBookingSchema = new mongoose.Schema({
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
    facilityName: { type: String, required: true }, // e.g., "Clubhouse", "Community Hall"
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Resident
    purpose: { type: String },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    status: { type: String, enum: ['Requested', 'Approved', 'Rejected', 'Cancelled'], default: 'Requested' },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true });

module.exports = mongoose.model('FacilityBooking', facilityBookingSchema);
