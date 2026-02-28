import React, { useState, useEffect } from 'react';
import { Box, CheckSquare, Package, Search, ArrowRight, Clock } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const ParcelTab = ({ user }) => {
    const [parcels, setParcels] = useState([]);
    const [form, setForm] = useState({ flatNo: '', courierName: '', recipientName: '' });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchParcels(); }, []);

    const fetchParcels = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/guard/parcels`, { headers: { Authorization: `Bearer ${user.token}` } });
            const data = await res.json();
            setParcels(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const addParcel = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/guard/parcels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setForm({ flatNo: '', courierName: '', recipientName: '' });
                fetchParcels();
                alert('Parcel Logged Successfully');
            }
        } catch (e) { console.error(e); }
    };

    const markCollected = async (id) => {
        if (!window.confirm('Confirm handover to resident?')) return;
        try {
            await fetch(`${API_BASE_URL}/guard/parcels/${id}/collect`, { method: 'PUT', headers: { Authorization: `Bearer ${user.token}` } });
            fetchParcels();
        } catch (e) { console.error(e); }
    };

    const filteredParcels = parcels.filter(p =>
        p.flatNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.courierName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Parcel Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Log deliveries and manage resident pickups</p>
                </div>
            </div>

            {/* Ingestion Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                        <Package size={20} />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">Incoming Delivery</h3>
                </div>

                <form onSubmit={addParcel} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-1.5 w-full">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Flat No</label>
                        <input
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all uppercase placeholder:normal-case"
                            placeholder="e.g. A-101"
                            value={form.flatNo}
                            onChange={e => setForm({ ...form, flatNo: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex-[2] space-y-1.5 w-full">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Courier / Vendor</label>
                        <input
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            placeholder="Amazon, Blinkit, FedEx..."
                            value={form.courierName}
                            onChange={e => setForm({ ...form, courierName: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full md:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-200 dark:shadow-orange-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <CheckSquare size={18} />
                        <span>Log Package</span>
                    </button>
                </form>
            </div>

            {/* Parcel List Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[calc(100vh-380px)] min-h-[300px]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Box size={18} className="text-slate-400" /> Pending Collection
                        </h3>
                        {parcels.length > 0 && <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full text-xs font-black">{parcels.length}</span>}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search flat or courier..."
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none text-slate-800 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Flat No</th>
                                <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Courier</th>
                                <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Arrived At</th>
                                <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></td></tr>
                            ) : filteredParcels.length === 0 ? (
                                <tr><td colSpan="4" className="p-12 text-center text-slate-400 text-sm font-medium">No pending parcels found.</td></tr>
                            ) : (
                                filteredParcels.map(p => (
                                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-4">
                                            <span className="font-black text-slate-800 dark:text-white text-base">{p.flatNo}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                                                    <Box size={14} />
                                                </div>
                                                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{p.courierName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                <Clock size={14} />
                                                {new Date(p.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => markCollected(p._id)}
                                                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2 ml-auto"
                                            >
                                                <span>Handover</span>
                                                <ArrowRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ParcelTab;
