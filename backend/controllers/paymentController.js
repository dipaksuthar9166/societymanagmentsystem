const Razorpay = require('razorpay');
const crypto = require('crypto');
const Company = require('../models/Company');
const Transaction = require('../models/Transaction');
const Plan = require('../models/Plan');
const { logActivity } = require('../utils/activityLogger');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_missing_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_missing_secret'
});

if (!process.env.RAZORPAY_KEY_ID) {
    console.warn("⚠️  WARNING: RAZORPAY_KEY_ID is missing in .env. Payment features will fail.");
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Private (Admin)
const createOrder = async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = await Plan.findById(planId);

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        const options = {
            amount: plan.price * 100, // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
            notes: {
                companyId: req.user.company.toString(),
                planId: planId
            }
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ message: 'Error creating Razorpay order' });
        }

        // ✅ LOG PAYMENT INITIATION
        await logActivity({
            userId: req.user._id,
            societyId: req.user.company,
            action: 'PAYMENT_INITIATED',
            category: 'INFO',
            description: `${req.user.name} initiated subscription payment of ₹${plan.price}`,
            metadata: {
                planName: plan.name,
                amount: plan.price,
                orderId: order.id
            },
            req
        });

        res.json(order);
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify Payment and Activate Subscription
// @route   POST /api/payments/verify
// @access  Private (Admin)
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            const plan = await Plan.findById(planId);

            // 1. Log Transaction
            await Transaction.create({
                companyId: req.user.company,
                planId: planId,
                amount: plan.price,
                currency: 'INR',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                status: 'Success',
                paymentMethod: 'Razorpay'
            });

            // 2. Update Company Subscription
            const company = await Company.findById(req.user.company);

            // Calculate new end date
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + plan.durationDays);

            company.planId = planId;
            company.subscription = {
                planName: plan.name,
                startDate: startDate,
                endDate: endDate,
                status: 'Active',
                autoRenew: false
            };

            await company.save();

            // ✅ LOG SUCCESSFUL PAYMENT
            await logActivity({
                userId: req.user._id,
                societyId: req.user.company,
                action: 'PAYMENT_SUCCESS',
                category: 'SUCCESS',
                description: `✅ ${req.user.name} successfully paid ₹${plan.price} for ${plan.name} subscription`,
                metadata: {
                    planName: plan.name,
                    amount: plan.price,
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                    durationDays: plan.durationDays
                },
                req
            });

            // Broadcast real-time update
            const io = req.app.get('io');
            if (io) {
                console.log(`[Socket] Broadcasting subscription_updated to society ${req.user.company}`);
                io.to(req.user.company.toString()).emit('subscription_updated', {
                    message: "Subscription plan has been renewed successfully!",
                    subscription: company.subscription
                });
            }

            res.json({
                success: true,
                message: 'Subscription Activated Successfully',
                subscription: company.subscription
            });
        } else {
            // ✅ LOG FAILED PAYMENT VERIFICATION
            await logActivity({
                userId: req.user._id,
                societyId: req.user.company,
                action: 'PAYMENT_FAILED',
                category: 'WARNING',
                description: `❌ Payment verification failed for ${req.user.name}`,
                metadata: {
                    orderId: razorpay_order_id,
                    reason: 'Invalid signature'
                },
                req
            });

            res.status(400).json({ success: false, message: 'Invalid Signature' });
        }
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { createOrder, verifyPayment };
