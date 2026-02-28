import React, { useState, useEffect } from 'react';
import {
    FileText,
    Send,
    Plus,
    Trash2,
    Search,
    User,
    Calendar,
    ShieldAlert,
    Download,
    Eye,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Mail,
    Scale,
    Shield
} from 'lucide-react';
import { API_BASE_URL, resolveImageURL } from '../../../config';
import { useToast } from '../../../components/ToastProvider';
import { useAuth } from '../../../context/AuthContext';

import { AnimatePresence, motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const LegalNoticeTab = ({ society }) => {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [viewingNotice, setViewingNotice] = useState(null);
    const [deletingNotice, setDeletingNotice] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { showSuccess, showError } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        tenantId: '',
        invoiceId: '',
        subject: 'LEGAL NOTICE: Final Demand for Payment',
        content: ''
    });

    const [tenants, setTenants] = useState([]);
    const [userInvoices, setUserInvoices] = useState([]);

    useEffect(() => {
        fetchNotices();
        fetchTenants();
    }, []);

    // Set default content when modal opens or society changes
    useEffect(() => {
        if (isAdding && society) {
            updateNoticeContent(formData.tenantId, formData.invoiceId);
        }
    }, [isAdding, society]);

    const fetchNotices = async () => {
        if (!user?.token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/legal-notices`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) setNotices(data);
        } catch (err) {
            showError('Error', 'Failed to fetch notices');
        } finally {
            setLoading(false);
        }
    };

    const fetchTenants = async () => {
        if (!user?.token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/flats`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                const occupants = data.filter(f => f.tenantId).map(f => ({
                    id: f.tenantId._id,
                    name: f.tenantId.name,
                    flatNo: f.flatNo,
                    email: f.tenantId.email
                }));
                const unique = Array.from(new Set(occupants.map(o => o.id)))
                    .map(id => occupants.find(o => o.id === id));
                setTenants(unique);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch invoices for the selected tenant to link them
    useEffect(() => {
        if (formData.tenantId) {
            fetchUserInvoices(formData.tenantId);
            updateNoticeContent(formData.tenantId, '');
        }
    }, [formData.tenantId]);

    const fetchUserInvoices = async (tenantId) => {
        if (!user?.token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/invoices/user/${tenantId}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                // Only show unpaid/overdue ones
                setUserInvoices(data.filter(inv => inv.status !== 'Paid'));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const updateNoticeContent = (uid, invId) => {
        const tenant = tenants.find(t => t.id === uid);
        const invoice = userInvoices.find(i => i._id === invId);
        const societyName = society?.name || '[Society Name]';
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        const amount = invoice ? `₹${invoice.totalAmount}` : '[Amount]';
        const invNo = invoice ? `(Invoice #${invoice._id.slice(-6).toUpperCase()})` : '';
        const flat = tenant?.flatNo || '[Flat No]';
        const residentName = tenant?.name || '[Resident Name]';

        setFormData(prev => ({
            ...prev,
            content: `Date: ${today}

To,
${residentName}
Flat No. ${flat}
${societyName}

SUBJECT: FINAL DEMAND NOTICE FOR OUTSTANDING DUES

TAKE NOTICE that you are hereby demanded to pay the sum of ${amount} ${invNo} being the outstanding maintenance dues for your flat in ${societyName}. 

Despite several reminders, the payment has remained unpaid. This amount is now seriously overdue and is causing financial strain on the society's operation.

You are hereby requested to clear the outstanding amount within 7 days of receipt of this notice. Failure to do so will compel the management to initiate legal proceedings in the appropriate court of law to recover the dues along with interest and legal costs.

This notice is issued without prejudice to any other rights and remedies available to the society management.

Sincerely,
Management Committee
${societyName}`
        }));
    };

    const handleDraftSubmit = async (e) => {
        e.preventDefault();
        if (!user?.token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/legal-notices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                showSuccess('Success', 'Legal notice draft created');
                setIsAdding(false);
                setFormData({ tenantId: '', invoiceId: '', subject: 'LEGAL NOTICE: Final Demand for Payment', content: '' });
                fetchNotices();
            } else {
                const data = await res.json();
                showError('Error', data.message);
            }
        } catch (err) {
            showError('Error', 'Failed to create notice');
        }
    };

    const sendNotice = async (id) => {
        if (!user?.token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/legal-notices/${id}/send`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                showSuccess('Sent', 'Legal notice sent via Email');
                fetchNotices();
            }
        } catch (err) {
            showError('Error', 'Failed to send notice');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) return;
        if (!user?.token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/legal-notices/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (res.ok) {
                showSuccess('Deleted', 'Legal notice removed');
                setDeletingNotice(null);
                fetchNotices();
            }
        } catch (err) {
            showError('Error', 'Failed to delete notice');
        }
    };

    const handleDownloadPDF = (notice) => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Outer Border
            doc.setDrawColor(0);
            doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

            // Header Color Bar (Top)
            doc.setFillColor(185, 28, 28); // Red-700
            doc.rect(5, 5, pageWidth - 10, 15, 'F');

            let y = 35;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text(society?.name?.toUpperCase() || 'SOCIETY MANAGEMENT', pageWidth / 2, y, { align: 'center' });

            y += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(society?.address || '', pageWidth / 2, y, { align: 'center' });

            y += 5;
            doc.text(`Contact: ${society?.contactNumber || 'N/A'} | Email: ${society?.email || 'N/A'}`, pageWidth / 2, y, { align: 'center' });

            y += 10;
            doc.setDrawColor(200);
            doc.line(20, y, pageWidth - 20, y);

            y += 10;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`REF ID: ${notice.noticeNumber}`, 20, y);
            doc.text(`DATE: ${new Date(notice.createdAt).toLocaleDateString()}`, pageWidth - 20, y, { align: 'right' });

            y += 20;
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(185, 28, 28);
            doc.text('LEGAL DEMAND NOTICE', pageWidth / 2, y, { align: 'center' });

            y += 15;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text('TO,', 20, y);
            y += 7;
            doc.text(notice.tenantId?.name || '', 20, y);
            y += 6;
            doc.text(`Flat No: ${notice.tenantId?.flatNo}`, 20, y);
            y += 6;
            doc.text(society?.name || '', 20, y);

            y += 20;
            doc.setFont('helvetica', 'normal');
            const splitContent = doc.splitTextToSize(notice.content, pageWidth - 40);
            doc.text(splitContent, 20, y);

            y = pageHeight - 45;
            doc.setFont('helvetica', 'bold');
            doc.text('Authorized Signatory', 20, y);
            y += 7;
            doc.setFont('helvetica', 'normal');
            doc.text('Management Committee', 20, y);
            doc.text(society?.name || '', 20, y + 7);

            // Footer Note
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text('This is a computer-generated legal document and does not require a physical signature.', pageWidth / 2, pageHeight - 15, { align: 'center' });

            doc.save(`Notice_${notice.noticeNumber}.pdf`);
            showSuccess('Downloaded', 'Legal notice PDF saved');
        } catch (err) {
            console.error(err);
            showError('Error', 'Failed to generate PDF');
        }
    };

    const filteredNotices = notices.filter(n =>
        n.tenantId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.noticeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.tenantId?.flatNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Draft': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
            case 'Resolved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        }
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-red-600 rounded-xl shadow-lg shadow-red-200 dark:shadow-none">
                            <Scale className="text-white" size={24} />
                        </div>
                        Legal Notices
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest italic">Official Compliance & Recovery system</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl transition-all shadow-xl shadow-red-200 hover:scale-[1.02] active:scale-95 dark:shadow-none font-black uppercase tracking-wider text-xs"
                >
                    <Plus size={18} />
                    Issue New Notice
                </button>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-4 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50"
            >
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by resident name, flat number, or Ref ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium text-slate-900 dark:text-white"
                    />
                </div>
            </motion.div>

            {/* Notice List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="p-12 text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="inline-block"
                        >
                            <Scale className="text-red-600 opacity-20" size={48} />
                        </motion.div>
                        <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Authenticating Records...</p>
                    </div>
                ) : filteredNotices.length > 0 ? (
                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredNotices.map((notice, index) => (
                                <motion.div
                                    key={notice._id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.01, x: 5 }}
                                    className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/20 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                                    <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                                        <div className="flex gap-5">
                                            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-2xl h-fit border border-red-100 dark:border-red-900/30 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                <ShieldAlert size={28} className="group-hover:animate-bounce" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-[0.2em] bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-lg border border-red-100 dark:border-red-900/30">
                                                        {notice.noticeNumber}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyles(notice.status)}`}>
                                                        {notice.status}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                                    {notice.tenantId?.name}
                                                    <span className="text-sm font-bold text-slate-400">— Flat {notice.tenantId?.flatNo}</span>
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-bold">
                                                    <span className="flex items-center gap-2"><Mail size={14} className="text-indigo-500" /> {notice.tenantId?.email}</span>
                                                    <span className="flex items-center gap-2"><Calendar size={14} className="text-indigo-500" /> {new Date(notice.createdAt).toLocaleDateString()}</span>
                                                    {notice.sentAt && (
                                                        <span className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md"><CheckCircle2 size={14} /> Sent {new Date(notice.sentAt).toLocaleTimeString()}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 self-end md:self-center">
                                            {notice.status === 'Draft' && (
                                                <button
                                                    onClick={() => sendNotice(notice._id)}
                                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none hover:scale-105"
                                                >
                                                    <Send size={16} />
                                                    Transmit
                                                </button>
                                            )}
                                            <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1.5 rounded-2xl gap-1">
                                                <button
                                                    onClick={() => setViewingNotice(notice)}
                                                    className="p-3 text-slate-600 dark:text-white hover:bg-white dark:hover:bg-slate-600 rounded-xl transition-all shadow-sm group/btn"
                                                    title="View Full Notice"
                                                >
                                                    <Eye size={20} className="group-hover/btn:scale-125 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingNotice(notice)}
                                                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-xl transition-all group/btn"
                                                    title="Delete Draft"
                                                >
                                                    <Trash2 size={20} className="group-hover/btn:scale-125 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 p-16 text-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700"
                    >
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Scale className="text-slate-200 dark:text-slate-800" size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Clean Compliance Record</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">There are no active legal notices. All accounts seem to be in good standing.</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-100 dark:shadow-none"
                        >
                            Issue New Notice
                        </button>
                    </motion.div>
                )}
            </div>

            {/* View Notice Page-Like Modal */}
            <AnimatePresence>
                {viewingNotice && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setViewingNotice(null)}></div>
                        <motion.div
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className="bg-white w-full max-w-3xl rounded-none shadow-2xl relative z-10 overflow-hidden my-auto"
                        >
                            <div className="absolute right-6 top-6 print:hidden">
                                <button onClick={() => setViewingNotice(null)} className="p-3 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-full transition-all">
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>

                            {/* Official Document Style */}
                            <div className="p-16 text-slate-900 overflow-x-auto min-h-[800px] bg-white">
                                <div className="max-w-[100%] min-w-[500px]">
                                    <div className="flex items-center gap-6 border-b-4 border-slate-900 pb-8 mb-8">
                                        <img src={resolveImageURL(society?.logo)} className="w-20 h-20 object-contain grayscale" />
                                        <div className="flex-1">
                                            <h1 className="text-3xl font-serif font-black uppercase tracking-tight">{society?.name}</h1>
                                            <p className="font-serif text-sm italic">{society?.address || 'Registered Office Address'}</p>
                                            <p className="font-serif text-xs mt-1">Tel: {society?.contactNumber} | Email: {society?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between font-serif text-sm mb-12">
                                        <div>
                                            <p><strong>REFERENCE ID:</strong> {viewingNotice.noticeNumber}</p>
                                            <p><strong>ISSUE DATE:</strong> {new Date(viewingNotice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <div className="text-right uppercase">
                                            <p className="font-black text-lg underline text-red-700">Formal Legal Demand</p>
                                            <p className="text-[10px] mt-1 italic">Via: Certified Digital Channel</p>
                                        </div>
                                    </div>

                                    <div className="font-serif text-lg mb-12 text-justify whitespace-pre-wrap leading-relaxed">
                                        {viewingNotice.content}
                                    </div>

                                    <div className="mt-20 border-t border-slate-200 pt-8 font-serif">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-slate-400 text-xs italic mb-4">Digitally Authenticated Document</p>
                                                <p className="font-black uppercase">Authorized for Issue:</p>
                                                <p className="text-xl">Executive Management Committee</p>
                                                <p className="text-sm">{society?.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="w-24 h-24 border-2 border-slate-100 rounded-lg flex items-center justify-center mb-2 mx-auto p-2 opacity-30">
                                                    <Shield size={60} />
                                                </div>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Office Seal</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t flex justify-end gap-3 print:hidden">
                                <button
                                    onClick={() => handleDownloadPDF(viewingNotice)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all"
                                >
                                    <Download size={18} />
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                                >
                                    Print Copy
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingNotice && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
                    >
                        <div className="fixed inset-0 bg-red-950/40 backdrop-blur-md" onClick={() => setDeletingNotice(null)}></div>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.9, opacity: 0, rotate: 2 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl relative z-10 border border-red-200 dark:border-red-900/30 text-center"
                        >
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="text-red-600" size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Withdraw Notice?</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                                Are you sure you want to permanently delete this notice for <span className="font-black text-slate-900 dark:text-white">{deletingNotice.tenantId?.name}</span>?
                                <br /><span className="text-red-600 text-xs font-black uppercase mt-2 block">This action cannot be undone.</span>
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingNotice(null)}
                                    className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deletingNotice._id)}
                                    className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-700 shadow-xl shadow-red-200 dark:shadow-none transition-all active:scale-95"
                                >
                                    Delete Now
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Notice Modal (Styled to match) */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-xl" onClick={() => setIsAdding(false)}></div>
                        <motion.div
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden border border-white/50 dark:border-slate-700"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                        <Scale className="text-white" size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Draft Compliance Notice</h3>
                                        <p className="text-white/70 text-sm font-bold tracking-widest uppercase">Legally Binding Document</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAdding(false)} className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
                                    <Plus className="rotate-45" size={28} />
                                </button>
                            </div>
                            <form onSubmit={handleDraftSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Resident Account</label>
                                        <select
                                            value={formData.tenantId}
                                            onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-bold"
                                            required
                                        >
                                            <option value="">Select Resident</option>
                                            {tenants.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} (Flat {t.flatNo})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Linked Invoice</label>
                                        <select
                                            value={formData.invoiceId}
                                            onChange={(e) => {
                                                const invId = e.target.value;
                                                setFormData({ ...formData, invoiceId: invId });
                                                updateNoticeContent(formData.tenantId, invId);
                                            }}
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-bold"
                                            disabled={!formData.tenantId || userInvoices.length === 0}
                                        >
                                            <option value="">
                                                {!formData.tenantId ? 'Choose resident first' : userInvoices.length === 0 ? 'No unpaid invoices' : 'Select Invoice'}
                                            </option>
                                            {userInvoices.map(inv => (
                                                <option key={inv._id} value={inv._id}>
                                                    #{inv._id.slice(-6).toUpperCase()} (₹{inv.totalAmount})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-1 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ref Subject</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-bold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Notice Body</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        rows={10}
                                        className="w-full px-6 py-5 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-serif text-lg leading-relaxed shadow-inner"
                                        required
                                    />
                                </div>

                                <div className="flex items-center gap-4 p-5 bg-amber-50 dark:bg-amber-950/20 rounded-3xl border border-amber-200 dark:border-amber-900/30">
                                    <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed font-bold">
                                        <span className="text-amber-950 dark:text-amber-100 uppercase tracking-widest block mb-1">Administrative Declaration:</span>
                                        By issuing this notice, you confirm that the financial data provided is accurate. This document will be stored as an official record for potential litigation.
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 py-5 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all border border-transparent"
                                    >
                                        Cancel Draft
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-5 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-700 shadow-2xl shadow-red-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <FileText size={18} />
                                        Save Official Draft
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LegalNoticeTab;
