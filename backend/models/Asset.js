const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Block A Lift", "Main Generator"
    category: { type: String, required: true }, // Electronics, Mechanical, Infrastructure
    location: { type: String },
    purchaseDate: { type: Date },
    warrantyExpiry: { type: Date },
    amcExpiry: { type: Date }, // Annual Maintenance Contract
    serviceHistory: [{
        date: Date,
        description: String,
        cost: Number,
        performedBy: String
    }],
    status: {
        type: String,
        enum: ['Operational', 'Under Maintenance', 'Broken', 'Retired'],
        default: 'Operational'
    },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
