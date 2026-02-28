const ParkingSlot = require('../models/ParkingSlot');
const ParkingBooking = require('../models/ParkingBooking');

// @desc    Get all parking slots
// @route   GET /api/parking/slots
// @access  Private
const Company = require('../models/Company');

// @desc    Get all parking slots
// @route   GET /api/parking/slots
// @access  Private
const getSlots = async (req, res) => {
    try {
        const societyId = req.user.company;
        if (!societyId) {
            return res.status(400).json({ message: "User not associated with a society" });
        }

        let slots = await ParkingSlot.find({ society: societyId });

        // Seed slots if empty for demo
        if (slots.length === 0) {
            // Fetch society to get a prefix
            const company = await Company.findById(societyId);
            const prefix = company ? company.name.substring(0, 3).toUpperCase().replace(/\s/g, '') : 'SOC';

            const demoSlots = [];
            for (let i = 1; i <= 5; i++) {
                demoSlots.push({
                    slotNumber: `${prefix}-EV-${i}`,
                    type: 'EV',
                    hourlyRate: 100,
                    society: societyId
                });
            }
            for (let i = 1; i <= 10; i++) {
                demoSlots.push({
                    slotNumber: `${prefix}-V-${i}`,
                    type: 'Visitor',
                    hourlyRate: 50,
                    society: societyId
                });
            }

            try {
                slots = await ParkingSlot.insertMany(demoSlots);
            } catch (seedError) {
                console.error("Seeding Error (duplicate key most likely):", seedError.message);
                // Return empty if seeding fails due to index conflicts, user can add manually later
                return res.json([]);
            }
        }
        res.json(slots);
    } catch (error) {
        console.error("Get Slots Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Book a slot
// @route   POST /api/parking/book
// @access  Private
const bookSlot = async (req, res) => {
    try {
        const { slotId, vehicleNumber, startTime, endTime } = req.body;

        // Calculate cost
        const slot = await ParkingSlot.findById(slotId);
        const start = new Date(startTime);
        const end = new Date(endTime);
        const hours = Math.ceil((end - start) / (1000 * 60 * 60));
        const totalCost = hours * slot.hourlyRate;

        const booking = await ParkingBooking.create({
            user: req.user._id,
            slot: slotId,
            vehicleNumber,
            startTime,
            endTime,
            totalCost
        });

        // Mark slot as occupied (simple logic for now)
        // ideally checking overlap is better
        await ParkingSlot.findByIdAndUpdate(slotId, { isOccupied: true, currentBooking: booking._id });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle slot status (Guard/Admin)
// @route   PUT /api/features/parking/slots/:id/toggle
const toggleSlotStatus = async (req, res) => {
    try {
        const slot = await ParkingSlot.findById(req.params.id);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        slot.isOccupied = !slot.isOccupied;
        await slot.save();
        res.json(slot);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get my bookings
// @route   GET /api/features/parking/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
    try {
        const bookings = await ParkingBooking.find({ user: req.user._id }).populate('slot');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getSlots,
    bookSlot,
    getMyBookings,
    toggleSlotStatus
};
