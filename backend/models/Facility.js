const mongoose = require('mongoose');

const facilitySchema = mongoose.Schema({
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    chargePerSlot: {
        type: Number,
        default: 0
    },
    slotDurationHours: {
        type: Number,
        default: 1 // 1 hour slots by default
    },
    capacity: {
        type: Number,
        default: 1
    },
    images: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Facility', facilitySchema);
