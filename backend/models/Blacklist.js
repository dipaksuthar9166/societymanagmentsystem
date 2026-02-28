const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    reason: { type: String },
    photo: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Blacklist', blacklistSchema);
