const Asset = require('../models/Asset');

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private (Admin)
const getAssets = async (req, res) => {
    try {
        const assets = await Asset.find({ societyId: req.user.company });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create asset
// @route   POST /api/assets
// @access  Private (Admin)
const createAsset = async (req, res) => {
    try {
        const asset = await Asset.create({
            societyId: req.user.company,
            ...req.body
        });
        res.status(201).json(asset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private (Admin)
const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(asset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin)
const deleteAsset = async (req, res) => {
    try {
        await Asset.findByIdAndDelete(req.params.id);
        res.json({ message: 'Asset Removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add Service Log
// @route   POST /api/assets/:id/service
// @access  Private (Admin)
const addServiceLog = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) return res.status(404).json({ message: 'Asset Not found' });

        const log = {
            date: req.body.date || new Date(),
            description: req.body.description,
            cost: req.body.cost,
            performedBy: req.body.performedBy
        };

        asset.serviceHistory.push(log);

        // Auto update status if maintenance
        if (req.body.status) asset.status = req.body.status;

        await asset.save();
        res.json(asset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    addServiceLog
};
