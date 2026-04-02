const express = require('express');
const router = express.Router();
const {
    getInvoices,
    createInvoice,
    markAsPaid,
    createBulkInvoices,
    getInvoicesByUser,
    updateInterest,
    applyBulkInterest
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('admin', 'user', 'employee'), getInvoices)
    .post(protect, authorize('admin', 'employee'), createInvoice);

router.get('/user/:userId', protect, authorize('admin'), getInvoicesByUser);
router.post('/bulk', protect, authorize('admin'), createBulkInvoices);

router.put('/:id/pay', protect, authorize('admin', 'employee'), markAsPaid);
router.put('/:id/interest', protect, authorize('admin', 'employee'), updateInterest);
router.put('/action/bulk-interest', protect, authorize('admin', 'employee'), applyBulkInterest);

module.exports = router;
