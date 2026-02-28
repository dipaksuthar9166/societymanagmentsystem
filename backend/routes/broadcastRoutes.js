const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin: Broadcast message to all residents
router.post('/broadcast', protect, authorize('admin'), async (req, res) => {
    try {
        const { content, messageType = 'text' } = req.body;
        const senderId = req.user.id;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        // Get all users in the same society (except admin himself)
        const residents = await User.find({
            company: req.user.company,
            role: 'user',
            _id: { $ne: senderId }
        }).select('_id');

        if (residents.length === 0) {
            return res.status(404).json({ message: 'No residents found' });
        }

        // Create messages for each resident
        const messages = residents.map(resident => {
            const conversationId = [senderId, resident._id].sort().join('_');
            return {
                conversationId,
                sender: senderId,
                receiver: resident._id,
                content,
                messageType,
                company: req.user.company
            };
        });

        // Bulk insert
        const savedMessages = await Message.insertMany(messages);

        // Emit socket events to all residents
        const io = req.app.get('io');
        if (io) {
            savedMessages.forEach(msg => {
                io.to(msg.receiver.toString()).emit('new_message', msg);
            });
        }

        res.status(201).json({
            message: 'Broadcast sent successfully',
            count: savedMessages.length
        });
    } catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
