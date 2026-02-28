import React, { useState, useEffect } from 'react';
import {
    Mail,
    Phone,
    Building2,
    MessageSquare,
    Clock,
    CheckCircle2,
    Search,
    Filter,
    ArrowUpRight,
    Loader2,
    Calendar,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Inquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            setError(null);
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const token = userData.token;

            if (!token) {
                setError("Session expired. Please login again.");
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/superadmin/inquiries`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (Array.isArray(data)) {
                setInquiries(data);
            } else {
                setError(data.message || "Unauthorized access");
                setInquiries([]);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const token = userData.token;
            await fetch(`${API_BASE_URL}/superadmin/inquiries/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchInquiries();
        } catch (error) {
            console.error("Update Error:", error);
        }
    };

    const filteredInquiries = inquiries.filter(inq => {
        const matchesSearch = inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inq.societyName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || inq.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'In Discussion': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
            case 'Onboarded': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
            default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 size={40} className="text-indigo-600 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Direct Leads</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage inquiries from the landing page contact form.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        {['All', 'New', 'In Discussion', 'Onboarded'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === tab
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or society..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Resident Lead</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Society / Context</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Message / Intent</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredInquiries.map((inq) => (
                                <tr key={inq._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                                                {inq.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{inq.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                                                    <Mail size={12} className="text-slate-400" /> {inq.email}
                                                </p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                                    <Phone size={12} className="text-slate-400" /> {inq.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                                <Building2 size={16} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{inq.societyName}</p>
                                                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-black uppercase tracking-widest mt-1">
                                                    <Calendar size={10} /> {new Date(inq.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 max-w-xs">
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                                            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium italic line-clamp-3 leading-relaxed">
                                                "{inq.message}"
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(inq.status)}`}>
                                            {inq.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex justify-end gap-2">
                                            <select
                                                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                                                value={inq.status}
                                                onChange={(e) => updateStatus(inq._id, e.target.value)}
                                            >
                                                <option value="New">Set as New</option>
                                                <option value="In Discussion">Discussing</option>
                                                <option value="Onboarded">Onboard</option>
                                                <option value="Rejected">Reject</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {error ? (
                        <div className="flex flex-col items-center justify-center p-24 text-center">
                            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-6">
                                <AlertCircle size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Access Denied</h3>
                            <p className="text-slate-500 font-medium mt-2 max-w-sm uppercase tracking-widest text-[10px]">{error}</p>
                            <button
                                onClick={fetchInquiries}
                                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredInquiries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-24 text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 mb-6">
                                <MessageSquare size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">No Inquiries Found</h3>
                            <p className="text-slate-500 font-medium mt-2 max-w-xs uppercase tracking-widest text-[10px]">Adjust your filters or search terms.</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Inquiries;
