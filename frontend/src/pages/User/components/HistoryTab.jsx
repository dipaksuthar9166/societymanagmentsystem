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
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in duration-500 transition-colors">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-10 italic">Past Disbursements</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-50 dark:border-slate-700">
                            <th className="pb-6 px-6">Billing Cycle</th>
                            <th className="pb-6 px-6">Auth Reference</th>
                            <th className="pb-6 px-6">Amount</th>
                            <th className="pb-6 px-6">Status</th>
                            <th className="pb-6 px-6 text-right">Receipt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                        {history.map(inv => (
                            <tr key={inv._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="py-8 px-6">
                                    <div className="text-lg font-bold text-slate-800 dark:text-white italic uppercase">{new Date(inv.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} Cycle</div>
                                </td>
                                <td className="py-8 px-6 font-mono text-sm text-slate-400 dark:text-slate-500 font-bold">#{inv._id.slice(-10).toUpperCase()}</td>
                                <td className="py-8 px-6 font-black text-slate-900 dark:text-white text-lg">₹{inv.totalAmount}</td>
                                <td className="py-8 px-6">
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-1 rounded-full text-[10px] font-black uppercase border border-green-200 dark:border-green-900/50">Cleared</span>
                                </td>
                                <td className="py-8 px-6 text-right">
                                    <button onClick={() => handleDownload(inv)} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                        <Download size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {history.length === 0 && <p className="text-center text-slate-400 dark:text-slate-500 italic py-10">No disbursement history detected.</p>}
            </div>
        </div>
    );
};

export default HistoryTab;
