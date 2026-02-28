const express = require('express');
const router = express.Router();
const Camera = require('../models/Camera');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get all cameras for a society (Admin/Guard)
// @route   GET /api/cameras
router.get('/', protect, async (req, res) => {
    try {
        const cameras = await Camera.find({ society: req.user.company });
        res.json(cameras);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get public cameras for residents
// @route   GET /api/cameras/public
router.get('/public', protect, async (req, res) => {
    try {
        const cameras = await Camera.find({
            society: req.user.company,
            isPublic: true,
            status: 'Online'
        });
        res.json(cameras);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add a new camera (Admin only)
// @route   POST /api/cameras
router.post('/', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const { name, streamUrl, location, type, resolution, isPublic } = req.body;

        const camera = await Camera.create({
            name,
            streamUrl,
            location,
            type,
            resolution,
            isPublic,
            society: req.user.company
        });

        res.status(201).json(camera);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update camera status/details
// @route   PUT /api/cameras/:id
router.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const camera = await Camera.findById(req.params.id);
        if (!camera) return res.status(404).json({ message: 'Camera not found' });

        if (camera.society.toString() !== req.user.company.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedCamera = await Camera.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedCamera);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a camera
// @route   DELETE /api/cameras/:id
router.delete('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
    try {
        const camera = await Camera.findById(req.params.id);
        if (!camera) return res.status(404).json({ message: 'Camera not found' });

        if (camera.society.toString() !== req.user.company.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await camera.deleteOne();
        res.json({ message: 'Camera removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
