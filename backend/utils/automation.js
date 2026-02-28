const cron = require('node-cron');
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Flat = require('../models/Flat');
const Invoice = require('../models/Invoice');
const User = require('../models/User');

const initAutomation = () => {
    console.log('🔄 Automation System Initialized');

    // 1. Monthly Maintenance Generator - Run at 00:00 on 1st day of every month
    cron.schedule('0 0 1 * *', async () => {
        console.log('📅 Starting Monthly Maintenance Generation...');
        await generateMonthlyInvoices();
    });

    // 2. Daily Penalty Calculator - Run at 01:00 AM every day
    cron.schedule('0 1 * * *', async () => {
        console.log('⚖️ Starting Daily Penalty Calculation...');
        await applyLateFees();
    });

    // 3. Automated Reminders - Run at 10:00 AM every day
    cron.schedule('0 10 * * *', async () => {
        console.log('📢 Starting Automated Reminders...');
        await sendAutoReminders();
    });
};

const sendAutoReminders = async () => {
    try {
        const { sendWhatsApp, sendEmail } = require('./notificationService');
        const societies = await Company.find({ status: 'Active' });
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const society of societies) {
            // Find invoices due TODAY
            const dueToday = await Invoice.find({
                societyId: society._id,
                status: 'Pending',
                dueDate: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }).populate('customerId');

            for (const inv of dueToday) {
                if (inv.customerId) {
                    const subject = `Urgent: Bill Due Today - ${society.name}`;
                    const msg = `Dear ${inv.customerId.name}, your maintenance bill of ₹${inv.totalAmount} is due TODAY. Please pay to avoid late fees.`;
                    await sendEmail(inv.customerId._id, society._id, subject, msg);
                    await sendWhatsApp(inv.customerId._id, society._id, msg);
                }
            }

            // Overdue Reminders
            const overdue = await Invoice.find({
                societyId: society._id,
                status: 'Overdue'
            }).populate('customerId');

            for (const invoice of overdue) {
                const lastReminded = invoice.lastRemindedAt ? new Date(invoice.lastRemindedAt) : null;
                const now = new Date();
                const diffTime = lastReminded ? Math.abs(now - lastReminded) : Infinity;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 3) {
                    const subject = `Final Warning: Overdue Bill - ${society.name}`;
                    const msg = `Final Reminder: Your bill of ₹${invoice.totalAmount} is Overdue. Legal action may be initiated if not paid within 48 hours.`;
                    if (invoice.customerId) {
                        await sendWhatsApp(invoice.customerId._id, society._id, msg);
                        await sendEmail(invoice.customerId._id, society._id, subject, msg);
                        invoice.lastRemindedAt = new Date();
                        await invoice.save();
                    }
                }
            }
        }
    } catch (error) {
        console.error("Auto Reminder Error:", error);
    }
};

const generateMonthlyInvoices = async () => {
    try {
        const societies = await Company.find({ status: 'Active' });

        for (const society of societies) {
            console.log(`Processing Society: ${society.name} (${society._id})`);

            // Get all Occupied flats in this society
            const flats = await Flat.find({
                societyId: society._id,
                status: 'Occupied',
                tenantId: { $ne: null } // Ensure there is someone to bill
            }).populate('tenantId');

            let generatedCount = 0;

            for (const flat of flats) {
                if (!flat.maintenanceAmount || flat.maintenanceAmount <= 0) continue;

                // Check if invoice already exists for this month
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const endOfMonth = new Date(startOfMonth);
                endOfMonth.setMonth(endOfMonth.getMonth() + 1);

                const existingInvoice = await Invoice.findOne({
                    customerId: flat.tenantId._id,
                    type: 'Maintenance',
                    createdAt: { $gte: startOfMonth, $lt: endOfMonth }
                });

                if (existingInvoice) {
                    console.log(`Skipping ${flat.flatNo}, invoice already exists.`);
                    continue;
                }

                // Calculate Arrears
                const pendingInvoices = await Invoice.find({
                    customerId: flat.tenantId._id,
                    status: { $in: ['Pending', 'Overdue'] }
                });
                const arrearsAmount = pendingInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

                // Create Invoice
                const billAmount = flat.maintenanceAmount;
                const gstPercentage = 18; // Default or fetch from Society settings
                const gstAmount = (billAmount * gstPercentage) / 100; // Assuming inclusive or exclusive? Usually exclusive. Let's assume exclusive.
                // Actually Invoice model seems to calculate totalAmount as subtotal + gst + arrears.

                const totalAmount = billAmount + gstAmount + arrearsAmount;

                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 10); // 10 days to pay

                await Invoice.create({
                    societyId: society._id,
                    adminId: society.ownerId, // Assign to society owner/admin
                    customerId: flat.tenantId._id,
                    customerName: flat.tenantId.name,
                    items: [{
                        name: `Monthly Maintenance - ${flat.flatNo}`,
                        price: billAmount,
                        quantity: 1
                    }],
                    subtotal: billAmount,
                    gstPercentage: gstPercentage,
                    gstAmount: gstAmount,
                    oldArrears: arrearsAmount,
                    totalAmount: totalAmount,
                    status: 'Pending',
                    type: 'Maintenance',
                    billingPeriod: {
                        from: startOfMonth,
                        to: endOfMonth
                    },
                    dueDate: dueDate,
                    notes: `Auto-generated maintenance bill for ${flat.flatNo}`
                });

                generatedCount++;
            }
            console.log(`Generated ${generatedCount} invoices for ${society.name}`);
        }
    } catch (error) {
        console.error("Monthly Maintenance Error:", error);
    }
};

const applyLateFees = async () => {
    try {
        const societies = await Company.find({ status: 'Active' });

        for (const society of societies) {
            // Check if Late Fee Rule is enabled
            if (!society.settings || !society.settings.lateFeeRule || !society.settings.lateFeeRule.enabled) {
                continue;
            }

            const dailyFine = society.settings.lateFeeRule.dailyFine || 0;
            if (dailyFine <= 0) continue;

            // Find overdue invoices for this society
            const overdueInvoices = await Invoice.find({
                societyId: society._id,
                status: { $ne: 'Paid' },
                dueDate: { $lt: new Date() } // Due date passed
            });

            let penaltyCount = 0;

            for (const invoice of overdueInvoices) {
                // Check if penalty already applied today
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (invoice.lastPenaltyDate && new Date(invoice.lastPenaltyDate) >= today) {
                    continue; // Already applied today
                }

                // Apply Penalty
                invoice.penalty = (invoice.penalty || 0) + dailyFine;
                invoice.totalAmount = (invoice.totalAmount || 0) + dailyFine;
                invoice.lastPenaltyDate = new Date();

                if (invoice.status === 'Pending') {
                    invoice.status = 'Overdue';
                }

                await invoice.save();
                penaltyCount++;
            }

            if (penaltyCount > 0) {
                console.log(`Applied late fees to ${penaltyCount} invoices in ${society.name}`);
            }
        }
    } catch (error) {
        console.error("Late Fee Error:", error);
    }
};

module.exports = { initAutomation };
