import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';
import { useToast } from '../../../components/ToastProvider';
import { 
    UserCheck, 
    UserX, 
    Shield, 
    Building, 
    Mail, 
    Phone, 
    Clock,
    CheckCircle,
    XCircle,
    Search
} from 'lucide-react';

const ApprovalsTab = ({ token, refresh }) => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const { showSuccess, showError } = useToast();

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/customers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter for pending only
                setPendingUsers(data.filter(u => u.status === 'Pending' || !u.isApproved));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, [token]);

    const handleApproval = async (userId, isApproved) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/customers/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: isApproved ? 'Active' : 'Rejected', isApproved })
            });

            if (res.ok) {
                showSuccess('Update Successful', `User has been ${isApproved ? 'approved' : 'rejected'}.`);
                fetchPending();
                if (refresh) refresh();
            } else {
                showError('Error', 'Failed to update user status.');
            }
        } catch (err) {
            showError('Server Error', 'Could not reach server.');
        }
    };

    const filteredUsers = pendingUsers.filter(u => 
        u.name?.toLowerCase().includes(filter.toLowerCase()) || 
        u.flatNo?.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading && pendingUsers.length === 0) return <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Scanning for new residents...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Access Approvals</h2>
                    <p className="text-slate-500 text-sm font-bold">Manage new registration requests for your society.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or flat..." 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                    <div key={u._id} className="bg-white border border-slate-200 rounded-[30px] p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Shield size={60} /></div>
                        
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm">
                                {u.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-slate-800 truncate">{u.name}</h3>
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <Building size={14} />
                                    <span className="text-xs font-black uppercase">Flat {u.flatNo || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-slate-500">
                                <Mail size={16} />
                                <span className="text-xs font-bold truncate">{u.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500">
                                <Phone size={16} />
                                <span className="text-xs font-bold">{u.mobile || 'No Mobile'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Clock size={16} />
                                <span className="text-[10px] font-black uppercase tracking-wider">Applied {new Date(u.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleApproval(u._id, false)}
                                className="flex-1 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <XCircle size={14} /> Reject
                            </button>
                            <button 
                                onClick={() => handleApproval(u._id, true)}
                                className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={14} /> Approve
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <UserCheck size={32} />
                        </div>
                        <h4 className="text-slate-400 font-black uppercase tracking-widest text-sm">All Clear!</h4>
                        <p className="text-slate-400 text-xs font-bold">No pending registration requests at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApprovalsTab;
