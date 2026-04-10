import React from 'react';
import { Download } from 'lucide-react';

const HistoryTab = ({ invoices }) => {
    const history = invoices.filter(i => i.status === 'Paid');

    const handleDownload = (inv) => {
        const receiptContent = `
            ------------------------------------------
                     RESIDENT HUB OFFICIAL RECEIPT
            ------------------------------------------
            Transaction ID: ${inv._id.toUpperCase()}
            Billing Cycle: ${new Date(inv.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            Amount Paid: ₹${inv.totalAmount}
            Status: CLEARED / PAID
            Payment Date: ${new Date(inv.updatedAt).toLocaleDateString()}
            ------------------------------------------
            This is a computer generated document.
        `;
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Receipt_${inv._id.slice(-6)}.txt`;
        link.click();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-2">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Disbursements</h3>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{history.length} Record(s)</span>
            </div>
            
            <div className="space-y-4">
                {history.map(inv => (
                    <div key={inv._id} className="bg-white p-6 rounded-[35px] border border-slate-50 shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner font-black text-xs uppercase italic">
                                {new Date(inv.createdAt).toLocaleDateString('en-IN', { month: 'short' })}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 tracking-tight leading-none mb-1 text-base uppercase italic">
                                    {new Date(inv.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} Cycle
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-tighter">REF: #{inv._id.slice(-8).toUpperCase()}</span>
                                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Cleared</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                             <p className="text-xl font-black text-slate-900 tracking-tighter leading-none italic">₹{inv.totalAmount}</p>
                             <button 
                                onClick={() => handleDownload(inv)} 
                                className="p-2 bg-slate-900 text-white rounded-xl shadow-lg active:scale-90 transition-all"
                             >
                                <Download size={16} />
                             </button>
                        </div>
                    </div>
                ))}
                
                {history.length === 0 && (
                     <div className="text-center py-20 bg-white rounded-[50px] border-4 border-dashed border-slate-50">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Transaction history idle</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryTab;
