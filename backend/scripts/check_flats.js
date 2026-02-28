const mongoose = require('mongoose');
const Flat = require('../models/Flat');
const User = require('../models/User');

const MONGO_URI = 'mongodb://localhost:27017/billing_app';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const flats = await Flat.find({}).populate('tenantId', 'name');
        console.log('--- FLAT LIST ---');
        flats.forEach(f => {
            console.log(`Flat: ${f.flatNo}, Tenant: ${f.tenantId?.name || 'Vacant'}`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
