const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Sell', 'Rent', 'Lost', 'Found', 'Borrow', 'Event'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number }, // Optional for Lost/Found
    images: [{ type: String }],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['Active', 'Sold', 'Found', 'Closed'],
        default: 'Active'
    },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Scoped to society
}, { timestamps: true });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
