const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, enum: ['Maid', 'Driver', 'Cook', 'Plumber', 'Electrician', 'Carpenter', 'Gardener'], required: true },
    mobile: { type: String, required: true },
    photo: { type: String },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ratings: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        review: String,
        date: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
