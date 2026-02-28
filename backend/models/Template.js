const mongoose = require('mongoose');

const templateSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['WhatsApp', 'SMS', 'Email'],
        default: 'WhatsApp'
    },
    content: {
        type: String,
        required: true
    },
    variables: [{
        type: String // e.g., ["Tenant_Name", "Due_Amount", "Flat_No"]
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Template', templateSchema);
