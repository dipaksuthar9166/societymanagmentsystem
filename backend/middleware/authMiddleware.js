const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Check if token exists and is not empty
            if (!token || token === 'null' || token === 'undefined') {
                return res.status(401).json({ message: 'Not authorized, invalid token' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error('JWT Error:', error.message);
            return res.status(401).json({
                message: 'Not authorized, token failed',
                error: error.message
            });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

/**
 * Middleware to enforce data isolation (Multi-Tenancy)
 * It attaches a 'tenantFilter' to the request object which should be used in Mongoose queries.
 */
const multiTenantFilter = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'User not authenticated for filtering' });

    if (req.user.role === 'superadmin') {
        req.tenantFilter = {}; // No isolation for superadmin
    } else if (req.user.role === 'admin') {
        req.tenantFilter = { societyId: req.user.company };
    } else {
        // For users, isolation is stricter: usually only their own data
        // Controllers should decide whether to use societyId or customerId based on context
        req.tenantFilter = {
            societyId: req.user.company,
            userId: req.user._id // For user-specific items
        };
    }
    next();
};

module.exports = { protect, authorize, multiTenantFilter };
