const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Invoice = require('../models/Invoice');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/billing_app';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB...');

        const transactions = await Transaction.find({});
        console.log(`Total Transactions: ${transactions.length}`);

        if (transactions.length > 0) {
            console.log('--- Recent Transactions ---');
            transactions.slice(0, 5).forEach(t => {
                console.log(`User: ${t.userId}, Amount: ${t.amount}, Status: ${t.status}, Date: ${t.createdAt}`);
            });
        }

        const invoices = await Invoice.find({});
        console.log(`Total Invoices: ${invoices.length}`);
        const paidInvoices = invoices.filter(i => i.status === 'Paid');
        console.log(`Paid Invoices: ${paidInvoices.length}`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
