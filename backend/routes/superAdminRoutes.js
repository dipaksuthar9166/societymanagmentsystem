const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
    getAdmins, createAdmin, updateAdmin, deleteAdmin,
    getSystemAnalytics, globalBroadcast,
    getInquiries, updateInquiryStatus
} = require('../controllers/superAdminController');
const { createCompany, getCompanies, updateCompanySettings, deleteCompany, updateCompany } = require('../controllers/companyController');
// Smart Automations module imported below
const { getSystemSettings, updateSystemSettings } = require('../controllers/systemController');

// Dashboard Route (Keep basic welcome for stats)
router.get('/dashboard', protect, authorize('superadmin'), (req, res) => {
    res.json({ message: 'Welcome to Super Admin Dashboard' });
});

// System Settings
router.route('/settings')
    .get(protect, authorize('superadmin'), getSystemSettings)
    .put(protect, authorize('superadmin'), updateSystemSettings);

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

// Company Management Routes (Multi-Tenant Core)
router.route('/companies')
    .get(protect, authorize('superadmin'), getCompanies)
    .post(protect, authorize('superadmin'), upload.single('logo'), createCompany);

router.route('/companies/:id/settings')
    .put(protect, authorize('superadmin'), updateCompanySettings);

router.route('/companies/:id')
    .delete(protect, authorize('superadmin'), deleteCompany)
    .put(protect, authorize('superadmin'), upload.single('logo'), updateCompany);

// Automation & SaaS Configuration
// Removed legacy template routes in favor of SmartAutomation module

// Admin Management Routes
router.route('/admins')
    .get(protect, authorize('superadmin'), getAdmins)
    .post(protect, authorize('superadmin'), createAdmin);

router.route('/admins/:id')
    .put(protect, authorize('superadmin'), updateAdmin)
    .delete(protect, authorize('superadmin'), deleteAdmin);

router.post('/broadcast', protect, authorize('superadmin'), globalBroadcast);

router.get('/analytics', protect, authorize('superadmin'), getSystemAnalytics);

// Inquiries / Leads (Landing Page)
router.route('/inquiries')
    .get(protect, authorize('superadmin'), getInquiries);

router.route('/inquiries/:id')
    .put(protect, authorize('superadmin'), updateInquiryStatus);

const { getAuditLogs } = require('../controllers/auditController');
const { createBackup, exportUserData } = require('../controllers/backupController');

router.get('/audit-logs', protect, authorize('superadmin'), getAuditLogs);

// Backup & Data Routes
const { generateInvoice, getAllInvoices } = require('../controllers/billingController');

router.get('/backup', protect, authorize('superadmin'), createBackup);
router.get('/export-user/:id', protect, authorize('superadmin'), exportUserData);

// Billing & Invoices
router.route('/invoices')
    .get(protect, authorize('superadmin'), getAllInvoices)
    .post(protect, authorize('superadmin'), generateInvoice);

// Smart Automations
const { createAutomation, getAutomations, toggleAutomation, deleteAutomation } = require('../controllers/automationController');

router.route('/automations')
    .get(protect, authorize('superadmin'), getAutomations)
    .post(protect, authorize('superadmin'), createAutomation);

router.put('/automations/:id/toggle', protect, authorize('superadmin'), toggleAutomation);
router.delete('/automations/:id', protect, authorize('superadmin'), deleteAutomation);

// Smart Features (New Request)
const { getFeatures, toggleFeature, getFeatureLogs } = require('../controllers/featureController');

router.route('/features')
    .get(protect, authorize('superadmin'), getFeatures);

router.put('/features/:id/toggle', protect, authorize('superadmin'), toggleFeature);
router.get('/features/logs', protect, authorize('superadmin'), getFeatureLogs);

module.exports = router;
