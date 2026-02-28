const GlobalConfig = require('../models/GlobalConfig');

// @desc    Get Global Config (Public) - Theme, Maintenance Mode etc.
// @route   GET /api/config/public
// @access  Public
const getPublicConfig = async (req, res) => {
    try {
        // Find the first config or create default
        let config = await GlobalConfig.findOne();
        if (!config) {
            config = await GlobalConfig.create({});
        }
        res.json({
            festiveThemeOverride: config.festiveThemeOverride,
            maintenanceMode: config.maintenanceMode
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Global Config
// @route   PUT /api/config
// @access  Admin
const updateConfig = async (req, res) => {
    try {
        let config = await GlobalConfig.findOne();
        if (!config) {
            config = await GlobalConfig.create({});
        }

        const { festiveThemeOverride } = req.body;

        if (festiveThemeOverride !== undefined) {
            // Validate if needed
            config.festiveThemeOverride = festiveThemeOverride;
        }

        await config.save();

        // Broadcast update via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.emit('global_config_updated', {
                festiveThemeOverride: config.festiveThemeOverride
            });
        }

        res.json(config);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getPublicConfig, updateConfig };
