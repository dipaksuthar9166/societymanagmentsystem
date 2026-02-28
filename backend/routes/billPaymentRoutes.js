const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generatePaymentLink, verifyBillPayment } = require('../controllers/billPaymentController');

router.post('/link', protect, generatePaymentLink);
router.post('/verify', protect, verifyBillPayment);

module.exports = router;
