const Complaint = require('../models/Complaint');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get All Complaints (For Admin) OR My Complaints (For User)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
    try {
        if (!req.user.company) {
            return res.status(400).json({ message: 'User not assigned to a society' });
        }

        let query = { societyId: req.user.company };

        // If user is a tenant, restrict to their own complaints
        if (req.user.role === 'user') {
            query.raisedBy = req.user._id;
        }

        const complaints = await Complaint.find(query).populate('raisedBy', 'name email flatNo');
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Raise a new complaint
// @route   POST /api/complaints
// @access  Private (User/Tenant)
const createComplaint = async (req, res) => {
    const { title, description, category } = req.body;

    if (!req.user.company) {
        return res.status(400).json({ message: 'User not assigned to a society' });
    }

    try {
        const complaint = await Complaint.create({
            societyId: req.user.company,
            raisedBy: req.user._id,
            title,
            description,
            category
        });

        // ✅ LOG COMPLAINT CREATION
        await logActivity({
            userId: req.user._id,
            societyId: req.user.company,
            action: 'COMPLAINT_CREATED',
            category: 'INFO',
            description: `${req.user.name} created a new complaint: ${title}`,
            metadata: {
                complaintId: complaint._id,
                category: category,
                flatNo: req.user.flatNo
            },
            req
        });

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Complaint Status (For Admin)
// @route   PUT /api/complaints/:id
// @access  Private (Admin)
const updateComplaintStatus = async (req, res) => {
    const { status, adminComment } = req.body;
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Verify Admin belongs to same society
        if (complaint.societyId.toString() !== req.user.company.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        complaint.status = status || complaint.status;
        complaint.adminComment = adminComment || complaint.adminComment;
        if (req.body.workerDetails) {
            complaint.workerDetails = {
                ...req.body.workerDetails,
                assignedAt: new Date()
            };
        }

        await complaint.save();

        // ✅ LOG COMPLAINT STATUS UPDATE
        if (status) {
            await logActivity({
                userId: req.user._id,
                societyId: req.user.company,
                action: 'COMPLAINT_UPDATED',
                category: status === 'Resolved' ? 'SUCCESS' : 'INFO',
                description: `${req.user.name} ${status === 'Resolved' ? 'resolved' : 'updated'} a complaint`,
                metadata: {
                    complaintId: complaint._id,
                    newStatus: status
                },
                req
            });
        }

        res.json(complaint);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete Complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin)
const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Verify Admin belongs to same society
        if (complaint.societyId.toString() !== req.user.company.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await complaint.deleteOne();
        res.json({ message: 'Complaint removed' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getComplaints,
    createComplaint,
    updateComplaintStatus,
    deleteComplaint
};
