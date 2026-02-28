const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    sku: {
        type: String,
        required: [true, 'Please add a SKU'],
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        default: 0,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
