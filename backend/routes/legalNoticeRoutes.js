const express = require('express');
const router = express.Router();
const controller = require('../controllers/legalNoticeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'committee_member'));

router.post('/', controller.createNotice);
router.get('/', controller.getNotices);
router.post('/:id/send', controller.sendNotice);
router.delete('/:id', controller.deleteNotice);

module.exports = router;
