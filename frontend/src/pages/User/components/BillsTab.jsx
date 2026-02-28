import React, { useEffect } from 'react';
import { API_BASE_URL } from '../../../config';
import { RefreshCw, CheckCircle, AlertCircle, Receipt, X, CreditCard, ChevronRight } from 'lucide-react';

const BillsTab = ({ invoices, refresh, token }) => {
    const [selectedBill, setSelectedBill] = React.useState(null);
    const [processing, setProcessing] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    useEffect(() => {
        refresh();
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refresh();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const initiatePayment = async () => {
        setProcessing(true);
        try {
            // 1. Create Order
            const orderRes = await fetch(`${API_BASE_URL}/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ invoiceId: selectedBill._id })
            });
            const orderData = await orderRes.json();

            if (!orderRes.ok) throw new Error(orderData.message || 'Order creation failed');

            if (orderData.isMock) {
                // Simulate Razorpay Delay
                setTimeout(async () => {
                    // 2. Mock Verification
                    const verifyRes = await fetch(`${API_BASE_URL}/payment/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                            razorpay_order_id: orderData.id,
                            razorpay_payment_id: `pay_mock_${Date.now()}`,
                            razorpay_signature: 'mock_sig',
                            invoiceId: selectedBill._id,
                            isMock: true
                        })
                    });

                    if (verifyRes.ok) {
                        alert('Payment Successful!');
                        await refresh();
                        setSelectedBill(null);
                    } else {
                        alert('Payment Verification Failed');
                    }
                    setProcessing(false);
                }, 1500);
            } else {
                alert("Real Payment Gateway not configured. Enable Mock Mode.");
                setProcessing(false);
            }

        } catch (error) {
            console.error(error);
            alert('Payment execution failed');
            setProcessing(false);
        }
    };

    const pendingInvoices = invoices.filter(i => i.status !== 'Paid');
    const paidInvoices = invoices.filter(i => i.status === 'Paid');

    return (
        <div className="animate-in fade-in duration-300 pb-20">
            {/* Payment Modal */}
            {selectedBill && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 transition-colors">
                        <button onClick={() => setSelectedBill(null)} className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded-full transition-colors"><X size={20} /></button>

                        <div className="text-center pt-2">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Confirm Payment</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-8">Secure Gateway • End-to-End Encrypted</p>

                            <div className="mb-6 bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center transition-colors">
                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">₹{selectedBill.totalAmount}</div>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">{selectedBill.items?.[0]?.name}</div>
                            </div>

                            <button
                                onClick={initiatePayment}
                                disabled={processing}
                                className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg dark:shadow-none"
                            >
                                {processing ? <RefreshCw className="animate-spin" size={18} /> : <CreditCard size={18} />}
                                {processing ? 'Processing...' : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">My Bills</h2>
                <button
                    onClick={handleRefresh}
                    className={`p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Pending List */}
            <div className="space-y-4 mb-10">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Pending Dues</h3>
                {pendingInvoices.length > 0 ? (
                    pendingInvoices.map(inv => (
                        <div key={inv._id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                    <AlertCircle size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-sm font-bold text-slate-800 dark:text-white">{inv.type} Bill</span>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">₹{inv.totalAmount}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{inv.items?.[0]?.name} • {new Date(inv.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedBill(inv)} className="w-full sm:w-auto bg-blue-600 dark:bg-blue-600 text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-md hover:bg-blue-700 dark:hover:bg-blue-500 transition">
                                Pay Now
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
                        <CheckCircle size={32} className="text-emerald-400 dark:text-emerald-500 mb-2 opacity-80" />
                        <span className="text-sm font-bold">No pending bills</span>
                    </div>
                )}
            </div>

            {/* History List */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Payment History</h3>
                {paidInvoices.length > 0 ? (
                    paidInvoices.map(inv => (
                        <div key={inv._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center opacity-75 hover:opacity-100 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle size={14} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-700 dark:text-white">{inv.type}</div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(inv.updatedAt || inv.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">₹{inv.totalAmount}</div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 italic py-4">No history available.</p>
                )}
            </div>
        </div>
    );
};

export default BillsTab;
