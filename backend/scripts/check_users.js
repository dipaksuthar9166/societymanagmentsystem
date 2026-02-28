const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = 'mongodb://localhost:27017/billing_app';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await User.find({});
        console.log('--- USER LIST ---');
        users.forEach(u => {
            console.log(`Name: ${u.name}, Role: ${u.role}, Flat: ${u.flatNo}`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
