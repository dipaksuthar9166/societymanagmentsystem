const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Alert = require('./models/Alert');

dotenv.config();

const app = express();
// Hardcode port 5001 if env fails, but prefer env
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/committee', require('./routes/committeeRoutes'));
app.use('/api/config', require('./routes/configRoutes')); // Global Config Routes
app.use('/api/legal-notices', require('./routes/legalNoticeRoutes'));
app.use('/api/features', require('./routes/featureRoutes')); // Smart Feature Routes for Residents

// Society Management Routes
app.use('/api/flats', require('./routes/flatRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/facilities', require('./routes/facilityRoutes'));
app.use('/api/visitors', require('./routes/visitorRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/guard', require('./routes/guardRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/calls', require('./routes/callRoutes'));
app.use('/api/broadcast', require('./routes/broadcastRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/bills/pay', require('./routes/billPaymentRoutes')); // Bill Payment (Razorpay)
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/cameras', require('./routes/cameraRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes')); // Analytics Routes
app.use('/api/verification', require('./routes/verificationRoutes')); // Email verification
app.use('/api/otp', require('./routes/otpRoutes')); // OTP verification
app.use('/api/auth/login-otp', require('./routes/otpLoginRoutes')); // OTP Login
app.use('/api/test', require('./routes/testRoutes')); // Test endpoints
app.use('/api/test', require('./routes/analyticsTestRoutes')); // Analytics test data

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Analytics Routes (Moved here to ensure it's registered)
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.use('/api/public', require('./routes/publicRoutes')); // Landing Page API

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is up and listening on port ' + PORT });
});

const { initAutomation } = require('./utils/automation');

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/billing_app')
    .then(() => {
        console.log('MongoDB Connected');
        // Initialize Background Automation (Reminders, Stats, etc.)
        // Initialize Background Automation (Reminders, Stats, etc.)
        initAutomation();

        // SELF-REPAIR: Ensure Global Config Exists
        const GlobalConfig = require('./models/GlobalConfig');
        GlobalConfig.findOne().then(async (cfg) => {
            if (!cfg) {
                console.log('[System]: Global Config missing. Creating default...');
                await GlobalConfig.create({ currency: 'INR (₹)', gstPercentage: 18, lateFeeDaily: 50 });
            }
        });

        // SELF-REPAIR: Fix any "Main Gate" users who accidentally got 'user' role
        const User = require('./models/User');
        User.updateMany(
            { flatNo: 'Main Gate', role: 'user' },
            { $set: { role: 'guard' } }
        ).then(res => {
            if (res.modifiedCount > 0) console.log(`[System]: Auto-fixed ${res.modifiedCount} Guard Accounts with wrong roles.`);
            // SELF-REPAIR: Ensure at least one Superadmin exists
            User.findOne({ role: 'superadmin' }).then(async (admin) => {
                if (!admin) {
                    console.log('[System]: No Superadmin found! Creating default Superadmin...');
                    const bcrypt = require('bcryptjs');
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash('12345678', salt);

                    await User.create({
                        name: 'System Superadmin',
                        email: 'super@gmail.com',
                        password: hashedPassword,
                        role: 'superadmin',
                        status: 'active',
                        isVerified: true
                    });
                    console.log('[System]: Default Superadmin created successfully! (Email: super@gmail.com | Pass: 12345678)');
                }
            });
        })
            .catch(err => console.log(err));

        const { Server } = require('socket.io');
        const os = require('os');

        // Get local IP address
        function getLocalIP() {
            const interfaces = os.networkInterfaces();
            for (const name of Object.keys(interfaces)) {
                for (const iface of interfaces[name]) {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        return iface.address;
                    }
                }
            }
            return 'localhost';
        }

        const server = app.listen(PORT, '0.0.0.0', () => {
            const localIP = getLocalIP();
            console.log(`Server running on port ${PORT}`);
            console.log(`📱 Mobile Access: http://${localIP}:${PORT}`);
            console.log(`💻 Laptop Access: http://localhost:${PORT}`);
            console.log(`🌐 Network Access: http://${localIP}:${PORT}`);
        });

        const io = new Server(server, {
            cors: {
                origin: "*",
            }
        });

        app.set('io', io);
        global.io = io; // Make io globally available for activity logging

        io.on('connection', (socket) => {
            console.log('Socket Connected:', socket.id);

            // Join society room for activity feed
            socket.on('joinSociety', (societyId) => {
                socket.join(`society_${societyId}`);
                console.log(`Socket ${socket.id} joined society_${societyId}`);
            });

            // ... Inside io.on('connection')
            socket.on('join_society', (societyId) => {
                socket.join(societyId);
                socket.societyId = societyId; // Store for disconnect handling
                // console.log(`Socket ${socket.id} joined society ${societyId}`);
            });

            socket.on('join_room', (userId) => {
                socket.join(userId);
                console.log(`Socket ${socket.id} joined personal room: ${userId}`);

                // Track online status
                if (!global.onlineUsers) global.onlineUsers = new Map();
                global.onlineUsers.set(userId, socket.id);

                // Broadcast that user is online to their society
                const userSocietyId = socket.societyId;
                if (userSocietyId) {
                    io.to(userSocietyId).emit('user_status_change', { userId, status: 'online' });
                }
            });

            socket.on('typing_status', (data) => {
                // data: { receiverId, conversationId, isTyping }
                io.to(data.receiverId).emit('typing_status', {
                    senderId: socket.id, // Not really needed, but okay
                    conversationId: data.conversationId,
                    isTyping: data.isTyping
                });
            });

            socket.on('send_sos', async (data) => {
                console.log("🆘 SOS RECEIVED:", data);
                try {
                    // Validate/Fetch Society ID first
                    let targetSocietyId = data.societyId;
                    if (!targetSocietyId && data.userId) {
                        try {
                            const User = require('./models/User');
                            const u = await User.findById(data.userId);
                            if (u) targetSocietyId = u.company;
                        } catch (err) {
                            console.error("Failed to fetch user for SOS societyId fallback", err);
                        }
                    }

                    // Save to DB
                    const alert = new Alert({
                        userId: data.userId,
                        userName: data.user || 'Unknown',
                        type: data.type,
                        location: data.location || { lat: 0, lng: 0 },
                        status: 'Active',
                        societyId: targetSocietyId // Use resolved ID
                    });
                    await alert.save();
                    console.log("✅ SOS Saved:", alert._id, "Society:", targetSocietyId);

                    // Broadcast with persisted ID and correct societyId
                    // Use targetSocietyId for routing the room event
                    if (targetSocietyId) {
                        io.to(targetSocietyId).emit('receive_sos', { ...data, _id: alert._id, societyId: targetSocietyId });
                    } else {
                        io.emit('receive_sos', { ...data, _id: alert._id }); // Fallback
                    }

                    // ✅ LOG ACTIVITY FOR LIVE FEED (Control Room)
                    try {
                        const { logActivity } = require('./utils/activityLogger');
                        if (targetSocietyId) {
                            await logActivity({
                                userId: data.userId,
                                societyId: targetSocietyId,
                                action: 'SOS_TRIGGERED',
                                category: 'CRITICAL',
                                description: `SOS Emergency Alert from ${data.user || 'Unknown User'}`,
                                metadata: {
                                    alertId: alert._id,
                                    location: data.location,
                                    type: data.type
                                }
                            });
                        }
                    } catch (loggingErr) {
                        console.error("Failed to log SOS activity:", loggingErr);
                    }

                } catch (e) {
                    console.error("SOS Save Error", e);
                    io.emit('receive_sos', data); // Fallback
                }
            });

            // WebRTC Signaling for calls
            socket.on('webrtc_offer', (data) => {
                io.to(data.to).emit('webrtc_offer', {
                    from: data.from,
                    offer: data.offer,
                    callId: data.callId
                });
            });

            socket.on('webrtc_answer', (data) => {
                io.to(data.to).emit('webrtc_answer', {
                    from: data.from,
                    answer: data.answer,
                    callId: data.callId
                });
            });

            socket.on('webrtc_ice_candidate', (data) => {
                io.to(data.to).emit('webrtc_ice_candidate', {
                    from: data.from,
                    candidate: data.candidate,
                    callId: data.callId
                });
            });

            socket.on('get_online_users', () => {
                if (global.onlineUsers) {
                    const onlineList = Array.from(global.onlineUsers.keys());
                    socket.emit('online_users_list', onlineList);
                }
            });

            socket.on('disconnect', () => {
                if (global.onlineUsers) {
                    for (let [userId, socketId] of global.onlineUsers.entries()) {
                        if (socketId === socket.id) {
                            global.onlineUsers.delete(userId);
                            const userSocietyId = socket.societyId;
                            if (userSocietyId) {
                                io.to(userSocietyId).emit('user_status_change', { userId, status: 'offline' });
                            }
                            console.log(`User ${userId} went offline`);
                            break;
                        }
                    }
                }
            });
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use. Choose a different PORT in .env or stop the other process.`);
            } else {
                console.error('❌ Server error:', err);
            }
            process.exit(1);
        });
