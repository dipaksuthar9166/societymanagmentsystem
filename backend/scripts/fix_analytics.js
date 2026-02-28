const mongoose = require('mongoose');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const Complaint = require('../models/Complaint');

const MONGO_URI = 'mongodb://localhost:27017/billing_app';

const run = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        // 1. Get All Users
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        const blocks = ['A', 'B', 'C', 'D'];

        for (const user of users) {
            // Fix Flat No
            if (!user.flatNo || user.flatNo === 'N/A') {
                const randomBlock = blocks[Math.floor(Math.random() * blocks.length)];
                const randomNumber = Math.floor(Math.random() * 900) + 101;
                user.flatNo = `${randomBlock}-${randomNumber}`;
                await user.save();
                console.log(`Updated user ${user.name} with Flat ${user.flatNo}`);
            }

            // Only generate data for users who have a Company
            if (user.company) {
                const societyId = user.company;

                // Check if user has transactions
                const txCount = await Transaction.countDocuments({ userId: user._id });

                if (txCount === 0) {
                    console.log(`Generating dummy payments for ${user.name}...`);

                    // Create 2-3 Paid Invoices & Transactions
                    const numPaid = 3;
                    for (let i = 0; i < numPaid; i++) {
                        const amount = (Math.floor(Math.random() * 3) + 1) * 2000;
                        const date = new Date();
                        date.setDate(date.getDate() - (i * 10)); // Payment every 10 days backward

                        // Create Invoice
                        const invoice = await Invoice.create({
                            societyId,
                            adminId: user._id, // Assume self/admin created
                            customerId: user._id,
                            customerName: user.name,
                            items: [{ name: 'Maintenance (Generated)', price: amount, quantity: 1 }],
                            totalAmount: amount,
                            status: 'Paid',
                            billingPeriod: { from: date, to: date },
                            dueDate: date,
                            notes: 'AUTO_GENERATED_FIX'
                        });

                        // Create Transaction
                        await Transaction.create({
                            companyId: societyId,
                            userId: user._id,
                            invoiceId: invoice._id,
                            amount: amount,
                            paymentId: `FIX_PAY_${Date.now()}_${i}`,
                            orderId: `FIX_ORDER_${Date.now()}_${i}`,
                            status: 'Success',
                            paymentMethod: 'UPI',
                            createdAt: date
                        });
                    }
                } else {
                    console.log(`User ${user.name} already has transactions. Skipping generation.`);
                }
            }
        }

        console.log('✅ Analytics Data Fixed Successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
