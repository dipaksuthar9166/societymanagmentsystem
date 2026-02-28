// Example: Enhanced Auth Controller with Activity Logging

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/activityLogger');

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Log failed login attempt
            await logActivity({
                userId: user._id,
                societyId: user.society,
                action: 'LOGIN',
                category: 'WARNING',
                description: `Failed login attempt for ${user.email}`,
                metadata: { email, reason: 'Invalid password' },
                req
            });

            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // ✅ LOG SUCCESSFUL LOGIN
        await logActivity({
            userId: user._id,
            societyId: user.society,
            action: 'LOGIN',
            category: 'INFO',
            description: `${user.name} logged in successfully`,
            metadata: {
                role: user.role,
                flatNumber: user.flatNumber,
                email: user.email
            },
            req
        });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                society: user.society,
                flatNumber: user.flatNumber
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
    try {
        // ✅ LOG LOGOUT
        await logActivity({
            userId: req.user._id,
            societyId: req.user.society,
            action: 'LOGOUT',
            category: 'INFO',
            description: `${req.user.name} logged out`,
            metadata: { role: req.user.role },
            req
        });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // ✅ LOG PASSWORD CHANGE
        await logActivity({
            userId: req.user._id,
            societyId: req.user.society,
            action: 'PASSWORD_CHANGE',
            category: 'SUCCESS',
            description: `${req.user.name} changed their password`,
            metadata: { email: req.user.email },
            req
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
