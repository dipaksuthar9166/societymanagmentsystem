const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    addServiceLog
} = require('../controllers/assetController');

router.route('/')
    .get(protect, authorize('admin'), getAssets)
    .post(protect, authorize('admin'), createAsset);

router.route('/:id')
    .put(protect, authorize('admin'), updateAsset)
    .delete(protect, authorize('admin'), deleteAsset);

router.post('/:id/service', protect, authorize('admin'), addServiceLog);

module.exports = router;
