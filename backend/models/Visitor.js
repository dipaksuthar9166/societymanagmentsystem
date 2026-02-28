const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    visitorType: { type: String, enum: ['Guest', 'Delivery', 'Cab', 'Service'], default: 'Guest' },
    hostFlatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat' }, // If mapped to flat
    hostUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If mapped to user
    purpose: { type: String },
    checkInTime: { type: Date, default: Date.now },
    checkOutTime: { type: Date },
    isPreApproved: { type: Boolean, default: false },
    approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Denied'], default: 'Pending' },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    vehicleNo: { type: String },
    photo: { type: String },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['In', 'Out', 'Denied', 'Expected'], default: 'In' },
    qrCode: { type: String } // Unique code for verify
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
