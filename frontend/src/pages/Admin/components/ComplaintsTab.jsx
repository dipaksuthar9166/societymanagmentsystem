import React, { useState, useMemo } from 'react';
import { API_BASE_URL } from '../../../config';
import {
    Search, Filter, CheckCircle, Clock, AlertCircle,
    Trash2, UserPlus, MessageSquare, ChevronDown, Check, X, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '../../../components/ConfirmationModal';

const ComplaintsTab = ({ complaints, refresh, token }) => {
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [assigningId, setAssigningId] = useState(null);
    const [worker, setWorker] = useState({ name: '', phone: '' });
    const [remarkId, setRemarkId] = useState(null);
    const [remark, setRemark] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    // --- Actions ---

    const handleUpdate = async (id, status, extra = {}) => {
        try {
            const res = await fetch(`${API_BASE_URL}/complaints/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status, ...extra })
            });
            if (res.ok) {
                setAssigningId(null);
                setRemarkId(null);
                refresh();
            }
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/complaints/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setDeletingId(null);
                refresh();
            }
        } catch (error) { console.error(error); }
    };

    const saveRemark = (id) => {
        handleUpdate(id, undefined, { adminComment: remark });
    };

    // --- Filtering & Stats ---

    const filteredComplaints = useMemo(() => {
        return complaints.filter(c => {
            const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                (c.title || '').toLowerCase().includes(searchLower) ||
                (c.description || '').toLowerCase().includes(searchLower) ||
                (c.raisedBy?.name || '').toLowerCase().includes(searchLower) ||
                (c.category || '').toLowerCase().includes(searchLower);
            return matchesStatus && matchesSearch;
        });
    }, [complaints, filterStatus, searchTerm]);

    const stats = useMemo(() => {
        return {
            total: complaints.length,
            pending: complaints.filter(c => c.status === 'Pending').length,
            inProgress: complaints.filter(c => c.status === 'In Progress').length,
            resolved: complaints.filter(c => c.status === 'Resolved').length
        };
    }, [complaints]);

    const exportCSV = () => {
        alert("Exporting complaints report...");
        // Logic for CSV export can be added here
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <MessageSquare className="text-indigo-600 dark:text-indigo-400" /> Complaint Management
                </h2>
                <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                >
                    <Download size={16} /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Tickets" count={stats.total} icon={<AlertCircle size={20} />} color="blue" onClick={() => setFilterStatus('All')} active={filterStatus === 'All'} />
                <StatCard label="Pending" count={stats.pending} icon={<Clock size={20} />} color="orange" onClick={() => setFilterStatus('Pending')} active={filterStatus === 'Pending'} />
                <StatCard label="In Progress" count={stats.inProgress} icon={<UserPlus size={20} />} color="purple" onClick={() => setFilterStatus('In Progress')} active={filterStatus === 'In Progress'} />
                <StatCard label="Resolved" count={stats.resolved} icon={<CheckCircle size={20} />} color="green" onClick={() => setFilterStatus('Resolved')} active={filterStatus === 'Resolved'} />
            </div>

            {/* Filter Bar */}
            <div className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md py-4 -my-4 px-1">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title, tenant, or issue..."
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all text-sm font-medium dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto">
                        {['All', 'Pending', 'In Progress', 'Resolved'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilterStatus(tab)}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterStatus === tab
                                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
                <AnimatePresence mode='popLayout'>
                    {filteredComplaints.length > 0 ? (
                        filteredComplaints.map(c => (
                            <motion.div
                                key={c._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className={`group relative bg-white dark:bg-slate-800 border rounded-2xl overflow-hidden transition-all hover:shadow-lg ${c.status === 'Resolved' ? 'border-green-100 dark:border-green-900/30 opacity-80 hover:opacity-100' : 'border-slate-200 dark:border-slate-700'}`}
                            >
                                {/* Left Color Strip */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${c.status === 'Pending' ? 'bg-orange-500' :
                                    c.status === 'In Progress' ? 'bg-indigo-500' :
                                        'bg-green-500'
                                    }`} />

                                <div className="p-6 pl-8 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                                        {c.category}
                                                    </span>
                                                    <span className="text-xs text-slate-300 font-mono">#{c._id.slice(-6)}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{c.title}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    by <span className="font-bold text-slate-700 dark:text-slate-300">{c.raisedBy?.name || 'Unknown'}</span> <span className="mx-1">•</span> {new Date(c.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <StatusBadge status={c.status} />
                                        </div>

                                        <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                            {c.description}
                                        </p>

                                        {/* Worker Info */}
                                        {c.workerDetails && c.workerDetails.name && (
                                            <div className="flex items-center gap-3 text-sm bg-indigo-50 dark:bg-indigo-900/10 p-2 rounded-lg border border-indigo-100 dark:border-indigo-800 w-fit">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <UserPlus size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-indigo-900 dark:text-indigo-300 font-bold text-xs uppercase">Assigned Staff</p>
                                                    <p className="text-indigo-700 dark:text-indigo-400 font-medium">{c.workerDetails.name}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Remarks Section */}
                                        {(c.adminComment || remarkId === c._id) && (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-xs font-bold text-yellow-800 dark:text-yellow-500 uppercase flex items-center gap-2">
                                                        <MessageSquare size={12} /> Admin Remarks
                                                    </p>
                                                    {remarkId !== c._id && (
                                                        <button onClick={() => { setRemarkId(c._id); setRemark(c.adminComment || ''); }} className="text-[10px] font-bold text-yellow-600 hover:text-yellow-800 underline">Edit</button>
                                                    )}
                                                </div>
                                                {remarkId === c._id ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            className="flex-1 bg-white dark:bg-slate-900 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:text-white"
                                                            value={remark}
                                                            onChange={(e) => setRemark(e.target.value)}
                                                            placeholder="Enter remark..."
                                                            autoFocus
                                                            onKeyDown={(e) => e.key === 'Enter' && saveRemark(c._id)}
                                                        />
                                                        <button onClick={() => saveRemark(c._id)} className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-yellow-600">Save</button>
                                                        <button onClick={() => setRemarkId(null)} className="text-yellow-600 px-2 text-xs font-bold">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-yellow-900 dark:text-yellow-100">{c.adminComment}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Sidebar */}
                                    <div className="flex md:flex-col gap-2 md:w-56 md:border-l md:border-slate-100 dark:md:border-slate-700 md:pl-6 md:ml-2 justify-end md:justify-start">
                                        {c.status !== 'Resolved' && (
                                            <>
                                                {assigningId === c._id ? (
                                                    <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-2 animate-in slide-in-from-right-2">
                                                        <p className="text-xs font-bold text-slate-500 uppercase">Assign Details</p>
                                                        <input className="px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" placeholder="Staff Name" value={worker.name} onChange={e => setWorker({ ...worker, name: e.target.value })} />
                                                        <input className="px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white" placeholder="Phone No." value={worker.phone} onChange={e => setWorker({ ...worker, phone: e.target.value })} />
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleUpdate(c._id, 'In Progress', { workerDetails: worker })} className="flex-1 bg-indigo-600 text-white py-1 rounded text-xs font-bold">Confirm</button>
                                                            <button onClick={() => setAssigningId(null)} className="flex-1 bg-white border py-1 rounded text-xs font-bold text-slate-600">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => { setAssigningId(c._id); setWorker({ name: '', phone: '' }); }}
                                                        className="w-full flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                                    >
                                                        <UserPlus size={14} /> Assign Staff
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleUpdate(c._id, 'Resolved')}
                                                    className="w-full flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800 py-2 rounded-xl text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                                                >
                                                    <Check size={14} /> Mark Solved
                                                </button>
                                            </>
                                        )}

                                        {!c.adminComment && !remarkId && (
                                            <button
                                                onClick={() => { setRemarkId(c._id); setRemark(''); }}
                                                className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 py-2 rounded-xl text-xs font-bold hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 transition-colors"
                                            >
                                                <MessageSquare size={14} /> Add Note
                                            </button>
                                        )}

                                        <div className="md:mt-auto pt-2">
                                            <button
                                                onClick={() => setDeletingId(c._id)}
                                                className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 py-2 text-xs font-bold transition-colors"
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No complaints match your criteria.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <ConfirmationModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={() => handleDelete(deletingId)}
                title="Remove Complaint?"
                message="Are you sure you want to permanently delete this complaint ticket? This action cannot be undone."
                type="danger"
            />
        </div>
    );
};

const StatCard = ({ label, count, icon, color, onClick, active }) => {
    const styles = {
        blue: 'text-blue-600 bg-blue-50 border-blue-200 ring-blue-400 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900',
        orange: 'text-orange-600 bg-orange-50 border-orange-200 ring-orange-400 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900',
        purple: 'text-purple-600 bg-purple-50 border-purple-200 ring-purple-400 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900',
        green: 'text-green-600 bg-green-50 border-green-200 ring-green-400 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900',
    };

    return (
        <button
            onClick={onClick}
            className={`p-5 rounded-2xl border text-left transition-all hover:shadow-md ${active ? `ring-2 border-transparent ${styles[color].split(' ring-')[0]} ${styles[color].split(' ')[3]}` : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
        >
            <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${styles[color].split(' border-')[0]} ${styles[color].split(' ')[1]}`}>
                {icon}
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{count}</p>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
        </button>
    );
};

const StatusBadge = ({ status }) => {
    const colors = {
        'Pending': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
        'In Progress': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
        'Resolved': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${colors[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {status}
        </span>
    );
};

export default ComplaintsTab;
