const SmartAutomation = require('../models/SmartAutomation');
const User = require('../models/User');

// @desc    Create a new automation rule
// @route   POST /api/superadmin/automations
// @access  Super Admin
const createAutomation = async (req, res) => {
    try {
        const { name, type, trigger, content } = req.body;

        const automation = await SmartAutomation.create({
            name,
            type,
            trigger,
            content,
            createdBy: req.user._id
        });

        res.status(201).json(automation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all automations
// @route   GET /api/superadmin/automations
// @access  Super Admin
const getAutomations = async (req, res) => {
    try {
        const automations = await SmartAutomation.find().sort({ createdAt: -1 });
        res.json(automations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle automation status
// @route   PUT /api/superadmin/automations/:id/toggle
// @access  Super Admin
const toggleAutomation = async (req, res) => {
    try {
        const automation = await SmartAutomation.findById(req.params.id);
        if (!automation) return res.status(404).json({ message: 'Automation not found' });

        automation.isActive = !automation.isActive;
        await automation.save();

        res.json(automation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete automation
// @route   DELETE /api/superadmin/automations/:id
// @access  Super Admin
const deleteAutomation = async (req, res) => {
    try {
        await SmartAutomation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Automation Removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createAutomation,
    getAutomations,
    toggleAutomation,
    deleteAutomation
};
