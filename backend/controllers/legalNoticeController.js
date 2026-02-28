const LegalNotice = require('../models/LegalNotice');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { sendEmail } = require('../utils/notificationService');
const { generateLegalNoticePDF } = require('../utils/pdfGenerator');

// Create a new legal notice
exports.createNotice = async (req, res) => {
    try {
        const { tenantId, invoiceId, content, subject } = req.body;
        const adminId = req.user.id;
        const societyId = req.user.company;

        const tenant = await User.findById(tenantId);
        if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

        const noticeNumber = `LN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const noticeData = {
            societyId,
            adminId,
            tenantId,
            noticeNumber,
            subject,
            content,
            status: 'Draft'
        };

        if (invoiceId && invoiceId !== '') {
            noticeData.invoiceId = invoiceId;
        }

        const notice = new LegalNotice(noticeData);

        await notice.save();
        res.status(201).json(notice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all notices for a society
exports.getNotices = async (req, res) => {
    try {
        const notices = await LegalNotice.find({ societyId: req.user.company })
            .populate('tenantId', 'name email flatNo')
            .sort({ createdAt: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send a notice via Email
exports.sendNotice = async (req, res) => {
    try {
        const notice = await LegalNotice.findById(req.params.id)
            .populate('tenantId')
            .populate('societyId')
            .populate('adminId', 'name');

        if (!notice) return res.status(404).json({ message: 'Notice not found' });

        // Generate PDF Buffer
        const pdfBuffer = await generateLegalNoticePDF({
            society: notice.societyId,
            tenant: notice.tenantId,
            noticeNumber: notice.noticeNumber,
            content: notice.content,
            adminName: notice.adminId.name,
            date: notice.createdAt
        });

        // Call notification service with professional formatting and PDF attachment
        await sendEmail(notice.tenantId._id, notice.societyId._id, notice.subject, notice.content, {
            type: 'LEGAL_NOTICE',
            society: notice.societyId,
            adminName: notice.adminId.name,
            noticeNumber: notice.noticeNumber,
            date: notice.createdAt,
            attachments: [
                {
                    filename: `Legal_Notice_${notice.noticeNumber}.pdf`,
                    content: pdfBuffer
                }
            ]
        });

        notice.status = 'Sent';
        notice.sentAt = new Date();
        notice.history.push({
            action: 'SENT_VIA_EMAIL',
            note: `Legal notice sent to ${notice.tenantId.email}`
        });

        await notice.save();
        res.json({ message: 'Legal notice sent successfully', notice });
    } catch (error) {
        console.error("Send Notice Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteNotice = async (req, res) => {
    try {
        await LegalNotice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Notice deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
