const express = require('express');
const router = express.Router();
const User = require('../models/User');
// Ensure Company model is registered for populate
const Company = require('../models/Company');
const { sendOTP, verifyOTP, generateOTP, storeOTP } = require('../utils/otpService');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @route   POST /api/auth/login-otp/send
 * @desc    Send OTP to user's email for login
 * @access  Public
 */
router.post('/send', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is active
        if (user.status === 'inactive') {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        let emailSent = false;
        let emailErrorMsg = '';
        let debugOtp = null;

        try {
            // 1. Try to send email (this generates its own OTP internally)
            const result = await sendOTP(email, user.name);

            if (result.success) {
                emailSent = true;
            } else {
                emailErrorMsg = result.error || 'Email service reported failure';
            }
        } catch (emailError) {
            console.error('⚠️ Email sending exception:', emailError.message);
            emailErrorMsg = emailError.message;
        }

        // 2. If email failed, we must provide a way to login (Fail-Safe)
        if (!emailSent) {
            // Generate a NEW OTP manually and overwrite whatever sendOTP did
            // This ensures the OTP we give to the user is the one in the store
            const newOtp = generateOTP();
            storeOTP(email, newOtp);
            debugOtp = newOtp;
            console.log(`🔓 FALLBACK OTP generated for ${email}: ${newOtp}`);
        }

        // 3. Return response
        res.json({
            success: true,
            // Show meaningful message
            message: emailSent ? 'OTP sent to your email.' : `OTP Generated! (Email Failed: ${emailErrorMsg})`,
            email: email,
            // Return OTP only if email failed
            debug_otp: debugOtp,
            note: !emailSent ? "Check 'debug_otp' in network response or backend console to login." : undefined
        });
    } catch (error) {
        console.error('Send login OTP error:', error);
        res.status(500).json({
            message: 'Server error during OTP sending',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/auth/login-otp/verify
 * @desc    Verify OTP and login user
 * @access  Public
 */
router.post('/verify', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Verify OTP
        const otpResult = verifyOTP(email, otp);

        if (!otpResult.valid) {
            return res.status(400).json({
                success: false,
                message: otpResult.message
            });
        }

        // Find user
        const user = await User.findOne({ email }).populate('company', 'name logo status');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check company status
        if (user.company && user.company.status !== 'Active') {
            return res.status(403).json({
                message: `Society Account is ${user.company.status}. Login Restricted.`
            });
        }

        // Check user status
        if (user.status === 'inactive') {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        // OTP verified - login successful
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            flatNo: user.flatNo,
            contactNumber: user.contactNumber,
            company: user.company,
            companyId: user.company?._id,
            society: user.company?._id,
            token: generateToken(user._id),
            message: 'Login successful!'
        });
    } catch (error) {
        console.error('Verify login OTP error:', error);
        // Respond with actual error for debugging
        res.status(500).json({
            message: 'Server error during verification',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
