const SmartFeature = require('../models/SmartFeature');
const FeatureLog = require('../models/FeatureLog');

// @desc    Get all active smart features
// @route   GET /api/superadmin/features
// @access  Super Admin
const getFeatures = async (req, res) => {
    try {
        let features = await SmartFeature.find();
        if (features.length === 0) {
            // Seed initial features if empty
            const seeds = [
                { module: 'EV_PARKING', isActive: false },
                { module: 'SKILL_MARKET', isActive: true },
                { module: 'ASSET_SHARE', isActive: false },
                { module: 'EMERGENCY_SOS', isActive: true },
                { module: 'IOT_LEAKAGE', isActive: false },
                { module: 'DIGITAL_DEMOCRACY', isActive: false }
            ];
            features = await SmartFeature.insertMany(seeds);
        }
        res.json(features);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle feature status
// @route   PUT /api/superadmin/features/:id/toggle
// @access  Super Admin
const toggleFeature = async (req, res) => {
    try {
        const feature = await SmartFeature.findById(req.params.id);
        if (!feature) return res.status(404).json({ message: 'Feature not found' });

        feature.isActive = !feature.isActive;
        await feature.save();
        res.json(feature);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get feature activity logs (SOS, Skills, etc)
// @route   GET /api/superadmin/features/logs
// @access  Super Admin
const getFeatureLogs = async (req, res) => {
    try {
        const logs = await FeatureLog.find()
            .populate('user', 'name flatNo')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getFeatures,
    toggleFeature,
    getFeatureLogs
};
