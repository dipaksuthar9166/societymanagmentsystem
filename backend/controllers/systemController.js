const GlobalConfig = require('../models/GlobalConfig');

// @desc    Get system settings
// @route   GET /api/superadmin/settings
// @access  Super Admin
const getSystemSettings = async (req, res) => {
    try {
        let settings = await GlobalConfig.findOne();
        if (!settings) {
            settings = await GlobalConfig.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update system settings
// @route   PUT /api/superadmin/settings
// @access  Super Admin
const updateSystemSettings = async (req, res) => {
    try {
        let settings = await GlobalConfig.findOne();
        if (!settings) {
            settings = new GlobalConfig(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getSystemSettings,
    updateSystemSettings
};
