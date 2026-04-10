const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const { 
    getCustomers, createCustomer, deleteCustomer, updateCustomer, 
    getSMSBalance, saveTwilioConfig, verifyCustomerManually, verifyCustomerOTP,
    updateUserStatus
} = require('../controllers/adminController');
const { getAdminStats, getAdminDetailedAnalytics } = require('../controllers/analyticsController');
const { getExpenses, createExpense, deleteExpense } = require('../controllers/expenseController');
const { getMyCompany, updateMyCompany } = require('../controllers/companyController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Dashboard Route
router.get('/dashboard', protect, authorize('admin'), (req, res) => {
    res.json({ message: 'Welcome to Admin Dashboard' });
});

// Customer Management Routes
router.route('/customers')
    .get(protect, authorize('admin', 'superadmin'), getCustomers)
    .post(protect, authorize('admin', 'superadmin'), createCustomer);

router.route('/customers/:id')
    .put(protect, authorize('admin', 'superadmin'), updateCustomer)
    .delete(protect, authorize('admin', 'superadmin'), deleteCustomer);

router.post('/customers/:id/verify-manually', protect, authorize('admin', 'superadmin'), verifyCustomerManually);
router.post('/customers/:id/verify-otp', protect, authorize('admin', 'superadmin'), verifyCustomerOTP);
router.patch('/customers/:id/status', protect, authorize('admin', 'superadmin'), updateUserStatus);

// Expense Management
router.route('/expenses')
    .get(protect, authorize('admin'), getExpenses)
    .post(protect, authorize('admin'), createExpense);

router.delete('/expenses/:id', protect, authorize('admin'), deleteExpense);

// Analytics
router.get('/analytics/overview', protect, authorize('admin'), getAdminStats);
router.get('/stats', protect, authorize('admin'), getAdminStats); // Keep for frontend compatibility
router.get('/analytics/detailed', protect, authorize('admin'), getAdminDetailedAnalytics);

router.get('/sms-balance', protect, authorize('admin', 'superadmin'), getSMSBalance);
router.post('/society/twilio', protect, authorize('admin', 'superadmin'), saveTwilioConfig);

router.route('/society')
    .get(protect, getMyCompany)
    .put(protect, authorize('admin'), upload.single('logo'), updateMyCompany);

module.exports = router;
