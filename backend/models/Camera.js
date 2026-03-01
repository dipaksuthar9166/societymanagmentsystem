const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    society: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    streamUrl: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Static', 'PTZ', '360°'],
        default: 'Static'
    },
    resolution: {
        type: String,
        default: '1080p'
    },
    isPublic: {
        type: Boolean,
        default: false,
        comment: 'If true, residents can see this feed'
    },
    status: {
        type: String,
        enum: ['Online', 'Offline', 'Maintenance'],
        default: 'Online'
    },
    anprEnabled: {
        type: Boolean,
        default: false,
        comment: 'AI Number Plate Recognition'
    },
    motionDetection: {
        type: Boolean,
        default: false,
        comment: 'Motion Detection / Night Alerts'
    },
    healthLastPing: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Camera', cameraSchema);
