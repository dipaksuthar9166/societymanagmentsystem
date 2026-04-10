import React, { useState } from 'react';
import { Shield, Clock, CheckCircle, XCircle, Filter, Search, Download, Calendar } from 'lucide-react';

const ChildSafetyAdmin = () => {
    const [logs, setLogs] = useState([
        { id: 1, childName: 'Aryan Sharma', flatNo: 'B-402', age: 8, gate: 'Main Gate', time: '10:30 AM', status: 'Approved', approvedBy: 'Mr. Sharma (Father)', mobile: '9876543210' },
        { id: 2, childName: 'Ishika Jha', flatNo: 'C-101', age: 12, gate: 'Back Gate', time: '11:15 AM', status: 'Denied', approvedBy: 'Mrs. Jha (Mother)', mobile: '9876543211' },
        { id: 3, childName: 'Karan Malik', flatNo: 'A-705', age: 6, gate: 'Main Gate', time: '09:45 AM', status: 'Approved', approvedBy: 'Mr. Malik (Father)', mobile: '9876543212' },
        { id: 4, childName: 'Riya Singh', flatNo: 'D-203', age: 10, gate: 'Main Gate', time: '08:20 AM', status: 'Approved', approvedBy: 'Mrs. Singh (Mother)', mobile: '9876543213' },
    ]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[30px] border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Today's Child Exits</p>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white">12</h3>
                    <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
                        <CheckCircle size={10} /> 100% Parent Approved
                    </p>
                </div>
                <div className="bg-indigo-600 p-6 rounded-[30px] text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Alerts Prevented</p>
                    <h3 className="text-3xl font-black">2</h3>
                    <p className="text-xs font-bold opacity-80 mt-2 flex items-center gap-1">
                        <Shield size={10} /> Unauthorized attempts blocked
                    </p>
                </div>
                <div className="bg-slate-900 p-6 rounded-[30px] text-white shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Total System Uptime</p>
                    <h3 className="text-3xl font-black font-mono">99.9%</h3>
                    <p className="text-xs font-bold opacity-60 mt-2 flex items-center gap-1">
                        <Clock size={10} /> Real-time active
                    </p>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search child or flat..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors"><Calendar size={18} /></button>
                    <button className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors"><Filter size={18} /></button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                        <Download size={16} /> Export Logs
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-700">Child Details</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-700">Flat</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-700">Gate/Time</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-700 text-center">Outcome</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-700">Authorized By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-black text-xs uppercase italic border border-indigo-100 dark:border-indigo-900/30">
                                                {log.childName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none mb-1">{log.childName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age: {log.age}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-black uppercase tracking-tighter border border-slate-200 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                                            {log.flatNo}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase mb-1">{log.gate}</p>
                                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                            <Clock size={10} /> {log.time}
                                        </p>
                                    </td>
                                    <td className="p-6 text-center">
                                        {log.status === 'Approved' ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                <CheckCircle size={10} /> Approved
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100">
                                                <XCircle size={10} /> Denied
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase mb-1 italic">{log.approvedBy}</p>
                                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">{log.mobile}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-center italic">
                Logs are end-to-end encrypted and visible only to society management.
            </p>
        </div>
    );
};

export default ChildSafetyAdmin;
