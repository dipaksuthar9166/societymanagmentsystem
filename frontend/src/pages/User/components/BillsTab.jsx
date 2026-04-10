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
                <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Pending Dues</h3>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-500 rounded-full">
                        <AlertCircle size={14} className="animate-pulse" />
                        <span className="text-[10px] font-black">{pendingInvoices.length} Due</span>
                    </div>
                </div>

                {pendingInvoices.length > 0 ? (
                    pendingInvoices.map(inv => (
                        <div key={inv._id} className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-xl flex flex-col gap-6 group hover:border-blue-200 transition-all active:scale-[0.98]">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                        <Receipt size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">{inv.type}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{inv.items?.[0]?.name || 'Society Maintenance'}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-black uppercase">Due in 5 days</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{inv.totalAmount}</p>
                                    <p className="text-[10px] text-slate-300 font-bold">{new Date(inv.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedBill(inv)} 
                                className="w-full bg-slate-900 text-white py-4 rounded-[20px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <CreditCard size={16} /> Pay Securely
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-[40px] border-4 border-dashed border-slate-50 py-16 flex flex-col items-center justify-center text-slate-300 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
                            <CheckCircle size={40} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">All Clear! No Dues</span>
                    </div>
                )}
            </div>

            {/* History List */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">Payment History</h3>
                {paidInvoices.length > 0 ? (
                    paidInvoices.map(inv => (
                        <div key={inv._id} className="bg-white p-5 rounded-[25px] border border-slate-50 flex justify-between items-center shadow-sm group active:scale-95 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm">
                                    <CheckCircle size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-800 leading-none mb-1">{inv.type}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(inv.updatedAt || inv.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-sm font-black text-slate-900 tracking-tighter">₹{inv.totalAmount}</div>
                                <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Settled</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-slate-50/50 rounded-[30px] border border-dashed border-slate-100 italic">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No previous payments found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillsTab;
