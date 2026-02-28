const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const CommunityPost = require('../models/CommunityPost');
const Poll = require('../models/Poll');
const ServiceProvider = require('../models/ServiceProvider');

// --- MARKETPLACE & LOST-FOUND ---
router.get('/posts', protect, async (req, res) => {
    try {
        const posts = await CommunityPost.find({
            societyId: req.user.company,
            status: 'Active'
        }).populate('postedBy', 'name flatNo block').sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/posts', protect, async (req, res) => {
    try {
        const post = new CommunityPost({
            ...req.body,
            postedBy: req.user._id,
            societyId: req.user.company
        });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- POLLS ---
router.get('/polls', protect, async (req, res) => {
    try {
        // Fetch active polls
        const polls = await Poll.find({
            societyId: req.user.company,
            isActive: true
        }).sort({ createdAt: -1 });
        res.json(polls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/polls/:id/vote', protect, async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const poll = await Poll.findById(req.params.id);

        if (!poll) return res.status(404).json({ message: 'Poll not found' });
        if (poll.votedBy.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        poll.options[optionIndex].votes += 1;
        poll.votedBy.push(req.user._id);
        await poll.save();

        res.json(poll);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- SERVICE PROVIDERS ---
router.get('/services', protect, async (req, res) => {
    try {
        const providers = await ServiceProvider.find({ societyId: req.user.company });
        res.json(providers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/services/:id/rate', protect, async (req, res) => {
    try {
        const { rating, review } = req.body;
        const provider = await ServiceProvider.findById(req.params.id);

        if (!provider) return res.status(404).json({ message: 'Provider not found' });

        const existingRating = provider.ratings.find(r => r.user.toString() === req.user._id.toString());
        if (existingRating) {
            existingRating.rating = rating;
            existingRating.review = review;
            existingRating.date = Date.now();
        } else {
            provider.ratings.push({ user: req.user._id, rating, review });
        }

        // Recalculate average
        const total = provider.ratings.reduce((sum, r) => sum + r.rating, 0);
        provider.averageRating = total / provider.ratings.length;

        await provider.save();
        res.json(provider);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
