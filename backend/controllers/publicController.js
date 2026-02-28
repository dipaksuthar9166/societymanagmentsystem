const Inquiry = require('../models/Inquiry');
const Testimonial = require('../models/Testimonial');
const Company = require('../models/Company');

// Submit Inquiry from Landing Page
exports.submitInquiry = async (req, res) => {
    try {
        const { name, email, phone, societyName, message } = req.body;

        const newInquiry = new Inquiry({
            name,
            email,
            phone,
            societyName,
            message
        });

        await newInquiry.save();

        // Note: Real email sending logic would go here using Nodemailer
        // For now, we are saving to database successfully.

        res.status(201).json({
            success: true,
            message: "Inquiry submitted successfully. We will contact you soon."
        });
    } catch (error) {
        console.error("Inquiry Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit inquiry. Please try again later."
        });
    }
};

// Get Public Stats for Landing Page
exports.getPublicStats = async (req, res) => {
    try {
        const totalSocieties = await Company.countDocuments();
        const totalResidents = 12000 + (totalSocieties * 50); // Mock dynamic mapping

        res.status(200).json({
            societies: totalSocieties || 250,
            residents: totalResidents,
            revenue: 500000,
            uptime: 99.9
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Testimonials (Public)
exports.getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find().limit(5);
        res.status(200).json(testimonials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
