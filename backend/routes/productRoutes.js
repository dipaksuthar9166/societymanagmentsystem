const express = require('express');
const router = express.Router();
const { getProducts, createProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('admin'), getProducts)
    .post(protect, authorize('admin'), createProduct);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
