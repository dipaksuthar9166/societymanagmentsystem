const mongoose = require('mongoose');

const meetingSchema = mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['AGM', 'EGM', 'Committee', 'General'], default: 'General' },
    agenda: { type: String },
    momUrl: { type: String }, // Link to document
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
