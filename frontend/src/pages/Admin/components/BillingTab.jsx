import React, { useState, useEffect } from 'react';
import { Receipt, Search, Keyboard, Eye, Download, CheckCircle, AlertCircle, FileText, Send, Plus, Trash2, Calendar, User, Building2 } from 'lucide-react';
import { API_BASE_URL, resolveImageURL } from '../../../config';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';

const BillingTab = ({ invoices, tenants, refresh, token, societyDetails }) => {
    const [loading, setLoading] = useState(false);

    // Form State
    const [mode, setMode] = useState('manual'); // 'manual' | 'bulk'
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [arrears, setArrears] = useState(0);
    const [billingPeriod, setBillingPeriod] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('1. Cheque should be drawn in favour of society only.\n2. Interest @ 18% p.a. will be charged for delayed payments.');
    const [billItems, setBillItems] = useState([
        { name: 'Monthly Maintenance', price: 2500, quantity: 1 }
    ]);

    const loadStandardTemplate = () => {
        setBillItems([
            { name: 'Municipal Dues', price: 500, quantity: 1 },
            { name: 'Sinking Fund', price: 200, quantity: 1 },
            { name: 'Maintenance Charges', price: 1500, quantity: 1 },
            { name: 'Parking Charges', price: 300, quantity: 1 },
            { name: 'Water Charges', price: 100, quantity: 1 },
            { name: 'Non-Occupancy Charges', price: 0, quantity: 1 }
        ]);
        setNotes('1. Cheque should be drawn in favour of society only.\n2. Interest @ 18% p.a. will be charged for delayed payments.\n3. Please pay before due date to avoid service disruption.');
    };

    // --- Effects ---

    // When Tenant is selected, calculate Arrears from existing loaded invoices
    useEffect(() => {
        if (mode === 'manual' && selectedTenantId) {
            const tenant = tenants.find(t => t._id === selectedTenantId);
            setSelectedTenant(tenant);

            // Mock Arrears Calculation (Frontend Preview)
            const pending = invoices.filter(inv =>
                inv.customerId === selectedTenantId &&
                (inv.status === 'Pending' || inv.status === 'Overdue')
            );
            const totalArrears = pending.reduce((sum, inv) => sum + inv.totalAmount, 0);
            setArrears(totalArrears);
        } else {
            setSelectedTenant(null);
            setArrears(0);
        }
    }, [selectedTenantId, invoices, tenants, mode]);

    // --- Handlers ---

    const handleAddItem = () => {
        setBillItems([...billItems, { name: '', price: 0, quantity: 1 }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...billItems];
        newItems.splice(index, 1);
        setBillItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...billItems];
        newItems[index][field] = value;
        setBillItems(newItems);
    };

    const calculateCurrentTotal = () => {
        return billItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
    };

    const handleGenerateInvoice = async () => {
        if (billItems.length === 0) return alert("Please add at least one bill item.");

        let endpoint = '/invoices';
        let body = {};

        if (mode === 'manual') {
            if (!selectedTenantId) return alert("Please select a user/owner first.");
            const subtotal = calculateCurrentTotal();
            const gst = subtotal * 0.18;
            const totalWithGST = subtotal + gst + arrears;
            if (!confirm(`Generate Bill for ${selectedTenant.name}?\n\nSubtotal: ₹${subtotal.toLocaleString()}\nGST (18%): ₹${gst.toLocaleString()}\nArrears: ₹${arrears.toLocaleString()}\n\nTotal Payable: ₹${totalWithGST.toLocaleString()}`)) return;

            body = {
                customerId: selectedTenantId,
                type: 'Maintenance',
                items: billItems,
                billingPeriod,
                dueDate,
                notes
            };
        } else {
            if (!confirm(`⚠️ BULK ACTION\nGenerate bills for ALL residents in the society?\n\nThis will create invoices for everyone based on the template.`)) return;
            endpoint = '/invoices/bulk';
            body = {
                items: billItems,
                billingPeriod,
                dueDate,
                type: 'Maintenance',
                notes
            };
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (res.ok) {
                if (mode === 'bulk') {
                    alert(`Bulk Generation Complete!\nSuccess: ${data.message}`);
                } else {
                    alert(`Invoice Generated Successfully!\nTotal Amount: ₹${data.totalAmount}`);
                }
                // Reset Form
                refresh();
                setBillItems([{ name: 'Monthly Maintenance', price: 2500, quantity: 1 }]);
                setSelectedTenantId('');
            } else {
                alert(data.message || 'Generation Failed');
            }
        } catch (error) {
            console.error(error);
            alert("Network Error");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (invoiceId) => {
        if (!confirm('Mark this invoice as PAID (Cash Recieved)?\nUser will be notified.')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/pay`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Invoice Marked as Paid!');
                refresh();
            } else {
                alert('Action Failed');
            }
        } catch (error) {
            console.error(error);
            alert('Network Error');
        }
    };

    // --- PDF Logic (Updated) ---
    const downloadInvoice = async (bill) => {
        // ... (Same as before)
        try {
            const doc = new jsPDF();
            const resident = tenants.find(t => t._id === bill.customerId) || { name: bill.customerName };

            const societyName = societyDetails?.name || "Society Management";

            // Header
            doc.setFillColor(67, 56, 202); // Indigo-700
            doc.rect(0, 0, 210, 45, 'F');

            // Add Logo if available (Try-Catch for CORS/Format safety)
            let textX = 14;
            if (societyDetails?.logo) {
                try {
                    doc.addImage(societyDetails.logo, 'PNG', 14, 10, 25, 25);
                    textX = 45; // Move text to the right
                } catch (err) {
                    console.warn("PDF Logo Error", err);
                }
            }

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text(societyName, textX, 25);
            doc.setFontSize(10);
            doc.text("Official Maintenance Invoice", textX, 35);

            // Bill To
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.text("BILLED TO:", 14, 60);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(resident.name || "Resident", 14, 66);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`Flat: ${resident.flatNo || 'N/A'}`, 14, 72);
            doc.text(`Contact: ${resident.mobile || 'N/A'}`, 14, 77);

            // Invoice Info
            doc.text(`Invoice No: #${bill._id.slice(-6).toUpperCase()}`, 140, 60);
            doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 140, 66);
            const periodStr = bill.billingPeriod?.from ? `${new Date(bill.billingPeriod.from).toLocaleDateString()} to ${new Date(bill.billingPeriod.to).toLocaleDateString()}` : 'N/A';
            doc.text(`Period: ${periodStr}`, 140, 72);
            doc.setTextColor(220, 38, 38); // Red for Due Date
            doc.text(`Due Date: ${bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'Immediate'}`, 140, 78);

            // Items
            const tableColumn = ["Description", "Qty", "Price", "Amount"];
            const tableRows = bill.items.map(item => [
                item.name,
                item.quantity,
                `Rs. ${item.price.toLocaleString()}`,
                `Rs. ${(item.price * item.quantity).toLocaleString()}`
            ]);

            // Add Arrears Row if exists
            if (bill.oldArrears > 0) {
                tableRows.push(["Previous Arrears (Carry Forward)", "-", "-", `Rs. ${bill.oldArrears.toLocaleString()}`]);
            }

            doc.autoTable({
                startY: 90,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [67, 56, 202], textColor: 255 },
                foot: [['', '', 'TOTAL PAYABLE', `Rs. ${bill.totalAmount.toLocaleString()}`]],
                footStyles: { fillColor: [243, 244, 246], textColor: 0, fontStyle: 'bold' }
            });

            const finalY = doc.lastAutoTable.finalY + 20;

            // Watermark if Paid
            if (bill.status === 'Paid') {
                doc.setTextColor(22, 163, 74);
                doc.setFontSize(40);
                doc.setFont("helvetica", "bold");
                doc.saveGraphicsState();
                doc.setGState(new doc.GState({ opacity: 0.2 }));
                doc.text("PAID SUCCESSFULLY", 40, 150, { angle: 45 });
                doc.restoreGraphicsState();
            }

            // QR Code
            try {
                const upiString = `upi://pay?pa=society@upi&pn=${encodeURIComponent(societyName)}&am=${bill.totalAmount}&cu=INR`;
                const qrDataUrl = await QRCode.toDataURL(upiString);
                doc.addImage(qrDataUrl, 'PNG', 160, finalY - 10, 30, 30);
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.text("Scan to Pay", 165, finalY + 25);
            } catch (e) { console.warn("QR Fail"); }

            doc.save(`Invoice_${bill._id.slice(-6)}.pdf`);

        } catch (error) {
            console.error("PDF Error", error);
            alert("Failed to generate PDF");
        }
    };


    return (
        <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-20 font-sans text-slate-800">

            {/* --- UTILITY BILL CONTAINER --- */}
            <div className="bg-white shadow-2xl overflow-hidden min-h-[800px] border border-slate-300 relative rounded-lg">

                {/* 1. TOP HEADER (Logo & Account Info) */}
                <div className="flex flex-col md:flex-row justify-between p-8 pb-4">
                    {/* Brand / Logo Section */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4 text-[#005496]">
                            {societyDetails?.logo ? (
                                <img src={resolveImageURL(societyDetails.logo)} alt="Society Logo" className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-white" />
                            ) : (
                                <Building2 size={42} weight="fill" />
                            )}
                            <div className="leading-tight">
                                <h1 className="text-3xl font-black tracking-tighter">{societyDetails?.name || 'Society Manager'}</h1>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Electric & Maintenance Utilities</p>
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-semibold text-slate-500 max-w-[200px]">
                            <p>Reg No: {societyDetails?.regNo || '12345678'}</p>
                            <p>Address: {societyDetails?.address || 'Mumbai, India'}</p>
                            <p className="text-[#005496] underline">help.societymanager.com</p>
                        </div>
                    </div>

                    {/* Account & Due Date Box (The Orange/White Box) */}
                    <div className="flex flex-col w-full md:w-auto mt-6 md:mt-0">
                        {/* Selector for Manual/Bulk */}
                        <div className="flex justify-end gap-1 mb-4 print:hidden">
                            <button onClick={() => setMode('manual')} className={`px-4 py-1 text-[10px] font-bold uppercase tracking-wider border ${mode === 'manual' ? 'bg-[#005496] text-white border-[#005496]' : 'text-slate-400 border-slate-200'}`}>Single Bill</button>
                            <button onClick={() => setMode('bulk')} className={`px-4 py-1 text-[10px] font-bold uppercase tracking-wider border ${mode === 'bulk' ? 'bg-amber-500 text-white border-amber-500' : 'text-slate-400 border-slate-200'}`}>Bulk Gen</button>
                        </div>

                        {/* The Box */}
                        <div className="border-2 border-[#005496] flex">
                            <div className="px-6 py-3 border-r-2 border-[#005496] text-center min-w-[120px]">
                                <p className="text-sm font-bold text-[#005496] uppercase mb-1">Due Date</p>
                                <input
                                    type="date"
                                    className="w-full text-center font-black text-xl text-slate-800 outline-none bg-transparent p-0 cursor-pointer"
                                    value={dueDate || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                            <div className="px-8 py-3 bg-[#e85f0c] text-white text-center min-w-[140px] flex flex-col justify-center">
                                <p className="text-xs font-bold uppercase mb-1 opacity-90">Amount Due</p>
                                <p className="text-2xl font-black">₹{((calculateCurrentTotal() * 1.18) + (mode === 'manual' ? arrears : 0)).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. BLUE SEPARATOR BAR ("We Deliver") */}
                <div className="bg-[#005496] text-white px-8 py-2 flex justify-between items-center">
                    <p className="font-bold italic text-lg tracking-wide">We deliver <span className="font-light opacity-80">comfort & community.</span></p>
                    <p className="text-xs font-medium opacity-70">Account: {mode === 'manual' && selectedTenant ? selectedTenant._id.slice(-8).toUpperCase() : 'BULK-GENERATION'}</p>
                </div>

                {/* 3. MAIN CONTENT GRID (3 Columns: ServiceTo, Charge Details, Visualization) */}
                <div className="grid lg:grid-cols-12 gap-8 p-8">

                    {/* LEFT COL: Service To & Inputs (Spans 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-8">

                        {/* Service To Section */}
                        <div className="bg-[#003366] text-white p-5 shadow-lg relative overflow-hidden">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70 border-b border-white/20 pb-2">Service To:</h3>

                            {mode === 'manual' ? (
                                <div className="relative z-10">
                                    <select
                                        className="w-full bg-white/10 border border-white/20 text-white font-bold p-2 text-sm outline-none focus:bg-white/20 transition-colors cursor-pointer mb-2"
                                        value={selectedTenantId}
                                        onChange={(e) => setSelectedTenantId(e.target.value)}
                                    >
                                        <option value="" className="text-slate-800">Select Resident...</option>
                                        {tenants.map(t => (
                                            <option key={t._id} value={t._id} className="text-slate-800">{t.name} (Flat {t.flatNo})</option>
                                        ))}
                                    </select>
                                    {selectedTenant && (
                                        <div className="text-sm space-y-1 pl-1 opacity-90">
                                            <p>{selectedTenant.name}</p>
                                            <p>Flat {selectedTenant.flatNo}, Tower A</p>
                                            <p>{selectedTenant.mobile}</p>
                                            <p className="text-xs opacity-50 mt-2">Bill Period: {new Date(billingPeriod.from).toLocaleDateString()} - {new Date(billingPeriod.to).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Building2 size={40} className="mx-auto mb-2 opacity-50" />
                                    <p className="font-bold">ALL RESIDENTS</p>
                                    <p className="text-xs opacity-60">Bulk generation mode active</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleGenerateInvoice}
                                disabled={loading || (mode === 'manual' && !selectedTenantId)}
                                className="w-full bg-[#e85f0c] hover:bg-[#d65205] text-white py-4 font-black text-lg uppercase tracking-wide shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : (
                                    <>Generate Bill <Send size={18} /></>
                                )}
                            </button>
                            <button onClick={loadStandardTemplate} className="w-full py-2 text-xs font-bold text-[#005496] border border-[#005496] hover:bg-[#005496] hover:text-white transition-colors uppercase">
                                Load Standard Template
                            </button>
                        </div>
                    </div>

                    {/* MIDDLE COL: Bill Details / Line Items (Spans 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="flex justify-between items-end border-b-4 border-[#005496] pb-2">
                            <h2 className="text-xl font-black text-[#005496] uppercase">Current Charges</h2>
                            <p className="text-sm font-bold text-slate-500">Bill Details</p>
                        </div>

                        <div className="space-y-4">
                            {billItems.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 border-l-4 border-slate-300 hover:border-[#005496] transition-colors p-3 pr-4 group">
                                    <div className="flex justify-between items-center mb-2">
                                        <input
                                            className="bg-transparent font-bold text-slate-700 text-sm outline-none w-full placeholder:text-slate-400"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                            placeholder="Charge Description"
                                        />
                                        <button onClick={() => handleRemoveItem(idx)} className="text-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase text-slate-400">Rate:</span>
                                            <input
                                                type="number"
                                                className="bg-slate-200 p-1 w-20 text-xs font-bold text-slate-700 outline-none text-right"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                                            />
                                        </div>
                                        <p className="font-mono font-bold text-[#005496]">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                            <button onClick={handleAddItem} className="text-xs font-bold text-[#005496] flex items-center gap-1 hover:underline mt-2">
                                <Plus size={12} /> Add another line item
                            </button>
                        </div>

                        {/* Subtotals */}
                        <div className="bg-[#f0f4f8] p-4 mt-auto border-t-2 border-[#005496]">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500 font-medium">Supply Total (Subtotal)</span>
                                <span className="font-bold">₹{calculateCurrentTotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-500 font-medium">Taxes (GST 18%)</span>
                                <span className="font-bold">₹{(calculateCurrentTotal() * 0.18).toLocaleString()}</span>
                            </div>
                            {mode === 'manual' && (
                                <div className="flex justify-between text-sm text-red-600 mb-2">
                                    <span className="font-bold">Prior Balance (Arrears)</span>
                                    <span className="font-bold">₹{arrears.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-black text-[#005496] border-t border-slate-300 pt-2 mt-2">
                                <span>Total Charges</span>
                                <span>₹{((calculateCurrentTotal() * 1.18) + (mode === 'manual' ? arrears : 0)).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL: Visuals (The Donut) (Spans 3) */}
                    <div className="lg:col-span-3 flex flex-col items-center justify-start pt-10">

                        {/* CSS Donut Chart */}
                        <div className="relative w-48 h-48 rounded-full shadow-inner flex items-center justify-center mb-6"
                            style={{
                                background: `conic-gradient(
                                    #005496 0deg 220deg, 
                                    #e85f0c 220deg 300deg, 
                                    #cbd5e1 300deg 360deg
                                )`
                            }}>
                            <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center p-2 text-center shadow-lg relative z-10">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                                <span className="text-xl font-black text-[#005496]">₹{Math.round((calculateCurrentTotal() * 1.18)).toLocaleString()}</span>
                                <span className="text-[9px] text-slate-400 mt-1 leading-tight">Current Bill</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="w-full text-xs space-y-2 px-4">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 font-bold text-slate-600"><div className="w-3 h-3 bg-[#005496]"></div> Maintenance</span>
                                <span className="font-mono opacity-70">60%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 font-bold text-slate-600"><div className="w-3 h-3 bg-[#e85f0c]"></div> Utilities</span>
                                <span className="font-mono opacity-70">25%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 font-bold text-slate-600"><div className="w-3 h-3 bg-slate-300"></div> Taxes</span>
                                <span className="font-mono opacity-70">15%</span>
                            </div>
                        </div>

                        <div className="mt-8 bg-green-50 border border-green-100 p-4 rounded text-center w-full">
                            <p className="text-green-700 font-bold text-xs uppercase mb-1">Want to Save?</p>
                            <p className="text-[10px] text-green-800 leading-snug">Pay before the due date to avoid 18% p.a. interest on delayed payments.</p>
                        </div>
                    </div>

                </div>

                {/* 4. BOTTOM SECTION (Usage Summary - Bar Chart) */}
                <div className="bg-slate-50 border-t border-slate-300 p-8">
                    <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                        Payment History <span className="text-xs font-normal text-slate-400 bg-white border px-2 py-0.5 rounded-full">Last 6 Months</span>
                    </h3>

                    {/* Chart Area */}
                    <div className="h-40 flex items-end justify-between gap-2 md:gap-8 px-4 md:px-20 border-b border-slate-300 pb-2">
                        {/* We will mock the last 6 months based on user History or filtered invoices */}
                        {mode === 'manual' && selectedTenantId ? (
                            invoices
                                .filter(i => i.customerId === selectedTenantId)
                                .slice(0, 6)
                                .reverse() // Show oldest to newest left to right
                                .map((inv, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                        <div className="relative w-full flex justify-center items-end h-32">
                                            <div
                                                className="w-full max-w-[40px] bg-[#005496] opacity-80 group-hover:opacity-100 transition-all rounded-t-sm relative"
                                                style={{ height: `${Math.min((inv.totalAmount / 5000) * 100, 100)}%` }} // normalized max height
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                    ₹{inv.totalAmount}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(inv.createdAt).toLocaleString('default', { month: 'short' })}</span>
                                    </div>
                                ))
                        ) : (
                            // Generic Bars for empty state
                            [65, 40, 75, 50, 85, 60].map((h, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 w-full">
                                    <div className="w-full max-w-[40px] bg-slate-200 h-32 flex items-end justify-center rounded-t-sm overflow-hidden">
                                        <div className="w-full bg-slate-300" style={{ height: `${h}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase">---</span>
                                </div>
                            ))
                        )}
                        {(!selectedTenantId || (selectedTenantId && invoices.filter(i => i.customerId === selectedTenantId).length === 0)) && (
                            <div className="absolute left-1/2 -translate-x-1/2 text-sm text-slate-400 font-bold italic">No history available for this view</div>
                        )}
                    </div>
                </div>

            </div>

            {/* --- RECENT INVOICES LIST (Bottom Table) --- */}
            {/* Kept minimal as per 'Paper' look requests usually don't include a dashboard table inside the bill, but we keep it below the bill container */}
            <div className="mt-12">
                <div className="flex justify-between items-end mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h3 className="text-xl font-bold text-slate-700 dark:text-white">Recent Generated Bills</h3>
                    <button onClick={refresh} className="text-sm font-bold text-[#005496] dark:text-blue-400 hover:underline">Refresh List</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="bg-[#005496] text-white">
                            <tr>
                                <th className="p-3 font-bold uppercase text-[10px] tracking-wider">Invoice #</th>
                                <th className="p-3 font-bold uppercase text-[10px] tracking-wider">Resident</th>
                                <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-right">Amount</th>
                                <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-center">Status</th>
                                <th className="p-3 font-bold uppercase text-[10px] tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                            {invoices.slice(0, 5).map(inv => (
                                <tr key={inv._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    <td className="p-3 font-mono font-bold">#{inv._id.slice(-6).toUpperCase()}</td>
                                    <td className="p-3 font-bold">{inv.customerName}</td>
                                    <td className="p-3 text-right font-mono">₹{inv.totalAmount.toLocaleString()}</td>
                                    <td className="p-3 text-center">
                                        {inv.status === 'Paid'
                                            ? <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Paid</span>
                                            : <button onClick={() => handleMarkPaid(inv._id)} className="bg-slate-100 hover:bg-[#005496] hover:text-white text-slate-500 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-blue-600 dark:hover:text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors">Mark Paid</button>
                                        }
                                    </td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => downloadInvoice(inv)} className="text-slate-400 hover:text-[#005496] dark:hover:text-blue-400"><Download size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default BillingTab;
