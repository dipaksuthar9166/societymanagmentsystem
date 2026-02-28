const User = require('../models/User');
const { sendVerificationEmail, sendAccountActivatedEmail, generateVerificationToken } = require('../utils/emailService');

/**
 * @route   GET /api/auth/verify-account/:token
 * @desc    Verify user email with token
 * @access  Public
 */
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with this token
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: Date.now() } // Token not expired
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification link. Please request a new one.'
            });
        }

        // Update user
        user.isVerified = true;
        user.status = 'active';
        user.verificationToken = null;
        user.verificationTokenExpiry = null;
        await user.save();

        // Send activation email
        await sendAccountActivatedEmail(user);

        res.json({
            success: true,
            message: 'Email verified successfully! You can now login.',
            user: {
                name: user.name,
                email: user.email,
                isVerified: true
            }
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during verification'
        });
    }
};

/**
 * @route   POST /api/verification/resend-verification
 * @desc    Resend verification email
 * @access  Private (Admin)
 */
const resendVerification = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'User is already verified'
            });
        }

        // Generate new token
        const verificationToken = generateVerificationToken();
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = tokenExpiry;
        await user.save();

        // Try to send email (optional - won't fail if email not configured)
        try {
            const emailResult = await sendVerificationEmail(user, verificationToken);

            if (emailResult.success) {
                console.log(`✅ Verification email sent to ${user.email}`);
            } else {
                console.log(`⚠️ Email service not configured or failed: ${emailResult.error}`);
            }
        } catch (emailError) {
            console.error('⚠️ Email sending failed:', emailError.message);
            // Continue anyway - token is saved in database
        }

        // Always return success if token is saved
        res.json({
            success: true,
            message: 'Verification token generated! (Email service may not be configured)',
            verificationLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-account/${verificationToken}`
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @route   GET /api/auth/verification-status/:userId
 * @desc    Check user verification status
 * @access  Private (Admin)
 */
const checkVerificationStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('isVerified status email name');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Check verification status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    verifyEmail,
    resendVerification,
    checkVerificationStatus
};
