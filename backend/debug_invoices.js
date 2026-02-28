const mongoose = require('mongoose');
const Invoice = require('./models/Invoice');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/billing_app')
    .then(async () => {
        const pending = await Invoice.countDocuments({ status: 'Pending' });
        const overdue = await Invoice.countDocuments({ status: 'Overdue' });
        const paid = await Invoice.countDocuments({ status: 'Paid' });
        console.log(`DEBUG INVOICES: Pending=${pending}, Overdue=${overdue}, Paid=${paid}`);

        const sample = await Invoice.findOne({ status: 'Pending' });
        if (sample) console.log('Sample Pending:', sample);

        process.exit();
    })
    .catch(err => console.error(err));
