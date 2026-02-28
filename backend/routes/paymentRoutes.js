const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
