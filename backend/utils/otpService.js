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
};

/**
 * Send OTP email and optional SMS
 */
const sendOTP = async (email, name, phone = null) => {
    try {
        const transporter = createTransporter();
        const otp = generateOTP();

        // Store OTP
        storeOTP(email, otp);

        let smsSent = false;
        
        // Optionally send via Twilio if phone number is provided
        if (phone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            try {
                const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                
                // Format phone number (ensure + prefix)
                let formattedPhone = phone;
                if (!phone.startsWith('+')) {
                    formattedPhone = `+91${phone}`; // Default to India code if no + is provided
                }

                await twilioClient.messages.create({
                    body: `Your STATUS Sharan verification code is: ${otp}. It is valid for 5 minutes.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: formattedPhone
                });
                console.log(`📱 SMS OTP sent to ${formattedPhone}: ${otp}`);
                smsSent = true;
            } catch (smsError) {
                console.error('❌ Error sending SMS OTP:', smsError.message);
                // Continue to email fallback
            }
        }

        const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Code - Status Sharan</title>
            <style>
                @media only screen and (max-width: 600px) {
                    .container {
                        width: 100% !important;
                        border-radius: 0 !important;
                        border: none !important;
                        margin: 0 !important;
                    }
                    .content-padding {
                        padding: 20px !important;
                    }
                    .header-padding {
                        padding: 20px 10px !important;
                    }
                    .logo-text {
                        font-size: 24px !important;
                    }
                    .otp-box {
                        font-size: 28px !important;
                        letter-spacing: 4px !important;
                        padding: 15px 20px !important;
                        width: 80% !important;
                    }
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <!-- Main Container -->
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #eee; border-radius: 8px; overflow: hidden;" class="container">
                            
                            <!-- Header with Branding -->
                            <tr>
                                <td align="center" style="background-color: #f9f9f9; padding: 30px; border-bottom: 3px solid #006D77;" class="header-padding">
                                    <h1 class="logo-text" style="color: #006D77; margin: 0; font-size: 28px; letter-spacing: 1px; font-family: Arial, sans-serif; font-weight: bold;">STATUS <span style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: normal; color: #333;">Sharan</span></h1>
                                    <p style="font-size: 13px; color: #666; margin: 5px 0 0; text-transform: uppercase; letter-spacing: 2px;">Where dreams find solace</p>
                                </td>
                            </tr>

                            <!-- Main Content -->
                            <tr>
                                <td align="center" style="padding: 40px 30px;" class="content-padding">
                                    <h2 style="color: #333; margin-top: 0; font-size: 22px;">Hello, ${name || 'Resident'}!</h2>
                                    <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
                                        Use the verification code below to login to your account.<br>
                                        This code is valid for the next <strong>10 minutes</strong>.
                                    </p>
                                    
                                    <!-- OTP Box -->
                                    <div class="otp-box" style="
                                        font-size: 36px; 
                                        font-weight: bold; 
                                        letter-spacing: 8px; 
                                        color: #006D77; 
                                        background-color: #e6f2f3; 
                                        padding: 24px 40px; 
                                        border-radius: 12px;
                                        display: inline-block;
                                        margin-bottom: 30px;
                                        border: 2px dashed #006D77;
                                        font-family: 'Courier New', monospace;
                                    ">
                                        ${otp}
                                    </div>

                                    <p style="font-size: 14px; color: #888; margin-top: 0;">
                                        If you didn't request this code, please ignore this email.
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center" style="background-color: #006D77; color: white; padding: 20px; font-size: 12px;">
                                    <p style="margin: 0;">&copy; 2026 Status Sharan Residents Portal | Ahmedabad</p>
                                    <p style="margin: 10px 0 0; opacity: 0.8;">Secure Automated Notification System</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        const mailOptions = {
            from: `"STATUS Sharan" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 Your Verification Code - STATUS Sharan',
            html: htmlTemplate
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email OTP sent to ${email}: ${otp}`);

        return { success: true, message: smsSent ? 'OTP sent via SMS and Email' : 'OTP sent via Email' };

    } catch (error) {
        console.error('❌ Error sending OTP:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateOTP,
    sendOTP,
    verifyOTP,
    storeOTP
};
