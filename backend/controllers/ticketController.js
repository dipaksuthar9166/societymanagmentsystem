const Ticket = require('../models/Ticket');
const User = require('../models/User');

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private (Admin)
const createTicket = async (req, res) => {
    try {
        const { subject, description, priority } = req.body;

        const ticket = await Ticket.create({
            societyId: req.user.company,
            raisedBy: req.user._id,
            subject,
            description,
            priority
        });

        res.status(201).json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all tickets (Super Admin sees all, Society Admin sees theirs)
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
    try {
        let query = {};

        if (req.user.role !== 'superadmin') {
            query.societyId = req.user.company;
        }

        const tickets = await Ticket.find(query)
            .populate('societyId', 'name')
            .populate('raisedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update ticket status or add response
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = async (req, res) => {
    try {
        const { status, response } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (status) {
            ticket.status = status;
        }

        if (response) {
            ticket.responses.push({
                sender: req.user._id,
                message: response
            });
        }

        await ticket.save();

        const updatedTicket = await Ticket.findById(req.params.id)
            .populate('societyId', 'name')
            .populate('raisedBy', 'name')
            .populate('responses.sender', 'name role');

        res.json(updatedTicket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createTicket,
    getTickets,
    updateTicket
};
