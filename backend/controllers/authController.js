const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');
const { generateVerificationToken, sendVerificationEmail, sendEmail } = require('../utils/emailService');
const crypto = require('crypto');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).populate('company', 'name logo status');

        if (user && (await bcrypt.compare(password, user.password))) {
            // Check Company Status
            if (user.company && user.company.status !== 'Active') {
                return res.status(403).json({
                    message: `Society Account is ${user.company.status}. Login Restricted.`
                });
            }

            // TEMPORARILY DISABLED - Email Verification Check
            // Uncomment when email service is configured
            /*
            if (user.isVerified === false) {
                return res.status(403).json({
                    message: 'Please verify your email before logging in. Check your inbox for the verification link.',
                    emailNotVerified: true
                });
            }
            */

            if (user.status === 'inactive') {
                return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
            }

            // ✅ LOG SUCCESSFUL LOGIN
            if (user.company) {
                await logActivity({
                    userId: user._id,
                    societyId: user.company._id,
                    action: 'LOGIN',
                    category: 'INFO',
                    description: `${user.name} logged in successfully`,
                    metadata: {
                        role: user.role,
                        flatNo: user.flatNo,
                        email: user.email
                    },
                    req
                });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                companyName: user.company ? user.company.name : null,
                companyLogo: user.company ? user.company.logo : null,
                companyId: user.company ? user.company._id : null,
                flatNo: user.flatNo,
                token: generateToken(user._id),
            });
        } else {
            // ✅ LOG FAILED LOGIN ATTEMPT
            if (user && user.company) {
                await logActivity({
                    userId: user._id,
                    societyId: user.company._id,
                    action: 'LOGIN',
                    category: 'WARNING',
                    description: `Failed login attempt for ${email}`,
                    metadata: {
                        email,
                        reason: 'Invalid password'
                    },
                    req
                });
            }
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerUser = async (req, res) => {
    const { name, email, password, role, isVerified, flatNo } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // If OTP verified, skip email verification
        const needsEmailVerification = !isVerified;

        let verificationToken = null;
        let tokenExpiry = null;

        if (needsEmailVerification) {
            verificationToken = generateVerificationToken();
            tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            flatNo: flatNo || null, // Save Flat No
            isVerified: isVerified || false,
            status: isVerified ? 'active' : 'pending',
            verificationToken,
            verificationTokenExpiry: tokenExpiry
        });

        if (user) {
            // Only send verification email if not OTP verified
            if (needsEmailVerification) {
                const emailResult = await sendVerificationEmail(user, verificationToken);

                if (!emailResult.success) {
                    console.error('Failed to send verification email:', emailResult.error);
                }
            }

            // Log user registration
            if (user.company) {
                await logActivity({
                    userId: user._id,
                    societyId: user.company,
                    action: 'USER_REGISTERED',
                    category: 'INFO',
                    description: `New user registered: ${user.name}`,
                    metadata: { email: user.email, role: user.role, verifiedViaOTP: isVerified || false }
                });
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                flatNo: user.flatNo,
                isVerified: user.isVerified,
                status: user.status,
                message: isVerified
                    ? 'Registration successful! You can login now.'
                    : 'User created successfully! Please check your email to verify your account.',
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const impersonateUser = async (req, res) => {
    const { userId } = req.body;

    try {
        // 1. Verify Requestor is Admin or Super Admin
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Not authorized for impersonation' });
        }

        // 2. Find Target User
        const targetUser = await User.findById(userId).populate('company', 'name logo status');
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        // 3. Verify Society Match (Only for Admin, Super Admin can impersonate anyone)
        if (req.user.role === 'admin') {
            if (targetUser.company._id.toString() !== req.user.company.toString()) {
                return res.status(403).json({ message: 'Cannot impersonate user from another society' });
            }
        }

        // 4. Generate Token & Response
        res.json({
            _id: targetUser._id,
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role,
            status: targetUser.status,
            companyName: targetUser.company ? targetUser.company.name : null,
            companyLogo: targetUser.company ? targetUser.company.logo : null,
            companyId: targetUser.company ? targetUser.company._id : null,
            token: generateToken(targetUser._id),
            isImpersonated: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Impersonation failed: ' + error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail(user.email, 'Password Reset Token', message);

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.log(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, data: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { loginUser, registerUser, impersonateUser, forgotPassword, resetPassword };
