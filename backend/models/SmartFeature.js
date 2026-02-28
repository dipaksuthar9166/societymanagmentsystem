const mongoose = require('mongoose');

const smartFeatureSchema = new mongoose.Schema({
    module: {
        type: String,
        enum: ['EV_PARKING', 'SKILL_MARKET', 'ASSET_SHARE', 'EMERGENCY_SOS', 'IOT_LEAKAGE', 'DIGITAL_DEMOCRACY'],
        required: true
    },
    settings: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SmartFeature', smartFeatureSchema);
