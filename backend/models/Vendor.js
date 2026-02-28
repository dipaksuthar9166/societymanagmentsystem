const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    serviceType: { type: String, required: true }, // e.g. 'Security', 'Cleaning', 'Plumbing'
    contactNumber: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    contractStartDate: { type: Date },
    contractEndDate: { type: Date },
    monthlyCost: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive', 'Pending'], default: 'Active' },
    documents: [{ name: String, url: String }]
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
