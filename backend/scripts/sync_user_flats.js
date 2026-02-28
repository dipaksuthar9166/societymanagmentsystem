const mongoose = require('mongoose');
const User = require('../models/User');
const Flat = require('../models/Flat');

const MONGO_URI = 'mongodb://localhost:27017/billing_app';

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB. Starting Sync...');

        // 1. Get all occupied flats
        const occupiedFlats = await Flat.find({ tenantId: { $ne: null } });
        console.log(`Found ${occupiedFlats.length} occupied flats.`);

        const assignedUserIds = new Set();

        for (const flat of occupiedFlats) {
            const user = await User.findById(flat.tenantId);
            if (user) {
                user.flatNo = flat.flatNo;
                await user.save();
                console.log(`Synced User ${user.name} to Flat ${flat.flatNo}`);
                assignedUserIds.add(user._id.toString());
            }
        }

        // 2. Clear flats for users who are NOT in any flat
        const allUsers = await User.find({ role: 'user' }); // Only syncing 'user' role

        for (const user of allUsers) {
            if (!assignedUserIds.has(user._id.toString())) {
                if (user.flatNo && user.flatNo !== 'N/A') {
                    // Check if it looks like a random one we generated (A-101 format)
                    // Actually, just clear it if not in Flat table to be safe
                    console.log(`Clearing Flat for User ${user.name} (Was: ${user.flatNo}, but not assigned in Flat Management)`);
                    user.flatNo = null;
                    await user.save();
                }
            }
        }

        console.log('✅ User Flat Numbers Synced with Flat Management!');
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
