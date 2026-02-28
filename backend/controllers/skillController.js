const Skill = require('../models/Skill');
const User = require('../models/User');

// @desc    Get all active skills (Approved)
// @route   GET /api/skills
// @access  Private (Resident)
const getSkills = async (req, res) => {
    try {
        const skills = await Skill.find({ status: 'Approved' })
            .populate('user', 'name flatNo profileImage')
            .sort({ createdAt: -1 });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add new skill
// @route   POST /api/skills
// @access  Private
const addSkill = async (req, res) => {
    try {
        const { title, description, category, hourlyRate, availability } = req.body;

        const skill = await Skill.create({
            user: req.user._id,
            title,
            description,
            category,
            hourlyRate,
            availability
        });

        res.status(201).json(skill);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get pending skills for Admin
// @route   GET /api/skills/admin/pending
// @access  Private (Admin)
const getPendingSkills = async (req, res) => {
    try {
        const skills = await Skill.find({ status: 'Pending' })
            .populate('user', 'name flatNo profileImage');
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve/Reject skill
// @route   PUT /api/skills/:id/status
// @access  Private (Admin)
const updateSkillStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'Approved' or 'Rejected'
        const skill = await Skill.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(skill);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getSkills,
    addSkill,
    getPendingSkills,
    updateSkillStatus
};
