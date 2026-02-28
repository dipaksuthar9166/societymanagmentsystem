const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const { getCustomers, createCustomer, deleteCustomer } = require('../controllers/adminController');
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
    .get(protect, authorize('admin'), getCustomers)
    .post(protect, authorize('admin'), createCustomer);

router.delete('/customers/:id', protect, authorize('admin'), deleteCustomer);

// Expense Management
// Expense Management
router.route('/expenses')
    .get(protect, authorize('admin'), getExpenses)
    .post(protect, authorize('admin'), createExpense);

router.delete('/expenses/:id', protect, authorize('admin'), deleteExpense);

// Analytics
router.get('/analytics/overview', protect, authorize('admin'), getAdminStats);
router.get('/stats', protect, authorize('admin'), getAdminStats); // Keep for frontend compatibility
router.get('/analytics/detailed', protect, authorize('admin'), getAdminDetailedAnalytics);
router.route('/society')
    .get(protect, getMyCompany)
    .put(protect, authorize('admin'), upload.single('logo'), updateMyCompany);


module.exports = router;
