const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema({
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    raisedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String, // e.g., Plumbing, Electrical, Security
        default: 'General'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
        default: 'Pending',
    },
    adminComment: {
        type: String
    },
    workerDetails: {
        name: String,
        phone: String,
        assignedAt: Date
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Complaint', complaintSchema);
