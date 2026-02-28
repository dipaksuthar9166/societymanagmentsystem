import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Search, Users, Activity, Filter } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const StaffTab = ({ user }) => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Mock data logic or fetch if available
        // For now using empty array or mock if fetch fails to show UI
        const mockStaff = [
            { _id: '1', name: 'Ramesh Kumar', role: 'Housekeeping', isInside: true },
            { _id: '2', name: 'Suresh Singh', role: 'Security', isInside: false },
            { _id: '3', name: 'Anita Devi', role: 'Maid', isInside: true },
            { _id: '4', name: 'Rajesh', role: 'Driver', isInside: false },
            { _id: '5', name: 'Sunita', role: 'Cook', isInside: false },
        ];
        // setStaff(mockStaff);
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/guard/staff`, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.ok) {
                const data = await res.json();
                setStaff(data);
            } else {
                // Fallback to mock if API not ready
                setStaff([
                    { _id: '1', name: 'Ramesh Kumar', role: 'Housekeeping', isInside: true },
                    { _id: '2', name: 'Suresh Singh', role: 'Security', isInside: false },
                    { _id: '3', name: 'Anita Devi', role: 'Maid', isInside: true },
                    { _id: '4', name: 'Rajesh', role: 'Driver', isInside: false },
                ]);
            }
        } catch (e) {
            console.error(e);
            setStaff([
                { _id: '1', name: 'Ramesh Kumar', role: 'Housekeeping', isInside: true },
                { _id: '2', name: 'Suresh Singh', role: 'Security', isInside: false },
                { _id: '3', name: 'Anita Devi', role: 'Maid', isInside: true },
                { _id: '4', name: 'Rajesh', role: 'Driver', isInside: false },
            ]);
        }
        finally { setLoading(false); }
    };

    const toggleAttendance = async (s) => {
        // Optimistic update
        const newStatus = !s.isInside;
        setStaff(prev => prev.map(p => p._id === s._id ? { ...p, isInside: newStatus } : p));

        // Ideally: await fetch(...)
    };

    const filteredStaff = staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.role.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Staff Attendance</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Manage daily help entries (Maids, Drivers, etc.)</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-100 dark:border-emerald-900/30">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        {staff.filter(s => s.isInside).length} Inside
                    </div>
                    <div className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 shadow-sm">
                        {staff.length} Total Staff
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[calc(100vh-250px)] min-h-[400px]">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Name or Role..."
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchStaff} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Filter size={14} /> Refresh List
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Staff Member</th>
                                <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></td></tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr><td colSpan="4" className="p-12 text-center text-slate-400 text-sm font-medium">No staff members found.</td></tr>
                            ) : (
                                filteredStaff.map(s => (
                                    <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm ${s.isInside ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                                                    {s.name[0]}
                                                </div>
                                                <span className="font-bold text-slate-800 dark:text-white text-sm">{s.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                                {s.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {s.isInside ? (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg w-fit border border-emerald-100 dark:border-emerald-900/30">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Checked In
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg w-fit border border-slate-200 dark:border-slate-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    Away
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => toggleAttendance(s)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm active:scale-95 ${s.isInside
                                                    ? 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                    : 'bg-indigo-600 hover:bg-indigo-500 border-transparent text-white shadow-indigo-200 dark:shadow-indigo-900/20'
                                                    }`}
                                            >
                                                {s.isInside ? 'Mark OUT' : 'Mark IN'}
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

export default StaffTab;
