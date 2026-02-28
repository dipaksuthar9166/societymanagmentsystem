const mongoose = require('mongoose');

const testimonialSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    role: {
        type: String,
        required: [true, 'Please add a role/designation'],
    },
    image: {
        type: String, // URL to image
        default: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    },
    quote: {
        type: String,
        required: [true, 'Please add a testimonial quote'],
    },
    rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5
    },
    status: {
        type: String,
        enum: ['Active', 'Pending', 'Archived'],
        default: 'Active',
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
