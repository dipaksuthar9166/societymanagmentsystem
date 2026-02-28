const Razorpay = require('razorpay');
const crypto = require('crypto');
const Company = require('../models/Company');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const User = require('../models/User'); // Added this line
const { logActivity } = require('../utils/activityLogger');

// @desc    Generate Razorpay Payment Link for Bill Payment
// @route   POST /api/bills/pay/link
// @access  Private (User/Admin)
const generatePaymentLink = async (req, res) => {
    try {
        const { invoiceId, amount } = req.body;

        // 1. Get Society Credentials
        const company = await Company.findById(req.user.company);

        if (!company || !company.paymentGateway || !company.paymentGateway.isActive) {
            return res.status(400).json({
                message: 'Online payments not enabled by Society Admin.'
            });
        }

        const { keyId, keySecret } = company.paymentGateway;

        if (!keyId || !keySecret) {
            return res.status(500).json({ message: 'Payment gateway configuration error.' });
        }

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });

        // 2. Fetch User Details for Link Pre-fill
        const user = await User.findById(req.user._id);

        // 3. Create Payment Link
        const linkOptions = {
            amount: amount * 100, // amount in paise
            currency: "INR",
            accept_partial: false,
            // expire_by: 1691097057, // Optional expiry
            reference_id: `inv_${invoiceId}_${Date.now()}`,
            description: `Payment for Bill #${invoiceId}`,
            customer: {
                name: user.name,
                contact: user.mobile || user.contactNumber || "+919999999999", // Fallback if missing
                email: user.email
            },
            notify: {
                sms: true,
                email: true
            },
            reminder_enable: true,
            notes: {
                companyId: req.user.company.toString(),
                invoiceId: invoiceId,
                userId: req.user._id.toString()
            },
            // Redirect user back to local app after payment (User Dashboard)
            callback_url: `${req.protocol}://${req.get('host').replace('5001', '5173')}/user-dashboard?payment=success&invoice=${invoiceId}`,
            callback_method: "get"
        };

        const paymentLink = await razorpay.paymentLink.create(linkOptions);

        if (!paymentLink) {
            return res.status(500).json({ message: 'Error creating payment link' });
        }

        await logActivity({
            userId: req.user._id,
            societyId: req.user.company,
            action: 'PAYMENT_LINK_GENERATED',
            category: 'INFO',
            description: `Payment Link Generated for ₹${amount}`,
            metadata: { invoiceId, amount, short_url: paymentLink.short_url },
            req
        });

        res.json({
            success: true,
            paymentLink: paymentLink.short_url,
            id: paymentLink.id
        });

    } catch (error) {
        console.error("Payment Link Generation Error:", error);
        res.status(500).json({ message: 'Server Error creating payment link' });
    }
};

// @desc    Verify Bill Payment
// @route   POST /api/bills/pay/verify
// @access  Private (User)
const verifyBillPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            invoiceId,
            amount
        } = req.body;

        // 1. Get Society Credentials
        const company = await Company.findById(req.user.company);
        if (!company || !company.paymentGateway) {
            return res.status(400).json({ message: 'Payment gateway configuration missing.' });
        }
        const { keySecret } = company.paymentGateway;

        // 2. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // 3. Update Invoice
            const invoice = await Invoice.findById(invoiceId);
            if (invoice) {
                invoice.status = 'Paid';
                invoice.paymentDate = new Date();
                invoice.paymentMethod = 'Online (Razorpay)';
                invoice.paymentId = razorpay_payment_id; // Store ref
                await invoice.save();
            }

            // 4. Record Transaction (if not already handled by invoice logic)
            // Using Transaction model for global tracking if needed, often Invoice is enough
            // But let's log it.

            // 5. Log Activity
            await logActivity({
                userId: req.user._id,
                societyId: req.user.company,
                action: 'BILL_PAYMENT_SUCCESS',
                category: 'SUCCESS',
                description: `✅ Payment of ₹${amount} successful via Razorpay`,
                metadata: {
                    invoiceId,
                    amount,
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id
                },
                req
            });

            // 6. Socket Broadcast (to Admin Dashboard)
            const io = req.app.get('io');
            if (io) {
                io.to(req.user.company.toString()).emit('invoice_paid', {
                    invoiceId,
                    user: req.user.name,
                    amount
                });
            }

            res.json({ success: true, message: 'Payment Successful' });
        } else {
            await logActivity({
                userId: req.user._id,
                societyId: req.user.company,
                action: 'BILL_PAYMENT_FAILED',
                category: 'WARNING',
                description: `❌ Payment verification failed for Bill ₹${amount}`,
                metadata: { orderId: razorpay_order_id },
                req
            });
            res.status(400).json({ success: false, message: 'Invalid Signature' });
        }

    } catch (error) {
        console.error("Bill Verification Error:", error);
        res.status(500).json({ message: 'Server Error verifying payment' });
    }
};

module.exports = { generatePaymentLink, verifyBillPayment };
