const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP } = require('../utils/otpService');
const User = require('../models/User');

/**
 * @route   POST /api/otp/send
 * @desc    Send OTP to email for verification
 * @access  Public
 */
router.post('/send', async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if email already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Send OTP
        const result = await sendOTP(email, name);

        if (result.success) {
            res.json({
                success: true,
                message: 'OTP sent to your email. Please check your inbox.'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP. Please try again.'
            });
        }
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/otp/verify
 * @desc    Verify OTP
 * @access  Public
 */
router.post('/verify', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Verify OTP
        const result = verifyOTP(email, otp);

        if (result.valid) {
            res.json({
                success: true,
                message: result.message,
                verified: true
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message,
                verified: false
            });
        }
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
