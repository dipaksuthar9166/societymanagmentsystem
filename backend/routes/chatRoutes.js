const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Chat Images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/uploads/chat';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, `chat-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb('Error: Only images are allowed!');
    }
});

// Get all conversations for a user
router.get('/conversations', protect, async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const companyId = new mongoose.Types.ObjectId(req.user.company);

        console.log('Fetching conversations for user:', userId, 'company:', companyId);

        // Get unique conversations
        const messages = await Message.aggregate([
            {
                $match: {
                    company: companyId,
                    $or: [
                        { sender: userId },
                        { receiver: userId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$conversationId',
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        console.log('Found messages:', messages.length);

        // Populate user details
        const conversations = await Promise.all(messages.map(async (conv) => {
            const otherUserId = conv.lastMessage.sender.toString() === userId.toString()
                ? conv.lastMessage.receiver
                : conv.lastMessage.sender;

            const otherUser = await User.findById(otherUserId).select('name email role flatNo');

            return {
                conversationId: conv._id,
                otherUser,
                lastMessage: conv.lastMessage,
                unreadCount: conv.unreadCount
            };
        }));

        console.log('Returning conversations:', conversations.length);
        res.json(conversations);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get messages for a specific conversation
router.get('/messages/:conversationId', protect, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        const messages = await Message.find({
            conversationId,
            company: req.user.company
        })
            .populate('sender', 'name email role')
            .populate('receiver', 'name email role')
            .sort({ createdAt: 1 })
            .limit(100);

        // Mark messages as read
        await Message.updateMany(
            {
                conversationId,
                receiver: userId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send a message
router.post('/send', protect, async (req, res) => {
    try {
        const { receiverId, content, messageType = 'text' } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver and content are required' });
        }

        // Create conversation ID (sorted to ensure consistency)
        const conversationId = [senderId, receiverId].sort().join('_');

        const message = new Message({
            conversationId,
            sender: senderId,
            receiver: receiverId,
            content,
            messageType,
            company: req.user.company
        });

        await message.save();
        await message.populate('sender', 'name email role');
        await message.populate('receiver', 'name email role');

        // Emit socket event (handled in server.js)
        const io = req.app.get('io');
        if (io) {
            io.to(receiverId.toString()).emit('new_message', message);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload image in chat
router.post('/upload', protect, upload.single('image'), async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.id;

        if (!receiverId || !req.file) {
            return res.status(400).json({ message: 'Receiver and image are required' });
        }

        const conversationId = [senderId, receiverId].sort().join('_');
        const imageUrl = `/uploads/chat/${req.file.filename}`;

        const message = new Message({
            conversationId,
            sender: senderId,
            receiver: receiverId,
            content: 'Sent an image',
            fileUrl: imageUrl,
            messageType: 'image',
            company: req.user.company
        });

        await message.save();
        await message.populate('sender', 'name email role');
        await message.populate('receiver', 'name email role');

        const io = req.app.get('io');
        if (io) {
            io.to(receiverId.toString()).emit('new_message', message);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Upload chat image error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users in the same society (for chat list)
router.get('/users', protect, async (req, res) => {
    try {
        const users = await User.find({
            company: req.user.company,
            _id: { $ne: req.user.id } // Exclude self
        }).select('name email role flatNo block');

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark message as read
router.put('/read/:messageId', protect, async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.messageId,
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        res.json(message);
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
