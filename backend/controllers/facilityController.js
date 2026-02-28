const Facility = require('../models/Facility');
const FacilityBooking = require('../models/FacilityBooking');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get all facilities for a society
// @route   GET /api/facilities/list
// @access  Private
const getFacilities = async (req, res) => {
    try {
        const societyId = req.user.company || req.query.societyId;
        const facilities = await Facility.find({ societyId, isActive: true });
        res.json(facilities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new facility
// @route   POST /api/facilities/list
// @access  Admin
const createFacility = async (req, res) => {
    try {
        const { name, description, chargePerSlot, slotDurationHours, capacity } = req.body;

        const facility = await Facility.create({
            societyId: req.user.company,
            name,
            description,
            chargePerSlot,
            slotDurationHours,
            capacity
        });

        res.status(201).json(facility);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete/Deactivate a facility
// @route   DELETE /api/facilities/list/:id
// @access  Admin
const deleteFacility = async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);
        if (!facility) return res.status(404).json({ message: 'Facility not found' });

        // Soft delete
        facility.isActive = false;
        await facility.save();
        res.json({ message: 'Facility Removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings
// @route   GET /api/facilities
// @access  Private
const getBookings = async (req, res) => {
    try {
        const filters = {};
        const societyId = req.user.company || req.query.societyId;
        if (societyId) filters.societyId = societyId;

        const bookings = await FacilityBooking.find(filters)
            .populate('bookedBy', 'name flatNo mobile')
            .populate('facilityId')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Booking
// @route   POST /api/facilities
// @access  Private
const createBooking = async (req, res) => {
    try {
        const { facilityId, facilityName, date, startTime, endTime, amount } = req.body;
        const societyId = req.user.company;

        // Slot Overlap Check
        const existingBooking = await FacilityBooking.findOne({
            facilityName,
            date,
            status: { $in: ['Approved'] },
            societyId,
            $or: [
                { startTime: { $lte: startTime }, endTime: { $gte: startTime } },
                { startTime: { $lte: endTime }, endTime: { $gte: endTime } }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Slot already booked' });
        }

        const booking = await FacilityBooking.create({
            facilityId,
            facilityName,
            date,
            startTime,
            endTime,
            bookedBy: req.user._id,
            societyId,
            amount,
            status: 'Requested'
        });

        // ✅ LOG FACILITY BOOKING
        await logActivity({
            userId: req.user._id,
            societyId: societyId,
            action: 'FACILITY_BOOKED',
            category: 'INFO',
            description: `${req.user.name} booked ${facilityName} for ${date}`,
            metadata: {
                bookingId: booking._id,
                facilityName,
                date,
                startTime,
                endTime,
                flatNo: req.user.flatNo
            },
            req
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update Booking Status
// @route   PATCH /api/facilities/:id/status
// @access  Admin
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await FacilityBooking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getFacilities,
    createFacility,
    deleteFacility,
    getBookings,
    createBooking,
    updateBookingStatus
};
