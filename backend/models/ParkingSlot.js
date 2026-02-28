const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    slotNumber: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['EV', 'Visitor', 'Resident'],
        default: 'Visitor'
    },
    isOccupied: {
        type: Boolean,
        default: false
    },
    currentBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingBooking'
    },
    hourlyRate: {
        type: Number,
        default: 50 // Default rate for visitor/EV
    },
    society: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    }
}, {
    timestamps: true
});

// Compound index to ensure slot numbers are unique ONLY within a society
parkingSlotSchema.index({ society: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
