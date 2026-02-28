const Product = require('../models/Product');

// @desc    Get all products for the logged-in admin
// @route   GET /api/products
// @access  Admin
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ adminId: req.user.id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res) => {
    const { name, sku, price, stock } = req.body;

    if (!name || !sku || !price || !stock) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const product = await Product.create({
            adminId: req.user.id,
            name,
            sku,
            price,
            stock,
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Ensure user owns the product
        if (product.adminId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await product.deleteOne();

        res.json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProducts,
    createProduct,
    deleteProduct,
};
