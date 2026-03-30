const nodemailer = require('nodemailer');

// In-memory OTP storage
const otpStore = new Map();

// Email transporter
const createTransporter = () => {
    // Debug logging
    console.log('📧 Creating email transporter...');
    if (!nodemailer) {
        throw new Error('Nodemailer module not loaded!');
    }

    // Support both function names (v6 and v7/others)
    const transporterFn = nodemailer.createTransport || nodemailer.createTransporter;

    if (typeof transporterFn !== 'function') {
        console.error('❌ Nodemailer exports:', Object.keys(nodemailer));
        throw new Error('nodemailer.createTransport is not a function! Check installation.');
    }

    return transporterFn({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP with expiry (5 minutes)
 */
const storeOTP = (email, otp) => {
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(email, { otp, expiry });

    // Auto-cleanup after expiry
    setTimeout(() => {
        if (otpStore.get(email)?.otp === otp) {
            otpStore.delete(email);
        }
    }, 5 * 60 * 1000);
};

/**
 * Verify OTP
 */
const verifyOTP = (email, otp) => {
    const stored = otpStore.get(email);

    if (!stored) {
        return { valid: false, message: 'OTP expired or not found' };
    }

    if (Date.now() > stored.expiry) {
        otpStore.delete(email);
        return { valid: false, message: 'OTP expired' };
    }

    if (stored.otp !== otp) {
        return { valid: false, message: 'Invalid OTP' };
    }

    // OTP is valid - remove it
    otpStore.delete(email);
    return { valid: true, message: 'OTP verified successfully' };
}/**
 * Send OTP email and optional SMS
 */
const sendOTP = async (email, name, phone = null) => {
    try {
        const otp = generateOTP();
        storeOTP(email, otp);

        console.log(`[OTP] Sending code ${otp} to ${email}`);

        const promises = [];

        // 1. Prepare Email
        try {
            const transporter = createTransporter();
            const htmlTemplate = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial; padding: 20px;">
                <h2>Hello, ${name || 'Resident'}!</h2>
                <p>Your verification code for <b>STATUS Sharan</b> is:</p>
                <h1 style="color: #006D77; letter-spacing: 5px; background: #f0f9fa; padding: 10px; display: inline-block;">${otp}</h1>
                <p>Valid for 5 minutes.</p>
            </body>
            </html>`;

            const mailOptions = {
                from: `"STATUS Sharan" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '🔐 Your Verification Code - STATUS Sharan',
                html: htmlTemplate
            };
            
            promises.push(transporter.sendMail(mailOptions).then(() => {
                console.log(`✅ Email OTP sent to ${email}`);
                return { type: 'email', success: true };
            }).catch(err => {
                console.error(`❌ Email failed: ${err.message}`);
                return { type: 'email', success: false, error: err.message };
            }));
        } catch (e) { console.error("Email setup error", e.message); }

        // 2. Prepare SMS (Twilio)
        if (phone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            try {
                const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                
                // Smarter formatting
                let formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits
                if (formattedPhone.length === 10) {
                    formattedPhone = `+91${formattedPhone}`;
                } else if (!formattedPhone.startsWith('+') && formattedPhone.length > 10) {
                    formattedPhone = `+${formattedPhone}`;
                }
                
                if (!formattedPhone.startsWith('+')) formattedPhone = `+${formattedPhone}`;

                promises.push(twilioClient.messages.create({
                    body: `Your STATUS Sharan verification code is: ${otp}. Valid for 5 mins.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: formattedPhone
                }).then(() => {
                    console.log(`📱 SMS OTP sent to ${formattedPhone}`);
                    return { type: 'sms', success: true };
                }).catch(err => {
                    console.error(`❌ SMS failed: ${err.message}`);
                    return { type: 'sms', success: false, error: err.message };
                }));
            } catch (smsError) { console.error('SMS setup error:', smsError.message); }
        }

        // Wait for all (or at least some) to finish
        const results = await Promise.all(promises);
        const anySuccess = results.some(r => r.success);

        if (anySuccess) {
            return { success: true, results };
        } else {
            return { success: false, error: 'All delivery services (Email/SMS) failed.', details: results };
        }

    } catch (error) {
        console.error('❌ Critical OTP Error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateOTP,
    sendOTP,
    verifyOTP,
    storeOTP
};
