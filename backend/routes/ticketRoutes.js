const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createTicket, getTickets, updateTicket } = require('../controllers/ticketController');

router.route('/')
    .get(protect, getTickets)
    .post(protect, createTicket);

router.route('/:id')
    .put(protect, updateTicket);

module.exports = router;
