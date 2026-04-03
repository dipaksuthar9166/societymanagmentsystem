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

        // Allow payments if either company gateway is active OR we have fallback env keys
        const hasEnvKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
        
        if (!company && !hasEnvKeys) {
            return res.status(400).json({
                message: 'Online payments not configured.'
            });
        }

        let keyId = company?.paymentGateway?.keyId;
        let keySecret = company?.paymentGateway?.keySecret;

        // Fallback to ENV if DB keys are broken or missing
        if (!keyId || !keyId.startsWith('rzp_')) {
            keyId = process.env.RAZORPAY_KEY_ID;
            keySecret = process.env.RAZORPAY_KEY_SECRET;
        }

        if (!keyId || !keySecret) {
            return res.status(500).json({ message: 'Payment gateway configuration error.' });
        }

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });

        // 2. Fetch User Details for Link Pre-fill
        const user = await User.findById(req.user._id);

        const orderOptions = {
            amount: Math.round(amount * 100), // amount in paise
            currency: "INR",
            receipt: `inv_${invoiceId.toString().slice(-8)}_${Date.now()}`,
            notes: {
                companyId: req.user.company.toString(),
                invoiceId: invoiceId,
                userId: req.user._id.toString()
            }
        };

        const order = await razorpay.orders.create(orderOptions);

        if (!order) {
            return res.status(500).json({ message: 'Error creating payment order' });
        }

        await logActivity({
            userId: req.user._id,
            societyId: req.user.company,
            action: 'PAYMENT_ORDER_GENERATED',
            category: 'INFO',
            description: `Payment Order Generated for ₹${amount}`,
            metadata: { invoiceId, amount, orderId: order.id },
            req
        });

        const userContact = user.mobile || user.contactNumber || "";

        res.json({
            success: true,
            orderId: order.id,
            amount: orderOptions.amount,
            currency: orderOptions.currency,
            keyId: keyId,
            userConfig: {
                name: user.name || "Customer",
                contact: userContact,
                email: user.email || ""
            }
        });

    } catch (error) {
        console.error("Payment Link Generation Error:", error);
        
        let errorMessage = 'Server Error creating payment link';
        if (error && error.error && error.error.description) {
            errorMessage = error.error.description;
        } else if (error && error.message) {
            errorMessage = error.message;
        }

        res.status(500).json({ message: errorMessage, details: error });
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
        
        let keySecret = company?.paymentGateway?.keySecret;
        let keyId = company?.paymentGateway?.keyId;

        if (!keyId || !keyId.startsWith('rzp_')) {
            keySecret = process.env.RAZORPAY_KEY_SECRET;
        }

        if (!keySecret) {
            return res.status(400).json({ message: 'Payment gateway configuration missing.' });
        }

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
