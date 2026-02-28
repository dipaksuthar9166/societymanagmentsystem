const mongoose = require('mongoose');

const planSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    durationDays: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    features: [{
        type: String
    }],
    maxRooms: {
        type: Number,
        default: 100
    },
    isPopular: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
