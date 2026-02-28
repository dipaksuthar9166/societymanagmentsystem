const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getFacilities,
    createFacility,
    deleteFacility,
    getBookings,
    createBooking,
    updateBookingStatus
} = require('../controllers/facilityController');

// Facility Definition Routes (Clubhouse, Gym etc.)
router.route('/list')
    .get(protect, getFacilities)
    .post(protect, authorize('admin'), createFacility);

router.delete('/list/:id', protect, authorize('admin'), deleteFacility);

// Booking Routes
router.route('/')
    .get(protect, getBookings)
    .post(protect, createBooking);

router.patch('/:id/status', protect, authorize('admin'), updateBookingStatus);

module.exports = router;
