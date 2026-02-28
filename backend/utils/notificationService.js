const CommLog = require('../models/CommLog');
const User = require('../models/User');
const os = require('os');

// Helper to get local IP address for mobile compatibility in local networks
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const resolveLogoUrl = (url) => {
    if (!url) return 'https://cdn-icons-png.flaticon.com/512/270/270014.png';
    const localIP = getLocalIP();

    // Replace localhost or 127.0.0.1 with the actual local network IP so mobile devices can see it
    return url.replace('localhost', localIP).replace('127.0.0.1', localIP);
};

/**
 * Mocks sending a WhatsApp message and logs it to CommLog
 * @param {string} userId - ID of the recipient User
 * @param {string} societyId - ID of the Society/Company
 * @param {string} message - Content of the message
 */
const sendWhatsApp = async (userId, societyId, message) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found for notification');

        // CHECK PHONE NUMBER FORMAT (Checklist Item 1)
        if (!user.phoneNumber && !user.contactNumber) {
            console.warn(`[Notification Warning] User ${user.email} has no phone number.`);
            // Log failure
            await CommLog.create({
                societyId,
                tenantId: userId,
                type: 'WhatsApp',
                status: 'Failed',
                content: message,
                errorMessage: 'Phone number missing'
            });
            return;
        }

        const phone = user.phoneNumber || user.contactNumber;
        // In real app: Validate Country Code (+91). For mock, just checking existence.

        console.log(`\n--- WHATSAPP MOCK SEND ---`);
        console.log(`To: ${user.name} (${phone})`);
        console.log(`Message: ${message}`);
        console.log(`--------------------------\n`);

        // Log Success
        await CommLog.create({
            societyId,
            tenantId: userId,
            type: 'WhatsApp',
            status: 'Sent',
            content: message
        });

    } catch (error) {
        console.error('Notification Error:', error);
    }
};

const nodemailer = require('nodemailer');

// Setup Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Sends a real Email using Nodemailer and logs it to CommLog
 * @param {string} userId - ID of the recipient User
 * @param {string} societyId - ID of the Society/Company
 * @param {string} subject - Subject line
 * @param {string} message - Content/Body of the email
 * @param {object} options - Extra details (society, adminName, type, etc., attachments)
 */
const sendEmail = async (userId, societyId, subject, message, options = {}) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found for email notification');

        if (!user.email) {
            console.warn(`[Notification Warning] User ${user.name} has no email address.`);
            await CommLog.create({ societyId, tenantId: userId, type: 'Email', status: 'Failed', content: message, errorMessage: 'Email address missing' });
            return;
        }

        let htmlContent = `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4f46e5;">${subject}</h2>
                <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">This is an automated message from Society Management.</p>
            </div>
        `;

        if (options.type === 'LEGAL_NOTICE' && options.society) {
            const s = options.society;
            const issueDate = options.date ? new Date(options.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString();

            htmlContent = `
                <div style="max-width: 600px; margin: 0 auto; font-family: 'Times New Roman', serif; color: #1a1a1a; border: 1px solid #000; padding: 20px; line-height: 1.5; background-color: #ffffff;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
                        <tr>
                            <td align="center">
                                <img src="${resolveLogoUrl(s.logo)}" width="80" height="auto" style="display: block; margin-bottom: 10px; object-fit: contain;" />
                                <h1 style="margin: 0; font-size: 22px; text-transform: uppercase;">${s.name}</h1>
                                <p style="margin: 5px 0; font-size: 13px;">${s.address || 'Registered Society Address'}</p>
                                <p style="margin: 5px 0; font-size: 13px;">Contact: ${s.contactNumber || 'N/A'} | Email: ${s.email || 'N/A'}</p>
                                ${s.gstNumber ? `<p style="margin: 5px 0; font-size: 11px;">GSTIN: ${s.gstNumber}</p>` : ''}
                            </td>
                        </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                        <tr>
                            <td align="left" style="font-size: 14px;">
                                <strong>Ref No:</strong> ${options.noticeNumber || 'N/A'}<br/>
                                <strong>Date:</strong> ${issueDate}
                            </td>
                        </tr>
                    </table>

                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="text-decoration: underline; text-transform: uppercase; font-size: 18px; color: #b91c1c;">LEGAL NOTICE / FINAL DEMAND FOR PAYMENT</h2>
                    </div>

                    <div style="margin-bottom: 20px; font-size: 14px;">
                        <strong>TO,</strong><br/>
                        <strong>${user.name}</strong><br/>
                        Flat No: ${user.flatNo || 'N/A'}<br/>
                        ${s.name}<br/>
                        ${s.address || 'Society Premises'}
                    </div>

                    <div style="margin-bottom: 30px; text-align: justify; font-size: 15px; color: #222;">
                        <p style="white-space: pre-wrap;">${message}</p>
                    </div>

                    <div style="margin-top: 50px; font-size: 14px;">
                        <p>Sincerely,</p>
                        <div style="margin-top: 20px;">
                            <strong>(Authorized Signatory)</strong><br/>
                            ${options.adminName || 'Admin Manager'}<br/>
                            Management Committee,<br/>
                            ${s.name}
                        </div>
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 10px; color: #666; font-style: italic; text-align: center;">
                        This is a computer-generated legal document and does not require a physical signature for digital transmission.
                    </div>
                </div>
            `;
        }

        const mailOptions = {
            from: `"${options.society?.name || 'Society Management'}" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: subject,
            text: message,
            html: htmlContent,
            attachments: options.attachments || []
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`\n✅ EMAIL SENT: ${info.messageId} to ${user.email}`);

        await CommLog.create({
            societyId,
            tenantId: userId,
            type: 'Email',
            status: 'Sent',
            content: `Notice: ${options.noticeNumber} | Subject: ${subject}`
        });

    } catch (error) {
        console.error('❌ Email Error:', error);
        await CommLog.create({ societyId, tenantId: userId, type: 'Email', status: 'Failed', content: subject, errorMessage: error.message });
    }
};

module.exports = { sendWhatsApp, sendEmail };
