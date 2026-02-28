// Professional PDF Generation Function
const downloadInvoice = async (bill) => {
    try {
        const doc = new jsPDF();

        // Society & User Details
        const societyName = data?.user?.company?.name || "SOCIETY MANAGEMENT";
        const societyAddress = data?.user?.company?.address || "Address Not Available";
        const societyRegNo = data?.user?.company?.registrationNo || "REG/2024/001";
        const societyGSTIN = data?.user?.company?.gstin || "N/A";
        const societyContact = data?.user?.company?.contact || "N/A";
        const upiId = data?.user?.company?.upiId || "society@upi";

        const userName = data?.user?.name || "Resident";
        const userFlat = data?.user?.flatNo ? `${data?.user?.block || ''}-${data?.user?.flatNo}` : "N/A";
        const billingPeriod = new Date(bill.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });

        // Generate UPI QR Code
        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(societyName)}&am=${bill.totalAmount}&cu=INR`;
        const QRCode = (await import('qrcode')).default;
        const qrDataUrl = await QRCode.toDataURL(upiString);

        // Amount in Words (Indian Rupees)
        const toWords = (num) => {
            const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

            if ((num = num.toString()).length > 9) return 'Amount too large';
            const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n) return '';

            let str = '';
            str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' Crore ' : '';
            str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' Lakh ' : '';
            str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' Thousand ' : '';
            str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' Hundred ' : '';
            str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';

            return str ? 'Rupees ' + str + 'Only' : 'Zero Rupees';
        };

        // === HEADER ===
        doc.setFillColor(67, 56, 202);
        doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(societyName.toUpperCase(), 105, 15, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(societyAddress, 105, 22, { align: 'center' });
        doc.text(`Reg. No: ${societyRegNo} | GSTIN: ${societyGSTIN}`, 105, 28, { align: 'center' });
        doc.text(`Contact: ${societyContact}`, 105, 34, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('MAINTENANCE BILL', 105, 41, { align: 'center' });

        // QR Code
        doc.addImage(qrDataUrl, 'PNG', 170, 5, 30, 30);
        doc.setFontSize(7);
        doc.text('Scan to Pay', 185, 37, { align: 'center' });

        // === USER INFO ===
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Billed To:', 14, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(userName, 14, 61);
        doc.text(`Flat: ${userFlat}`, 14, 67);

        doc.setFont('helvetica', 'bold');
        doc.text('Invoice Details:', 120, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice No: ${bill._id.toUpperCase().slice(-8)}`, 120, 61);
        doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 120, 67);
        doc.text(`Period: ${billingPeriod}`, 120, 73);

        doc.setDrawColor(200, 200, 200);
        doc.line(14, 78, 196, 78);

        // === TABLE ===
        const tableData = bill.items.map((item, index) => [
            index + 1,
            item.name || 'Maintenance',
            '997212',
            '0%',
            `₹${item.price.toLocaleString()}`,
            item.quantity,
            `₹${(item.price * item.quantity).toLocaleString()}`
        ]);

        tableData.push([
            { content: 'TOTAL', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold', fillColor: [240, 240, 240] } },
            { content: `₹${bill.totalAmount.toLocaleString()}`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
        ]);

        doc.autoTable({
            startY: 82,
            head: [['S.No', 'Particulars', 'HSN/SAC', 'GST%', 'Rate', 'Qty', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [67, 56, 202], textColor: 255, fontStyle: 'bold', halign: 'center', fontSize: 9 },
            bodyStyles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { cellWidth: 60 },
                2: { halign: 'center', cellWidth: 25 },
                3: { halign: 'center', cellWidth: 20 },
                4: { halign: 'right', cellWidth: 25 },
                5: { halign: 'center', cellWidth: 15 },
                6: { halign: 'right', cellWidth: 30 }
            }
        });

        const finalY = doc.lastAutoTable.finalY + 8;

        // === AMOUNT IN WORDS ===
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Amount in Words:', 14, finalY);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text(toWords(bill.totalAmount), 14, finalY + 6);

        // === PAID WATERMARK ===
        if (bill.status === 'Paid') {
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.2 }));
            doc.setTextColor(34, 197, 94);
            doc.setFontSize(60);
            doc.setFont('helvetica', 'bold');
            doc.text('PAID', 105, 150, { align: 'center', angle: 45 });
            doc.restoreGraphicsState();

            doc.setDrawColor(34, 197, 94);
            doc.setLineWidth(2);
            doc.rect(14, finalY + 12, 60, 20);
            doc.setTextColor(34, 197, 94);
            doc.setFontSize(16);
            doc.text('✓ PAID', 44, finalY + 25, { align: 'center' });
        } else {
            doc.setTextColor(220, 38, 38);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('STATUS: UNPAID', 14, finalY + 20);
        }

        // === TERMS ===
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Terms & Conditions:', 14, finalY + 40);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('1. Payment due within 10 days.', 14, finalY + 46);
        doc.text('2. Late payment attracts penalty.', 14, finalY + 51);

        // === FOOTER ===
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text('Computer-generated invoice. No signature required.', 105, 280, { align: 'center' });

        doc.save(`Bill_${bill._id.slice(-6)}.pdf`);
        console.log('✅ PDF Downloaded');
    } catch (err) {
        console.error("❌ PDF Error:", err);
        alert(`PDF Error: ${err.message}`);
    }
};

export default downloadInvoice;
