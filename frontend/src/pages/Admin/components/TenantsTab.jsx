import React, { useState } from 'react';
import { UserPlus, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { useAlert } from '../../../context/AlertContext'; 
import { API_BASE_URL } from '../../../config';

const TenantsTab = ({ tenants, refresh, token }) => {
    const { showAlert, showConfirm } = useAlert(); 
    const [showAdd, setShowAdd] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [newTenant, setNewTenant] = useState({ name: '', email: '', password: '123', role: 'user', flatNo: '', mobile: '' });
    
    // OTP Modal States
    const [activeOTPUser, setActiveOTPUser] = useState(null);
    const [otpValue, setOtpValue] = useState('');
    const [verifying, setVerifying] = useState(false);

    const handleAdd = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newTenant)
            });
            if (res.ok) {
                await showAlert('Success', 'Resident added successfully', 'success');
                setShowAdd(false);
                setNewTenant({ name: '', email: '', password: '123', role: 'user', flatNo: '', mobile: '' });
                refresh();
            } else {
                await showAlert('Error', (await res.json()).message, 'error');
            }
        } catch (error) { console.error(error); }
    };

    const handleUpdate = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/customers/${editingTenant._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(editingTenant)
            });
            if (res.ok) {
                await showAlert('Success', 'Resident updated successfully', 'success');
                setEditingTenant(null);
                refresh();
            } else {
                await showAlert('Error', (await res.json()).message, 'error');
            }
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Remove Resident?',
            'Are you sure you want to remove this resident? This action cannot be undone.'
        );
        if (!confirmed) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/customers/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                await showAlert('Removed', 'Resident removed successfully', 'success');
                refresh();
            } else {
                await showAlert('Error', data.message || 'Failed to remove resident', 'error');
            }
        } catch (error) { 
            console.error(error); 
            await showAlert('Error', 'Network error while removing resident: ' + error.message, 'error');
        }
    };

    const handleVerifyOTP = async (userId) => {
        if (!otpValue || otpValue.length !== 6) {
            await showAlert('Invalid', 'Please enter a 6-digit code', 'error');
            return;
        }
        setVerifying(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/customers/${userId}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ otp: otpValue })
            });
            const data = await res.json();
            if (res.ok) {
                await showAlert('Success', 'Resident Verified & Activated!', 'success');
                setActiveOTPUser(null);
                setOtpValue('');
                refresh();
            } else {
                await showAlert('Invalid OTP', data.message || 'Verification failed', 'error');
            }
        } catch (error) { await showAlert('Error', error.message, 'error'); }
        finally { setVerifying(false); }
    };

    return (
        <div className="relative">
            <div className={`bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all duration-300 ${activeOTPUser ? 'blur-sm scale-[0.99] pointer-events-none' : ''}`}>
                <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50 transition-colors">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Resident Directory</h3>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => {
                                setShowAdd(!showAdd);
                                setEditingTenant(null);
                            }} 
                            className="bg-slate-900 dark:bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors"
                        >
                            <UserPlus size={18} /> {showAdd ? 'Cancel' : 'New Onboarding'}
                        </button>
                    </div>
                </div>

                {/* Add/Edit Form */}
                {(showAdd || editingTenant) && (
                    <div className="p-8 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 animate-in slide-in-from-top duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                                {editingTenant ? 'Edit Account Details' : 'New Account Registration Form'}
                            </h4>
                            {editingTenant && (
                                <button onClick={() => setEditingTenant(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                        
                        <form onSubmit={(e) => { e.preventDefault(); editingTenant ? handleUpdate() : handleAdd(); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Full Name</label>
                                <input 
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 p-4 rounded-xl text-slate-800 dark:text-white outline-none transition-colors" 
                                    placeholder="Rahul Sharma" 
                                    value={editingTenant ? editingTenant.name : newTenant.name} 
                                    onChange={e => editingTenant ? setEditingTenant({ ...editingTenant, name: e.target.value }) : setNewTenant({ ...newTenant, name: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Account Role</label>
                                <select
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 p-4 rounded-xl text-slate-800 dark:text-white outline-none transition-colors appearance-none"
                                    value={editingTenant ? editingTenant.role : newTenant.role}
                                    onChange={e => editingTenant ? setEditingTenant({ ...editingTenant, role: e.target.value }) : setNewTenant({ ...newTenant, role: e.target.value })}
                                >
                                    <option value="user">Resident (User)</option>
                                    <option value="guard">Security Guard</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Email Address (Login ID)</label>
                                <input 
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 p-4 rounded-xl text-slate-800 dark:text-white outline-none transition-colors" 
                                    placeholder="rahul@gmail.com" 
                                    value={editingTenant ? editingTenant.email : newTenant.email} 
                                    onChange={e => editingTenant ? setEditingTenant({ ...editingTenant, email: e.target.value }) : setNewTenant({ ...newTenant, email: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Unit / Post</label>
                                <input 
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 p-4 rounded-xl text-slate-800 dark:text-white outline-none transition-colors" 
                                    placeholder="A-101" 
                                    value={editingTenant ? editingTenant.flatNo : newTenant.flatNo} 
                                    onChange={e => editingTenant ? setEditingTenant({ ...editingTenant, flatNo: e.target.value }) : setNewTenant({ ...newTenant, flatNo: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Mobile Number</label>
                                <input 
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 p-4 rounded-xl text-slate-800 dark:text-white outline-none transition-colors" 
                                    placeholder="9876543210" 
                                    value={editingTenant ? (editingTenant.contactNumber || editingTenant.mobile || '') : newTenant.mobile} 
                                    onChange={e => editingTenant ? setEditingTenant({ ...editingTenant, contactNumber: e.target.value }) : setNewTenant({ ...newTenant, mobile: e.target.value })} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Update Password</label>
                                <input 
                                    type="password"
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 p-4 rounded-xl text-slate-800 dark:text-white outline-none transition-colors text-sm" 
                                    placeholder={editingTenant ? "Leave blank to keep current" : "Set password"}
                                    value={editingTenant ? (editingTenant.password || '') : newTenant.password} 
                                    onChange={e => editingTenant ? setEditingTenant({ ...editingTenant, password: e.target.value }) : setNewTenant({ ...newTenant, password: e.target.value })} 
                                />
                            </div>
                            <div className="col-span-full pt-4">
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-900/50 transition-all transform hover:scale-[1.01]">
                                    {editingTenant ? 'Update Account Information' : 'Verify & Onboard Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="p-8 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-50 dark:border-slate-700/50">
                                <th className="pb-6 px-4">Resident Info</th>
                                <th className="pb-6 px-4">Email Address</th>
                                <th className="pb-6 px-4">Flat No</th>
                                <th className="pb-6 px-4">Mobile</th>
                                <th className="pb-6 px-4">Role</th>
                                <th className="pb-6 px-4">Status</th>
                                <th className="pb-6 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700 text-sm font-medium">
                            {tenants.map(t => (
                                <tr key={t._id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                                    <td className="py-6 px-4 text-slate-800 dark:text-white font-bold">{t.name}</td>
                                    <td className="py-6 px-4 text-sm text-slate-500 dark:text-slate-400">{t.email}</td>
                                    <td className="py-6 px-4 text-sm text-slate-800 dark:text-gray-300 font-bold">{t.flatNo || '-'}</td>
                                    <td className="py-6 px-4 text-sm text-slate-500 dark:text-slate-400">{t.contactNumber || '-'}</td>
                                    <td className="py-6 px-4">
                                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase border">{t.role}</span>
                                    </td>
                                    <td className="py-6 px-4">
                                        {t.isVerified ? (
                                            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1.5 w-fit">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                Active
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1.5">
                                                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                                    Pending
                                                </span>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch(`${API_BASE_URL}/verification/resend-verification`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                                body: JSON.stringify({ userId: t._id })
                                                            });
                                                            const data = await res.json();
                                                            if (res.ok) {
                                                                // Automatically open the OTP modal
                                                                setActiveOTPUser(t);
                                                                setOtpValue('');
                                                                await showAlert('Sent!', 'OTP sent to resident. Please enter it now.', 'success');
                                                            } else { await showAlert('Failed', (data.message || 'Failed'), 'error'); }
                                                        } catch (error) { console.error(error); await showAlert('Error', error.message, 'error'); }
                                                    }}
                                                    className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-bold text-[10px] uppercase tracking-wider hover:underline pr-2 border-r border-slate-200 dark:border-slate-700"
                                                >
                                                    Resend
                                                </button>
                                                <button
                                                    onClick={() => { setActiveOTPUser(t); setOtpValue(''); }}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold text-[10px] uppercase tracking-wider hover:underline px-2 border-r border-slate-200 dark:border-slate-700"
                                                >
                                                    Enter OTP
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const confirmed = await showConfirm('Manual Activation?', `Confirm ${t.name} verified offline?`, 'Activate', 'Cancel');
                                                        if (!confirmed) return;
                                                        try {
                                                            const res = await fetch(`${API_BASE_URL}/admin/customers/${t._id}/verify-manually`, {
                                                                method: 'POST',
                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                            });
                                                            if (res.ok) { await showAlert('Verified!', 'Resident Activated!', 'success'); refresh(); }
                                                            else { await showAlert('Error', 'Verification failed.', 'error'); }
                                                        } catch (error) { await showAlert('Error', error.message, 'error'); }
                                                    }}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold text-[10px] uppercase tracking-wider hover:underline pl-2"
                                                >
                                                    Verify Now
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-6 px-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => { setEditingTenant({ ...t, password: '' }); setShowAdd(false); window.scrollTo({ top: 300, behavior: 'smooth' }); }} 
                                                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(t._id)} 
                                                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium OTP Overlay Modal */}
            {activeOTPUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setActiveOTPUser(null)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 pb-4">
                            <div className="flex justify-between items-center mb-6">
                                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Verification Required</span>
                                <button onClick={() => setActiveOTPUser(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <h4 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Enter OTP code</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
                                Please enter the 6-digit code sent to <span className="text-slate-800 dark:text-blue-400 font-bold">{activeOTPUser.contactNumber || activeOTPUser.email}</span>
                            </p>

                            <input 
                                type="text" 
                                value={otpValue}
                                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="••••••"
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 p-5 rounded-2xl text-4xl font-black tracking-[0.5em] text-center text-slate-800 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none mb-6"
                                autoFocus
                            />

                            <button 
                                onClick={() => handleVerifyOTP(activeOTPUser._id)}
                                disabled={otpValue.length !== 6 || verifying}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] mb-4 flex items-center justify-center gap-2"
                            >
                                {verifying ? <Loader2 className="animate-spin" size={18} /> : 'Verify & Activate Account'}
                            </button>
                            
                            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest mb-4">Resident: {activeOTPUser.name}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantsTab;
