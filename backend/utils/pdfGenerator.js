const PDFDocument = require('pdfkit');
const axios = require('axios');
const os = require('os');

// Helper to get local IP address
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

/**
 * Generates a Legal Notice PDF
 * @param {object} data - { society, tenant, noticeNumber, content, adminName, date }
 * @returns {Promise<Buffer>}
 */
const generateLegalNoticePDF = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                let pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            const { society, tenant, noticeNumber, content, adminName, date } = data;
            const issueDate = date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString();

            // Border
            doc.rect(20, 20, 555, 782).stroke();

            // Header Section
            let headerY = 40;
            try {
                if (society.logo) {
                    // For backend fetching its own assets, localhost is safest
                    const logoUrl = society.logo.includes('localhost') || society.logo.includes('127.0.0.1') ?
                        society.logo :
                        society.logo.replace(getLocalIP(), 'localhost');

                    const response = await axios.get(logoUrl, { responseType: 'arraybuffer', timeout: 5000 });
                    doc.image(response.data, 260, headerY, { width: 70 });
                    headerY += 80;
                }
            } catch (err) {
                console.warn("PDF Logo Fetch Error:", err.message);
                headerY += 20;
            }

            doc.fontSize(22).font('Helvetica-Bold').text(society.name.toUpperCase(), { align: 'center' });
            doc.fontSize(10).font('Helvetica').text(society.address || 'Registered Society Address', { align: 'center' });
            doc.fontSize(10).text(`Contact: ${society.contactNumber || 'N/A'} | Email: ${society.email || 'N/A'}`, { align: 'center' });

            doc.moveDown(1);
            doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
            doc.moveDown(2);

            // Ref & Date
            doc.fontSize(11).font('Helvetica-Bold').text(`Ref No: `, 50, doc.y, { continued: true }).font('Helvetica').text(noticeNumber);
            doc.font('Helvetica-Bold').text(`Date: `, 400, doc.y, { continued: true }).font('Helvetica').text(issueDate);

            // Title
            doc.moveDown(3);
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#B91C1C').text('LEGAL NOTICE / FINAL DEMAND FOR PAYMENT', 50, doc.y, {
                align: 'center',
                underline: true
            });
            doc.fillColor('black');

            // To section
            doc.moveDown(2);
            doc.fontSize(12).font('Helvetica-Bold').text('TO,', 50);
            doc.text(tenant.name);
            doc.font('Helvetica').text(`Flat No: ${tenant.flatNo || 'N/A'}`);
            doc.text(society.name);
            doc.text(society.address || 'Society Premises');

            // Content
            doc.moveDown(2);
            doc.fontSize(12).font('Helvetica').text(content, {
                align: 'justify',
                lineGap: 4
            });

            // Footer / Signatory
            doc.moveDown(3);
            doc.fontSize(12).font('Helvetica').text('Sincerely,');
            doc.moveDown(1);
            doc.font('Helvetica-Bold').text('(Authorized Signatory)');
            doc.font('Helvetica').text(adminName || 'Admin Manager');
            doc.text('Management Committee,');
            doc.text(society.name);

            // Digital Stamp Note
            doc.moveDown(4);
            doc.fontSize(8).font('Helvetica-Oblique').fillColor('#666666').text(
                'This is a computer-generated legal document and does not require a physical signature for digital transmission.',
                { align: 'center' }
            );

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateLegalNoticePDF };
