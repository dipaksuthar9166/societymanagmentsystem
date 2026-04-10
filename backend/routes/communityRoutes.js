const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ForumPost = require('../models/ForumPost');
const Poll = require('../models/Poll');
const User = require('../models/User');

// --- SOCIETY FORUM (Discussions) ---

// @desc    Get all forum posts for a society
// @route   GET /api/community/forum
router.get('/forum', protect, async (req, res) => {
    try {
        const posts = await ForumPost.find({ company: req.user.company })
            .populate('author', 'name flatNo')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Create a new forum post
// @route   POST /api/community/forum
router.post('/forum', protect, async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const post = new ForumPost({
            title,
            content,
            category,
            author: req.user._id,
            company: req.user.company
        });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc    Like/Unlike a forum post
// @route   PATCH /api/community/forum/:id/like
router.patch('/forum/:id/like', protect, async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const index = post.likes.indexOf(req.user._id);
        if (index === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- DAILY POLLS ---

// @desc    Get active polls for a society
// @route   GET /api/community/polls
router.get('/polls', protect, async (req, res) => {
    try {
        const polls = await Poll.find({ 
            company: req.user.company,
            status: 'Open' 
        }).sort({ createdAt: -1 });
        res.json(polls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Vote on a poll
// @route   POST /api/community/polls/:id/vote
router.post('/polls/:id/vote', protect, async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const poll = await Poll.findById(req.params.id);

        if (!poll) return res.status(404).json({ message: 'Poll not found' });
        
        // Check if user already voted in the votes array
        const hasVoted = poll.votes.some(v => v.user.toString() === req.user._id.toString());
        if (hasVoted) {
            return res.status(400).json({ message: 'You have already participated in this poll' });
        }

        if (poll.status === 'Closed') {
            return res.status(400).json({ message: 'This poll is closed' });
        }

        // Add vote to analytics
        poll.votes.push({
            user: req.user._id,
            optionIndex,
            votedAt: new Date()
        });

        // Increment computed count for faster frontend reading
        if (poll.options[optionIndex]) {
            poll.options[optionIndex].votes = (poll.options[optionIndex].votes || 0) + 1;
        }

        await poll.save();
        res.json(poll);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- SOCIETY DIRECTORY ---
router.get('/directory', protect, async (req, res) => {
    try {
        const users = await User.find({
            company: req.user.company,
            role: { $in: ['user', 'guard', 'admin'] }
        }).select('name flatNo role status isOnline');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
