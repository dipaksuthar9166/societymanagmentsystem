const Notice = require('../models/Notice');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get All Notices for My Society
// @route   GET /api/notices
// @access  Private
const getNotices = async (req, res) => {
    try {
        if (!req.user.company) {
            return res.status(400).json({ message: 'User not assigned to a society' });
        }

        const notices = await Notice.find({ societyId: req.user.company, isActive: true }).sort({ createdAt: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new Notice
// @route   POST /api/notices
// @access  Private (Admin)
const createNotice = async (req, res) => {
    const { title, content } = req.body;

    if (!req.user.company) {
        return res.status(400).json({ message: 'User not assigned to a society' });
    }

    try {
        const notice = await Notice.create({
            societyId: req.user.company,
            title,
            content,
            postedBy: req.user._id
        });

        // ✅ LOG NOTICE PUBLICATION
        await logActivity({
            userId: req.user._id,
            societyId: req.user.company,
            action: 'NOTICE_PUBLISHED',
            category: 'INFO',
            description: `${req.user.name} published a new notice: ${title}`,
            metadata: {
                noticeId: notice._id,
                title: title
            },
            req
        });

        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete Notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin)
const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        // Verify Admin belongs to same society
        if (notice.societyId.toString() !== req.user.company.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await notice.deleteOne();
        res.json({ message: 'Notice removed' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getNotices,
    createNotice,
    deleteNotice
};
