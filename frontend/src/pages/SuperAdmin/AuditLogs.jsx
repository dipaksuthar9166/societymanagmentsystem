import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { ShieldAlert, Search, FileText, User, Building2, Clock } from 'lucide-react';

const AuditLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/audit-logs?page=${page}&limit=20`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setLogs(data.logs);
                setTotalPages(data.pages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('DELETE')) return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
        if (action.includes('CREATE') || action.includes('ADD')) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
        if (action.includes('UPDATE') || action.includes('EDIT')) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
        if (action.includes('LOGIN')) return 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300';
        return 'text-slate-600 bg-slate-50 dark:bg-slate-700/50 dark:text-slate-400';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">System Audit Logs</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Track all system activities & security events</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchLogs} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors">
                        <Clock size={20} />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors">
                        <Search size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold tracking-widest border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="p-4 pl-6">Timestamp</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Society</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-400 dark:text-slate-500 animate-pulse">Loading Logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-400 dark:text-slate-500">No logs found.</td></tr>
                            ) : logs.map(log => (
                                <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 pl-6 text-slate-400 dark:text-slate-500 text-xs font-mono">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${getActionColor(log.action)}`}>
                                            {log.action?.replace('_', ' ') || 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {log.user ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase">
                                                    {log.user.name?.[0] || 'U'}
                                                </div>
                                                <span className="text-slate-700 dark:text-slate-200 font-bold text-xs">{log.user.name || 'Unknown User'}</span>
                                            </div>
                                        ) : <span className="text-slate-400 italic text-xs">System</span>}
                                    </td>
                                    <td className="p-4">
                                        {log.society ? (
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                <Building2 size={12} />
                                                <span className="text-xs font-bold">{log.society.name}</span>
                                            </div>
                                        ) : <span className="text-slate-300 dark:text-slate-600">-</span>}
                                    </td>
                                    <td className="p-4 max-w-md truncate text-slate-600 dark:text-slate-400 text-xs" title={log.description}>
                                        {log.description}
                                    </td>
                                    <td className="p-4 text-xs font-mono text-slate-400 dark:text-slate-500">
                                        {log.ipAddress || 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );


};

export default AuditLogs;
