const express = require('express');
const router = express.Router();
const { getFlats, createFlat, deleteFlat, updateFlat, generateFlats, getMyFlat, deallotFlat } = require('../controllers/flatController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getFlats) // Allow all users to view flats for directory
    .post(protect, authorize('admin'), createFlat);

// Specific routes MUST come before parameterized routes (/:id) if they conflict (like /generate vs /:id)
router.post('/generate', protect, authorize('admin'), generateFlats);
router.get('/my-unit', protect, getMyFlat);

// De-allotment route
router.put('/:id/deallot', protect, authorize('admin'), deallotFlat);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteFlat)
    .put(protect, authorize('admin'), updateFlat);

module.exports = router;
