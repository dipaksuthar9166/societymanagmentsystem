const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/billing_app';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB. Starting Backfill...');

        const paidInvoices = await Invoice.find({ status: 'Paid' });
        console.log(`Found ${paidInvoices.length} Paid Invoices.`);

        let createdCount = 0;

        for (const inv of paidInvoices) {
            // Check if transaction exists
            const existingTx = await Transaction.findOne({ invoiceId: inv._id });
            if (!existingTx) {
                console.log(`Creating Transaction for Invoice: ${inv._id} (Amount: ${inv.totalAmount})`);

                await Transaction.create({
                    companyId: inv.societyId,
                    invoiceId: inv._id,
                    userId: inv.customerId,
                    amount: inv.totalAmount,
                    currency: 'INR',
                    paymentId: `manual_backfill_${inv._id}`,
                    orderId: `backfill_${inv._id}`,
                    status: 'Success',
                    paymentMethod: 'Manual/Backfill',
                    createdAt: inv.updatedAt || new Date()
                });
                createdCount++;
            } else {
                console.log(`Transaction already exists for Invoice: ${inv._id}`);
            }
        }

        console.log(`✅ Backfill Complete. Created ${createdCount} new transactions.`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
