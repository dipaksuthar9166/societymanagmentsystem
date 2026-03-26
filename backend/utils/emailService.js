const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, attachments = []) => {
    try {
        // Fallback or Env based configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return { success: true, info };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
};

const crypto = require('crypto');

const generateVerificationToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

const sendVerificationEmail = async (user, token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/verify-account/${token}`;
    const subject = 'Please verify your email address';
    const text = `Hi ${user.name},\n\nPlease click on the following link to verify your email address:\n${link}\n\nIf you did not request this, please ignore this email.`;
    return await sendEmail(user.email, subject, text);
};

const sendAccountActivatedEmail = async (user) => {
    const subject = 'Your account has been activated!';
    const text = `Hi ${user.name},\n\nYour account has been successfully verified and activated. You can now login.`;
    return await sendEmail(user.email, subject, text);
};

module.exports = { 
    sendEmail, 
    generateVerificationToken, 
    sendVerificationEmail, 
    sendAccountActivatedEmail 
};
