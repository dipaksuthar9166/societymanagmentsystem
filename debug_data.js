const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Notice = require('./backend/models/Notice');
const Company = require('./backend/models/Company');
require('dotenv').config({ path: './backend/.env' });

const debugData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Fetch all users to identify Admin and User
        const users = await User.find({}).lean();
        console.log('\n--- USERS ---');
        users.forEach(u => console.log(`Name: ${u.name}, Role: ${u.role}, Company: ${u.company}`));

        // Fetch all notices
        const notices = await Notice.find({}).lean();
        console.log('\n--- NOTICES ---');
        notices.forEach(n => console.log(`Title: ${n.title}, SocietyId: ${n.societyId}, IsActive: ${n.isActive}`));

        // Fetch all companies
        const companies = await Company.find({}).lean();
        console.log('\n--- COMPANIES ---');
        companies.forEach(c => console.log(`Name: ${c.name}, ID: ${c._id}`));

        mongoose.connection.close();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugData();
