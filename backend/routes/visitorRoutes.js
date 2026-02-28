const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getVisitors,
    entryVisitor,
    exitVisitor,
    getBlacklist,
    addToBlacklist,
    removeFromBlacklist,
    preApproveVisitor
} = require('../controllers/visitorController');

router.route('/')
    .get(protect, getVisitors);

router.post('/pre-approve', protect, preApproveVisitor);
router.post('/entry', protect, entryVisitor);
router.patch('/:id/exit', protect, exitVisitor);

router.route('/blacklist')
    .get(protect, getBlacklist)
    .post(protect, authorize('admin'), addToBlacklist);

router.delete('/blacklist/:id', protect, authorize('admin'), removeFromBlacklist);

module.exports = router;
