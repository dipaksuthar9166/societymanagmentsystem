const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    verifyEmail,
    resendVerification,
    checkVerificationStatus
} = require('../controllers/verificationController');

// Public route - verify email with token
router.get('/verify-account/:token', verifyEmail);

// Resend verification - PUBLIC for testing
router.post('/resend-verification', resendVerification);

// Test Email Template (New)
router.post('/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        const { sendOTP } = require('../utils/otpService');
        // Send a dummy OTP to the requested email
        const result = await sendOTP(email || process.env.EMAIL_USER, 'Admin User');
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Status check
router.get('/verification-status/:userId', protect, checkVerificationStatus);

module.exports = router;
