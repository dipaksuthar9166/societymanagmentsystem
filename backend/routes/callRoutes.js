const express = require('express');
const router = express.Router();
const Call = require('../models/Call');
const { protect } = require('../middleware/authMiddleware');

// Initiate a call
router.post('/initiate', protect, async (req, res) => {
    try {
        const { receiverId, callType } = req.body;
        const callerId = req.user.id;

        if (!receiverId || !callType) {
            return res.status(400).json({ message: 'Receiver and call type are required' });
        }

        const call = new Call({
            caller: callerId,
            receiver: receiverId,
            callType,
            status: 'initiated',
            company: req.user.company
        });

        await call.save();
        await call.populate('caller', 'name email role');
        await call.populate('receiver', 'name email role');

        // Emit socket event for incoming call
        const io = req.app.get('io');
        if (io) {
            io.to(receiverId.toString()).emit('incoming_call', call);
        }

        res.status(201).json(call);
    } catch (error) {
        console.error('Initiate call error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Answer a call
router.put('/answer/:callId', protect, async (req, res) => {
    try {
        const call = await Call.findByIdAndUpdate(
            req.params.callId,
            {
                status: 'answered',
                startTime: new Date()
            },
            { new: true }
        ).populate('caller receiver', 'name email role');

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(call.caller._id.toString()).emit('call_answered', call);
        }

        res.json(call);
    } catch (error) {
        console.error('Answer call error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject a call
router.put('/reject/:callId', protect, async (req, res) => {
    try {
        const call = await Call.findByIdAndUpdate(
            req.params.callId,
            { status: 'rejected' },
            { new: true }
        ).populate('caller receiver', 'name email role');

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.to(call.caller._id.toString()).emit('call_rejected', call);
        }

        res.json(call);
    } catch (error) {
        console.error('Reject call error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// End a call
router.put('/end/:callId', protect, async (req, res) => {
    try {
        const call = await Call.findById(req.params.callId);

        if (!call) {
            return res.status(404).json({ message: 'Call not found' });
        }

        const endTime = new Date();
        const duration = call.startTime
            ? Math.floor((endTime - call.startTime) / 1000)
            : 0;

        call.status = 'ended';
        call.endTime = endTime;
        call.duration = duration;
        await call.save();

        await call.populate('caller receiver', 'name email role');

        // Emit socket event to both parties
        const io = req.app.get('io');
        if (io) {
            const otherUserId = call.caller._id.toString() === req.user.id.toString()
                ? call.receiver._id.toString()
                : call.caller._id.toString();

            io.to(otherUserId).emit('call_ended', call);
        }

        res.json(call);
    } catch (error) {
        console.error('End call error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get call history
router.get('/history', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        const calls = await Call.find({
            company: req.user.company,
            $or: [
                { caller: userId },
                { receiver: userId }
            ]
        })
            .populate('caller receiver', 'name email role flatNo')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(calls);
    } catch (error) {
        console.error('Get call history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
