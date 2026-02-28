const Invoice = require('../models/Invoice');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendWhatsApp } = require('../utils/notificationService');

// @desc    Get all invoices for the logged-in admin's company
// @route   GET /api/invoices
// @access  Admin, Employee
// @desc    Get all invoices for the logged-in admin's company OR the user's own invoices
// @route   GET /api/invoices
// @access  Admin, Employee, User
const getInvoices = async (req, res) => {
    try {
        console.log(`GET /invoices accessed by UserID: ${req.user._id} (${req.user.name}), Role: ${req.user.role}`);

        // 1. If User, return THEIR invoices (Global or Society specific)
        if (req.user.role === 'user') {
            const invoices = await Invoice.find({
                customerId: req.user._id
            }).sort({ createdAt: -1 });
            console.log(`Found ${invoices.length} invoices for Customer ${req.user._id}`);
            return res.json(invoices);
        }

        // 2. If Admin/Employee, require Company association
        if (!req.user.company) {
            return res.status(400).json({ message: 'User not associated with a society' });
        }

        const invoices = await Invoice.find({ societyId: req.user.company }).sort({ createdAt: -1 });
        console.log(`Found ${invoices.length} invoices for Admin Society ${req.user.company}`);
        res.json(invoices);
    } catch (error) {
        console.error("Get Invoices Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new invoice (Maintenance/Bill)
// @route   POST /api/invoices
// @access  Admin, Employee
const createInvoice = async (req, res) => {
    const { customerId: rawCustomerId, items, status, type } = req.body;
    console.log(`CREATE /invoices Request: RawCustomer=${rawCustomerId}, Items=${items.length}`);

    if (!req.user.company) {
        return res.status(400).json({ message: 'User not associated with a society' });
    }
    if (!rawCustomerId || !items || items.length === 0) {
        return res.status(400).json({ message: 'Please add tenant and bill items' });
    }

    try {
        // RESOLVE CUSTOMER ID (Support Email or ObjectId)
        let resolvedCustomerId = rawCustomerId;
        if (rawCustomerId && typeof rawCustomerId === 'string') {
            const isObjectId = mongoose.Types.ObjectId.isValid(rawCustomerId);
            if (!isObjectId) {
                // Try looking up by Email
                const userByEmail = await User.findOne({ email: rawCustomerId });
                if (!userByEmail) {
                    console.error(`Tenant with email '${rawCustomerId}' not found.`);
                    return res.status(404).json({ message: `Tenant with email '${rawCustomerId}' not found.` });
                }
                resolvedCustomerId = userByEmail._id;
            }
        }

        console.log(`Resolved Customer ID: ${resolvedCustomerId}`);
        const customer = await User.findById(resolvedCustomerId);
        if (!customer) {
            console.error(`Tenant not found in DB for ID: ${resolvedCustomerId}`);
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // STRICT CHECK: Customer MUST belong to the Admin's Society
        if (customer.company && customer.company.toString() !== req.user.company.toString()) {
            console.error(`Cross-Society Billing Attempt Blocked. Admin: ${req.user.company}, Target: ${customer.company}`);
            return res.status(403).json({ message: 'Cannot bill user from another society.' });
        }

        // SMART BALANCE LOGIC: Calculate Arrears
        const pendingInvoices = await Invoice.find({
            customerId: customer._id,
            status: { $in: ['Pending', 'Overdue'] }
        });

        const arrearsAmount = pendingInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
        console.log(`Calculated Arrears for ${customer.name}: ₹${arrearsAmount}`);

        let currentBillTotal = 0;
        const processedItems = items.map(item => {
            currentBillTotal += item.price * item.quantity;
            return {
                name: item.name,
                price: item.price,
                quantity: item.quantity
            }
        });

        // Calculate GST
        const gstPercentage = 18; // 18% GST
        const gstAmount = (currentBillTotal * gstPercentage) / 100;
        const subtotalWithGST = currentBillTotal + gstAmount;
        const totalPayable = subtotalWithGST + arrearsAmount;

        const invoice = await Invoice.create({
            societyId: req.user.company,
            adminId: req.user._id,
            customerId: customer._id,
            customerName: customer.name,
            items: processedItems,
            subtotal: currentBillTotal,
            gstPercentage: gstPercentage,
            gstAmount: gstAmount,
            oldArrears: arrearsAmount,
            totalAmount: totalPayable,
            status: status || 'Pending',
            type: type || 'Maintenance',
            billingPeriod: req.body.billingPeriod, // { from: Date, to: Date }
            dueDate: req.body.dueDate,
            notes: req.body.notes
        });

        // OPTIONAL: You might want to mark old pending invoices as 'Merged' or similar if you are consolidating them, 
        // to avoid double counting if you sum up ALL invoices later. 
        // For now, we assume the system displays the LATEST invoice which acts as the Statement.

        console.log(`Invoice Created: ${invoice._id} for Customer: ${customer.name} (${customer._id})`);

        // Trigger Notification (Fire and Forget)
        const message = `Namaste ${customer.name}, your bill of ₹${totalPayable} for ${items[0]?.name} is generated. Please login to pay.`;
        sendWhatsApp(customer._id, req.user.company, message);

        res.status(201).json({ ...invoice._doc, message: 'Bill Generated & Notification Triggered' });
    } catch (error) {
        console.error("Create Invoice Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bulk Generate Invoices for ALL Society Residents
// @route   POST /api/invoices/bulk
// @access  Admin
const createBulkInvoices = async (req, res) => {
    try {
        const { items, billingPeriod, dueDate, type } = req.body;

        if (!req.user.company) {
            return res.status(400).json({ message: 'admin_no_society' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'items_required' });
        }

        // 1. Get all residents of the society
        const residents = await User.find({
            company: req.user.company,
            role: 'user',
            // Optional: filter out inactive users if such flag exists
        });

        if (residents.length === 0) {
            return res.status(404).json({ message: 'No residents found to bill.' });
        }

        console.log(`[Bulk Billing] Starting generation for ${residents.length} residents in Society ${req.user.company}`);

        let generatedCount = 0;
        const errors = [];

        // 2. Iterate and Generate
        for (const resident of residents) {
            try {
                // Arrears Logic
                const pendingInvoices = await Invoice.find({
                    customerId: resident._id,
                    status: { $in: ['Pending', 'Overdue'] }
                });
                const arrearsAmount = pendingInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

                // Current Bill Total
                let currentBillTotal = 0;
                const processedItems = items.map(item => {
                    currentBillTotal += item.price * item.quantity;
                    return { name: item.name, price: item.price, quantity: item.quantity };
                });

                // Calculate GST
                const gstPercentage = 18;
                const gstAmount = (currentBillTotal * gstPercentage) / 100;
                const subtotalWithGST = currentBillTotal + gstAmount;
                const totalPayable = subtotalWithGST + arrearsAmount;

                await Invoice.create({
                    societyId: req.user.company,
                    adminId: req.user._id,
                    customerId: resident._id,
                    customerName: resident.name,
                    items: processedItems,
                    subtotal: currentBillTotal,
                    gstPercentage: gstPercentage,
                    gstAmount: gstAmount,
                    oldArrears: arrearsAmount,
                    totalAmount: totalPayable,
                    status: 'Pending',
                    type: type || 'Maintenance',
                    billingPeriod,
                    dueDate,
                    notes: req.body.notes
                });

                generatedCount++;
            } catch (err) {
                console.error(`Failed for resident ${resident.name}:`, err);
                errors.push({ name: resident.name, error: err.message });
            }
        }

        console.log(`[Bulk Billing] Complete. Generated: ${generatedCount}, Failed: ${errors.length}`);

        res.json({
            success: true,
            message: `Successfully generated ${generatedCount} invoices.`,
            failedCount: errors.length,
            errors
        });

    } catch (error) {
        console.error("Bulk Billing Error:", error);
        res.status(500).json({ message: 'Server Error during bulk generation' });
    }
};

// @desc    Manually mark invoice as Paid (Cash/Offline)
// @route   PUT /api/invoices/:id/pay
// @access  Admin
const markAsPaid = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Check if invoice belongs to admin's society
        if (invoice.societyId.toString() !== req.user.company.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        invoice.status = 'Paid';
        invoice.paymentMethod = 'Cash/Manual';
        invoice.paidAt = Date.now();

        await invoice.save();

        // ✅ Create Transaction Record for Analytics
        const Transaction = require('../models/Transaction'); // Ensure imported
        await Transaction.create({
            companyId: req.user.company,
            userId: invoice.customerId, // Capture Customer ID
            invoiceId: invoice._id,
            amount: invoice.totalAmount,
            currency: 'INR',
            paymentId: `CASH_${Date.now()}`, // Dummy ID for Cash
            orderId: `MANUAL_${Date.now()}`,
            status: 'Success',
            paymentMethod: 'Cash/Manual'
        });

        // ✅ LOG ACTIVITY FOR LIVE FEED
        const { logActivity } = require('../utils/activityLogger');
        await logActivity({
            userId: invoice.customerId, // Log it as the User's action (or Admin's? User context is better for "Sachin paid...")
            societyId: req.user.company,
            action: 'PAYMENT_SUCCESS',
            category: 'SUCCESS',
            description: `Payment of ₹${invoice.totalAmount} received from ${invoice.customerName}`,
            metadata: {
                invoiceId: invoice._id,
                amount: invoice.totalAmount,
                method: 'Cash/Manual'
            },
            req
        });

        // Send WhatsApp Receipt
        const message = `Payment Received! Your bill of ₹${invoice.totalAmount} is marked as PAID via Cash/Manual. Thank you.`;
        sendWhatsApp(invoice.customerId, req.user.company, message);

        res.json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all invoices for a specific user (Admin context)
// @route   GET /api/invoices/user/:userId
// @access  Admin
const getInvoicesByUser = async (req, res) => {
    try {
        const invoices = await Invoice.find({
            customerId: req.params.userId
        }).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        console.error("Get Invoices By User Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getInvoices,
    createInvoice,
    createBulkInvoices,
    markAsPaid,
    getInvoicesByUser
};
