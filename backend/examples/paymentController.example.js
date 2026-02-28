// Example: Payment Controller with Activity Logging

const Invoice = require('../models/Invoice');
const { logActivity } = require('../utils/activityLogger');

// @desc    Initiate payment
// @route   POST /api/payments/initiate
exports.initiatePayment = async (req, res) => {
    try {
        const { invoiceId, amount } = req.body;
        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // ✅ LOG PAYMENT INITIATION
        await logActivity({
            userId: req.user._id,
            societyId: req.user.society,
            action: 'PAYMENT_INITIATED',
            category: 'INFO',
            description: `${req.user.name} initiated payment of ₹${amount.toLocaleString()}`,
            metadata: {
                invoiceId,
                amount,
                flatNumber: req.user.flatNumber,
                month: invoice.month,
                year: invoice.year
            },
            req
        });

        // ... payment gateway integration ...

        res.json({ message: 'Payment initiated', paymentId: 'PAY123' });
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Payment success callback
// @route   POST /api/payments/success
exports.paymentSuccess = async (req, res) => {
    try {
        const { invoiceId, transactionId, amount } = req.body;

        // Update invoice status
        const invoice = await Invoice.findById(invoiceId);
        invoice.status = 'Paid';
        invoice.paidDate = new Date();
        invoice.transactionId = transactionId;
        await invoice.save();

        // ✅ LOG PAYMENT SUCCESS (HIGH PRIORITY)
        await logActivity({
            userId: req.user._id,
            societyId: req.user.society,
            action: 'PAYMENT_SUCCESS',
            category: 'SUCCESS',
            description: `✅ ${req.user.name} successfully paid ₹${amount.toLocaleString()} for ${invoice.month} ${invoice.year}`,
            metadata: {
                invoiceId,
                transactionId,
                amount,
                flatNumber: req.user.flatNumber,
                month: invoice.month,
                year: invoice.year,
                paymentMethod: 'Online'
            },
            req
        });

        res.json({ message: 'Payment successful', invoice });
    } catch (error) {
        console.error('Payment success error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Payment failure callback
// @route   POST /api/payments/failure
exports.paymentFailure = async (req, res) => {
    try {
        const { invoiceId, amount, errorMessage } = req.body;
        const invoice = await Invoice.findById(invoiceId);

        // ✅ LOG PAYMENT FAILURE (WARNING)
        await logActivity({
            userId: req.user._id,
            societyId: req.user.society,
            action: 'PAYMENT_FAILED',
            category: 'WARNING',
            description: `❌ Payment failed for ${req.user.name} - ₹${amount.toLocaleString()}`,
            metadata: {
                invoiceId,
                amount,
                flatNumber: req.user.flatNumber,
                month: invoice.month,
                year: invoice.year,
                error: errorMessage,
                reason: 'Payment gateway error'
            },
            req
        });

        res.json({ message: 'Payment failed', error: errorMessage });
    } catch (error) {
        console.error('Payment failure error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
