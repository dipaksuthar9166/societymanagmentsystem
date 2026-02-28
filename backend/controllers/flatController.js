const Flat = require('../models/Flat');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// @desc    Get all flats for the admin's society
// @route   GET /api/flats
// @access  Private (Admin)
const getFlats = async (req, res) => {
    try {
        if (!req.user.company) {
            return res.status(400).json({ message: 'User not assigned to a society' });
        }

        const flats = await Flat.find({ societyId: req.user.company })
            .populate('tenantId', 'name email role flatNo block'); // Populate tenant details for directory
        res.json(flats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new flat
// @route   POST /api/flats
// @access  Private (Admin)
const createFlat = async (req, res) => {
    const { flatNo, block, floor, rentAmount, status } = req.body;

    if (!req.user.company) {
        return res.status(400).json({ message: 'User not assigned to a society' });
    }

    try {
        const flat = await Flat.create({
            societyId: req.user.company,
            flatNo,
            block,
            floor,
            rentAmount,
            status: status || 'Vacant'
        });

        res.status(201).json(flat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a flat
// @route   DELETE /api/flats/:id
// @access  Private (Admin)
const deleteFlat = async (req, res) => {
    try {
        const flat = await Flat.findById(req.params.id);

        if (!flat) {
            return res.status(404).json({ message: 'Flat not found' });
        }

        if (flat.societyId.toString() !== req.user.company.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await flat.deleteOne();
        res.json({ message: 'Flat removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Auto-Generate Flats Structure
// @route   POST /api/flats/generate
// @access  Private (Admin)
const generateFlats = async (req, res) => {
    try {
        if (!req.user.company) {
            return res.status(400).json({ message: 'User not assigned to a society' });
        }

        const { blocks, floors, flatsPerFloor } = req.body;

        if (!blocks || !floors || !flatsPerFloor) {
            return res.status(400).json({ message: 'Please provide all structure details' });
        }

        const flatsToCreate = [];
        const blockNames = Array.from({ length: blocks }, (_, i) => String.fromCharCode(65 + i));

        blockNames.forEach(block => {
            for (let f = 1; f <= floors; f++) {
                for (let r = 1; r <= flatsPerFloor; r++) {
                    const flatNo = `${block}-${f}${r.toString().padStart(2, '0')}`; // A-101
                    flatsToCreate.push({
                        societyId: req.user.company,
                        flatNo: flatNo,
                        block: block,
                        floor: f,
                        rentAmount: 0,
                        status: 'Vacant'
                    });
                }
            }
        });

        if (flatsToCreate.length > 0) {
            await Flat.insertMany(flatsToCreate);
        }

        res.status(201).json({ message: `Successfully generated ${flatsToCreate.length} units`, count: flatsToCreate.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update flat details (Assign Tenant/Owner Check & Create User)
// @route   PUT /api/flats/:id
// @access  Private (Admin)
const updateFlat = async (req, res) => {
    try {
        const flat = await Flat.findById(req.params.id);
        if (!flat) {
            return res.status(404).json({ message: 'Flat not found' });
        }
        if (flat.societyId.toString() !== req.user.company.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const {
            flatNo, rentAmount, tenantId: rawTenantId, status,
            residencyType, maintenanceAmount, parkingSlot,
            shareCertificateNo, possessionDate,
            familyMembers, vehicleDetails,
            newUser,
            // New Fields
            ownerName, ownerEmail, ownerPhone,
            legalDetails,
            assets, floorPlan, renovationStatus, renovationDetails
        } = req.body;

        // RESOLVE TENANT ID: Accept Email or ObjectId
        let resolvedTenantId = rawTenantId;
        if (rawTenantId && typeof rawTenantId === 'string') {
            const isObjectId = mongoose.Types.ObjectId.isValid(rawTenantId);
            if (!isObjectId) {
                // Must be an Email
                const userByEmail = await User.findOne({ email: rawTenantId });
                if (!userByEmail) {
                    return res.status(404).json({ message: `User with email '${rawTenantId}' not found. Check spelling or Create New.` });
                }
                resolvedTenantId = userByEmail._id;
            }
        }

        // DOUBLE BOOKING CHECK
        if (flat.tenantId) {
            const isAssigningNew = (newUser) || (resolvedTenantId && resolvedTenantId.toString() !== flat.tenantId.toString());
            // Note: If updating rent of same tenant, resolvedTenantId equals flat.tenantId, so allowed.
            if (isAssigningNew) {
                return res.status(400).json({ message: 'Room is already occupied! Please "Vacate" it first before re-assigning.' });
            }
        }

        flat.flatNo = flatNo || flat.flatNo;

        if (residencyType === 'Owner') {
            flat.rentAmount = 0;
            flat.maintenanceAmount = maintenanceAmount || flat.maintenanceAmount || 0;
            flat.residencyType = 'Owner';
        } else {
            flat.rentAmount = rentAmount !== undefined ? rentAmount : flat.rentAmount;
            flat.residencyType = 'Rented';
        }

        if (parkingSlot !== undefined) flat.parkingSlot = parkingSlot;
        if (shareCertificateNo !== undefined) flat.shareCertificateNo = shareCertificateNo;
        if (possessionDate) flat.possessionDate = possessionDate;

        // --- NEW FIELDS UPDATE ---
        if (ownerName !== undefined) flat.ownerName = ownerName;
        if (ownerEmail !== undefined) flat.ownerEmail = ownerEmail;
        if (ownerPhone !== undefined) flat.ownerPhone = ownerPhone;
        if (legalDetails !== undefined) flat.legalDetails = legalDetails;
        if (assets !== undefined) flat.assets = assets;
        if (floorPlan !== undefined) flat.floorPlan = floorPlan;
        if (renovationStatus !== undefined) flat.renovationStatus = renovationStatus;
        if (renovationDetails !== undefined) flat.renovationDetails = renovationDetails;

        // -------------------------

        let finalTenantId = resolvedTenantId;

        // Create New User Logic
        if (newUser && newUser.email && newUser.password) {
            const userExists = await User.findOne({ email: newUser.email });
            if (userExists) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newUser.password, salt);

            const createdUser = await User.create({
                name: newUser.name,
                email: newUser.email,
                password: hashedPassword,
                role: 'user',
                company: req.user.company,
                status: 'active'
            });

            finalTenantId = createdUser._id;
        }

        if (finalTenantId !== undefined) {
            flat.tenantId = finalTenantId;

            if (finalTenantId) {
                const user = await User.findById(finalTenantId);
                if (user) {
                    user.isOwner = (residencyType === 'Owner');
                    if (familyMembers !== undefined) user.familyMembers = familyMembers;
                    if (vehicleDetails !== undefined) user.vehicleDetails = vehicleDetails;
                    if (!user.company) user.company = req.user.company;
                    await user.save();
                }
            }
        }

        if (status) flat.status = status;
        if (finalTenantId) flat.status = 'Occupied';
        else if (finalTenantId === null) flat.status = 'Vacant';

        await flat.save();
        res.json(flat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    De-Alloct Room & Deactivate User
// @route   PUT /api/flats/:id/deallot
// @access  Private (Admin)
const deallotFlat = async (req, res) => {
    try {
        const flat = await Flat.findById(req.params.id);
        if (!flat) return res.status(404).json({ message: 'Flat not found' });
        if (flat.societyId.toString() !== req.user.company.toString()) return res.status(401).json({ message: 'Not authorized' });

        const tenantId = flat.tenantId;

        const force = req.body.force === true;

        if (tenantId && !force) {
            const pendingInvoices = await Invoice.find({
                customerId: tenantId,
                status: 'Pending'
            });

            if (pendingInvoices.length > 0) {
                const totalDue = pendingInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
                return res.status(400).json({
                    code: 'PENDING_DUES',
                    message: `Cannot de-allot. User has ${pendingInvoices.length} pending invoices totaling ₹${totalDue}.`,
                    details: {
                        count: pendingInvoices.length,
                        amount: totalDue
                    }
                });
            }
        }

        if (tenantId) {
            try {
                await User.findByIdAndUpdate(tenantId, { status: 'inactive' });
            } catch (err) {
                console.error("User deactivation check warning:", err.message);
            }
        }

        flat.tenantId = null;
        flat.status = 'Vacant';
        flat.residencyType = 'Rented';
        flat.maintenanceAmount = 0;
        flat.parkingSlot = '';
        flat.shareCertificateNo = '';
        flat.possessionDate = null;

        await flat.save();

        res.json({ message: 'Room successfully de-allocated and user deactivated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error de-allocating room' });
    }
};

// @desc    Get current user's flat
// @route   GET /api/flats/my-unit
// @access  Private (User/Admin)
const getMyFlat = async (req, res) => {
    try {
        const flat = await Flat.findOne({ tenantId: req.user._id });
        if (!flat) return res.status(404).json({ message: 'No unit assigned' });
        res.json(flat);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getFlats,
    createFlat,
    deleteFlat,
    generateFlats,
    updateFlat,
    deallotFlat,
    getMyFlat
};
