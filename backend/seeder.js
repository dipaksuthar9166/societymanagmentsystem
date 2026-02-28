const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const GlobalConfig = require('./models/GlobalConfig');
const Template = require('./models/Template');

dotenv.config();

const superAdmin = {
    name: 'SocietyPro Master',
    email: 'super@gmail.com',
    password: '123',
    role: 'superadmin',
    status: 'active'
};

const defaultSettings = {
    currency: 'INR (₹)',
    gstPercentage: 18,
    lateFeeDaily: 50,
    gracePeriod: 5,
    maintenanceMode: false,
    whatsappEnabledGlobal: true
};

const defaultTemplates = [
    {
        name: 'Monthly Invoice Alert',
        type: 'WhatsApp',
        content: 'Hello {{name}}, your maintenance bill of {{amount}} for {{month}} is generated. Due date: {{dueDate}}.',
        variables: ['name', 'amount', 'month', 'dueDate'],
        active: true
    },
    {
        name: 'Payment Acknowledgement',
        type: 'WhatsApp',
        content: 'Dear {{name}}, we have received your payment of {{amount}}. Transaction ID: {{txnId}}. Thank you.',
        variables: ['name', 'amount', 'txnId'],
        active: true
    },
    {
        name: 'General Notice',
        type: 'WhatsApp',
        content: 'NOTICE: {{title}}. Dear Residents, {{message}}. Regards, Society Admin.',
        variables: ['title', 'message'],
        active: true
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/billing_app');
        console.log('MongoDB Connected');

        // 1. Clear Data
        await User.deleteMany({});
        await GlobalConfig.deleteMany({});
        await Template.deleteMany({});
        console.log('Cleaned old data (Users, Configs, Templates)');

        // 2. Create Super Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(superAdmin.password, salt);
        await User.create({ ...superAdmin, password: hashedPassword });
        console.log('Super Admin Created: super@gmail.com / 123');

        // 3. Create Global Config
        await GlobalConfig.create(defaultSettings);
        console.log('Global System Configuration Initialized');

        // 4. Create Default Templates
        await Template.insertMany(defaultTemplates);
        console.log('Default Communication Templates Seeded');

        // 5. Create Demo Society & Users (The Missing Link!)
        const Company = require('./models/Company');
        await Company.deleteMany({}); // Clear old companies

        const demoSociety = await Company.create({
            name: 'Skyline Heights Demo',
            email: 'skyline@demo.com',
            contactNumber: '9876543210',
            address: '123 Demo Street, Tech City',
            plan: 'Pro',
            status: 'Active',
            subscription: { startDate: new Date(), expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) }
        });

        // Create Admin for Society
        const adminHash = await bcrypt.hash('123', salt);
        const demoAdmin = await User.create({
            name: 'Skyline Manager',
            email: 'admin@gmail.com',
            password: adminHash,
            role: 'admin',
            company: demoSociety._id
        });

        // Link Owner
        demoSociety.ownerId = demoAdmin._id;
        await demoSociety.save();

        // Create Tenant for Society
        const userHash = await bcrypt.hash('123', salt);
        await User.create({
            name: 'Rahul Sharma',
            email: 'user@gmail.com',
            password: userHash,
            role: 'user',
            company: demoSociety._id,
            flatNo: 'A-101'
        });

        console.log('--- DEMO ENVIRONMENT READY ---');
        console.log('Society: Skyline Heights Demo');
        console.log('Admin: admin@gmail.com / 123');
        console.log('Tenant: user@gmail.com / 123');
        console.log('------------------------------');

        console.log('--- SEEDING COMPLETE ---');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedDB();
