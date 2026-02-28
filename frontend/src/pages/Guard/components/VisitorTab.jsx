import React, { useState, useEffect } from 'react';
import { Camera, UserPlus, Clock, CheckCircle, Search, Filter, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const VisitorTab = ({ user }) => {
    const [visitors, setVisitors] = useState([]);
    const [view, setView] = useState('new'); // 'new' or 'logs'
    const [formData, setFormData] = useState({ name: '', mobile: '', flatNo: '', purpose: '', visitorType: 'Guest' });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (view === 'logs') fetchLogs();
    }, [view]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/guard/visitors`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setVisitors(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/guard/entry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Entry Approved');
                setFormData({ name: '', mobile: '', flatNo: '', purpose: '', visitorType: 'Guest' });
                setView('logs');
            } else {
                alert('Entry Failed');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleOut = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/guard/visitors/${id}/checkout`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchLogs();
        } catch (e) {
            console.error(e);
        }
    };

    const filteredVisitors = visitors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.flatId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Visitor Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Track entries and manage visitor access</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setView('new')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'new'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        New Entry
                    </button>
                    <button
                        onClick={() => setView('logs')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'logs'
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Visit Logs
                    </button>
                </div>
            </div>

            {view === 'new' ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">New Visitor Registration</h3>
                    </div>
                    <div className="p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                            {/* Visitor Type Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Visitor Type</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['Guest', 'Delivery', 'Service', 'Cab'].map(t => (
                                        <button
                                            type="button"
                                            key={t}
                                            onClick={() => setFormData({ ...formData, visitorType: t })}
                                            className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${formData.visitorType === t
                                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column - Details */}
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                                        <input
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 dark:text-white"
                                            placeholder="Enter visitor's name"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mobile Number</label>
                                        <input
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 dark:text-white"
                                            placeholder="10-digit mobile number"
                                            value={formData.mobile}
                                            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Flat / Unit No</label>
                                        <input
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 dark:text-white"
                                            placeholder="e.g. A-101"
                                            value={formData.flatNo}
                                            onChange={e => setFormData({ ...formData, flatNo: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Right Column - Photo & Purpose */}
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Photo Verification</label>
                                        <div className="relative group bg-slate-100 dark:bg-slate-900 h-40 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all">
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                                <Camera size={20} className="text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Capture Visitor Photo</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Purpose of Visit</label>
                                        <textarea
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium h-24 resize-none text-slate-800 dark:text-white"
                                            placeholder="Reason for visit..."
                                            value={formData.purpose}
                                            onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95 transition-all text-sm flex items-center gap-2">
                                    <UserPlus size={18} />
                                    <span>Register Entry & Notify</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[calc(100vh-240px)]">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search visitor or flat..."
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <Filter size={14} /> Filter
                            </button>
                            <button onClick={fetchLogs} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visitor</th>
                                    <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visiting</th>
                                    <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Time</th>
                                    <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Out Time</th>
                                    <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center">
                                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                        </td>
                                    </tr>
                                ) : filteredVisitors.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-slate-400 text-sm font-medium">
                                            No visitors found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVisitors.map((v) => (
                                        <tr key={v._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${v.visitorType === 'Delivery' ? 'bg-orange-500' : 'bg-indigo-500'}`}>
                                                        {v.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{v.name}</p>
                                                        <p className="text-xs text-slate-400">{v.mobile || 'No Contact'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${v.visitorType === 'Delivery'
                                                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                                        : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                                    }`}>
                                                    {v.visitorType}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                                                    {v.flatId || '-'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {v.checkOutTime ? (
                                                    <span className="text-emerald-500 font-bold">
                                                        {new Date(v.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-2 py-1 rounded-lg animate-pulse">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                {!v.checkOutTime && (
                                                    <button
                                                        onClick={() => handleOut(v._id)}
                                                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                    >
                                                        Mark OUT
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitorTab;
