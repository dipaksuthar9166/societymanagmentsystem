const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');

const MONGO_URI = 'mongodb://localhost:27017/billing_app';

const run = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        console.log('Cleaning up sample analytics data...');

        // 1. Delete Dummy Transactions (Checking Order ID patterns)
        const txResult = await Transaction.deleteMany({
            $or: [
                { orderId: { $regex: /^TEST_/ } },
                { orderId: { $regex: /^FIX_/ } },
                { paymentId: { $regex: /^TEST_/ } },
                { paymentId: { $regex: /^FIX_/ } }
            ]
        });
        console.log(`Deleted ${txResult.deletedCount} dummy transactions.`);

        // 2. Delete Dummy Invoices (Checking Notes)
        const invResult = await Invoice.deleteMany({
            $or: [
                { notes: 'TEST DATA' },
                { notes: 'AUTO_GENERATED_FIX' }
            ]
        });
        console.log(`Deleted ${invResult.deletedCount} dummy invoices.`);

        // 3. Delete Dummy Activities
        const actResult = await ActivityLog.deleteMany({
            description: { $regex: /test/i } // Careful regex for 'test' keyword
        });
        // Or specific actions
        const actSpecific = await ActivityLog.deleteMany({
            action: 'DATA_GENERATED'
        });
        console.log(`Deleted ${actResult.deletedCount + actSpecific.deletedCount} dummy activities.`);

        console.log('✅ Sample Data Cleared Successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
