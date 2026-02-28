const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a skill title']
    },
    description: {
        type: String,
        required: [true, 'Please describe your service via skill']
    },
    category: {
        type: String,
        enum: ['Education', 'Food & Catering', 'Wellness & Fitness', 'Household Service', 'Tech Support', 'Arts & Craft', 'Other'],
        required: true
    },
    hourlyRate: {
        type: Number,
        default: 0
    },
    availability: {
        type: String, // e.g. "Weekends 10am-5pm"
        default: 'Negotiable'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    ratings: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            stars: { type: Number, min: 1, max: 5 },
            comment: String,
            date: { type: Date, default: Date.now }
        }
    ],
    averageRating: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Skill', skillSchema);
