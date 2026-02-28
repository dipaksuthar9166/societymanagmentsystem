const mongoose = require('mongoose');

const pollSchema = mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['YesNo', 'Option'], default: 'YesNo' },
    options: [{
        text: String,
        votes: { type: Number, default: 0 } // Computed count
    }],
    votes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        optionIndex: Number,
        votedAt: { type: Date, default: Date.now }
    }],
    rolesAllowed: [{ type: String }], // e.g. ['chairman', 'secretary', 'treasurer'] or empty for all
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Poll', pollSchema);
