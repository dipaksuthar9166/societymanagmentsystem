const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/billing_app')
    .then(async () => {
        const u = await User.findOne({ email: 'kripa@gmail.com' }); // Assuming email or searching by name regex if needed
        if (!u) {
            console.log("User 'kripa' not found by email... searching by name");
            const u2 = await User.findOne({ name: 'kripa' });
            console.log('USER DEBUG BY NAME:', u2);
        } else {
            console.log('USER DEBUG BY EMAIL:', u);
        }
        process.exit();
    })
    .catch(err => console.error(err));
