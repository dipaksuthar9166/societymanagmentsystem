import React, { useState } from 'react';
import { Search, User, Mail, Phone, Home, Receipt, AlertTriangle, ShieldCheck, Calendar, IndianRupee, Hash } from 'lucide-react';

const ResidentLookupTab = ({ tenants, invoices, complaints, flats }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTenant, setSelectedTenant] = useState(null);

    // Derived states
    const tenantInvoices = selectedTenant ? invoices.filter(inv => inv.customerId === selectedTenant._id) : [];
    const tenantComplaints = selectedTenant ? complaints?.filter(c => c.customer?._id === selectedTenant._id || c.customerId === selectedTenant._id) || [] : [];
    
    // Financials
    const totalBilled = tenantInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = tenantInvoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPending = tenantInvoices.filter(i => i.status !== 'Paid').reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        const term = val.toLowerCase();
        
        if (term.length < 2) {
            setSelectedTenant(null);
            return;
        }

        const found = tenants.find(t => 
            (t._id && t._id.toLowerCase() === term) ||
            (t.flatNo && t.flatNo.toLowerCase() === term) ||
            (t.name && t.name.toLowerCase().includes(term)) ||
            (t.contactNumber && t.contactNumber.includes(term)) ||
            (t.mobile && t.mobile.includes(term))
        );
        
        setSelectedTenant(found || null);
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="bg-gradient-to-br from-[#005496] to-indigo-900 rounded-3xl p-8 shadow-xl text-white mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-black mb-2 text-center">Resident Lookup Ledger</h2>
                    <p className="text-center text-white/70 mb-8 text-sm">Enter Account ID, Flat No, or Name to pull up the complete resident profile.</p>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="text-indigo-300" size={24} />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-white/10 border-2 border-white/20 text-white placeholder:text-white/40 font-bold p-5 pl-14 text-lg rounded-2xl outline-none focus:bg-white/20 focus:border-white/50 transition-all shadow-inner"
                            placeholder="Search by ID, Flat No, Name, or Mobile..."
                            value={searchQuery}
                            onChange={handleSearch}
                            autoFocus
                        />
                    </div>
                </div>
            </div>

            {selectedTenant ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-500">
                    
                    {/* LEFT COL: Profile Card */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-2xl transform group-hover:scale-150 transition-transform"></div>
                            
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#005496] to-indigo-600 text-white flex items-center justify-center text-4xl font-black shadow-lg shadow-indigo-500/30 mb-4 border-4 border-white dark:border-slate-800">
                                    {selectedTenant.name?.[0] || 'R'}
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{selectedTenant.name}</h3>
                                <div className="flex items-center gap-1.5 mt-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800/50">
                                    <Home size={12} />
                                    Flat {selectedTenant.flatNo || 'N/A'}
                                </div>
                                
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-700/50 my-6"></div>

                                <div className="w-full space-y-4 text-left">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400 border border-slate-100 dark:border-slate-800">
                                            <Hash size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account ID</p>
                                            <p className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{selectedTenant._id}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400 border border-slate-100 dark:border-slate-800">
                                            <Phone size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile No.</p>
                                            <p className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{selectedTenant.contactNumber || selectedTenant.mobile || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400 border border-slate-100 dark:border-slate-800">
                                            <Mail size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 break-all">{selectedTenant.email || 'Not Provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400 border border-slate-100 dark:border-slate-800">
                                            <ShieldCheck size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verification</p>
                                            <p className={`text-sm font-black uppercase ${selectedTenant.isVerified ? 'text-green-500' : 'text-amber-500'}`}>
                                                {selectedTenant.isVerified ? 'Verified & Active' : 'Pending Activation'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL: Data Tabs */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        
                        {/* Financial Overview */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    <IndianRupee size={20} className="text-emerald-500" />
                                    Financial Summary
                                </h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
                                    {tenantInvoices.length} Bills Found
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Total Billed</p>
                                    <p className="text-2xl font-black text-slate-800 dark:text-white">₹{totalBilled.toLocaleString()}</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-1">Total Paid</p>
                                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{totalPaid.toLocaleString()}</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/30">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-500 mb-1">Outstanding Dues</p>
                                    <p className="text-2xl font-black text-red-600 dark:text-red-400">₹{totalPending.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Invoices Table */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <Receipt size={20} className="text-blue-500" />
                                Payment Ledger
                            </h3>
                            
                            {tenantInvoices.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <th className="py-3 px-2">Invoice #</th>
                                                <th className="py-3 px-2">Period</th>
                                                <th className="py-3 px-2 text-right">Amount</th>
                                                <th className="py-3 px-2 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                            {tenantInvoices.map(inv => (
                                                <tr key={inv._id} className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    <td className="py-4 px-2 font-mono text-xs">{inv._id.slice(-6).toUpperCase()}</td>
                                                    <td className="py-4 px-2 opacity-80">{new Date(inv.billingPeriod?.from || inv.createdAt).toLocaleDateString('en-GB')}</td>
                                                    <td className="py-4 px-2 text-right">₹{inv.totalAmount.toLocaleString()}</td>
                                                    <td className="py-4 px-2 text-center">
                                                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-wider ${
                                                            inv.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 opacity-50">
                                    <Receipt size={40} className="mx-auto mb-3" />
                                    <p className="font-bold">No Invoices Found</p>
                                </div>
                            )}
                        </div>

                        {/* Recent Complaints */}
                        {tenantComplaints.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <AlertTriangle size={20} className="text-amber-500" />
                                    Complaints & Issues
                                </h3>
                                <div className="space-y-4">
                                    {tenantComplaints.map(c => (
                                        <div key={c._id} className="border border-slate-100 dark:border-slate-700 p-4 rounded-xl flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                            <div>
                                                <p className="font-bold text-sm text-slate-800 dark:text-white capitalize">{c.category} Issue</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.description}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-black tracking-wider ${
                                                c.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                c.status === 'In Progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            ) : (
                searchQuery.length >= 2 ? (
                    <div className="text-center py-20 animate-in fade-in">
                        <User size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">No Resident Found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Try checking the ID, Name, or Flat Number again.</p>
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-50">
                        <Search size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Awaiting Search Query</h3>
                        <p className="text-slate-500 dark:text-slate-400">Enter at least 2 characters to search.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default ResidentLookupTab;
