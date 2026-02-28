import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAlert } from '../../../context/AlertContext'; // Updated import path

const TenantsTab = ({ tenants, refresh, token }) => {
    const { showAlert, showConfirm } = useAlert(); // Hook
    const [showAdd, setShowAdd] = useState(false);
    const [newTenant, setNewTenant] = useState({ name: '', email: '', password: '123' });

    const handleAdd = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/admin/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newTenant)
            });
            if (res.ok) {
                await showAlert('Success', 'Resident added successfully', 'success');
                setShowAdd(false);
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
            const res = await fetch(`http://localhost:5001/api/admin/customers/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                await showAlert('Removed', 'Resident removed successfully', 'success');
                refresh();
            } else {
                await showAlert('Error', 'Failed to remove resident', 'error');
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50 transition-colors">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Resident Directory</h3>
                <div className="flex gap-4">
                    <button onClick={() => setShowAdd(!showAdd)} className="bg-slate-900 dark:bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors">
                        <UserPlus size={18} /> {showAdd ? 'Cancel' : 'New Onboarding'}
                    </button>
                </div>
            </div>

            {showAdd && (
                <div className="p-8 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 animate-in slide-in-from-top duration-300">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-blue-600 dark:text-blue-400">New Account Registration Form</h4>
                    <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Full Name</label>
                            <input className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 p-4 rounded-xl text-slate-800 dark:text-white outline-none transition-colors" placeholder="e.g. Rahul Sharma" value={newTenant.name} onChange={e => setNewTenant({ ...newTenant, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Account Role</label>
                            <select
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 p-4 rounded-xl text-slate-800 dark:text-white outline-none transition-colors appearance-none"
                                value={newTenant.role || 'user'}
                                onChange={e => setNewTenant({ ...newTenant, role: e.target.value })}
                            >
                                <option value="user" className="bg-white dark:bg-slate-800">Resident (User)</option>
                                <option value="guard" className="bg-white dark:bg-slate-800">Security Guard</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Email Address (Login ID)</label>
                            <input className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 p-4 rounded-xl text-slate-800 dark:text-white outline-none transition-colors" placeholder="e.g. rahul@gmail.com" value={newTenant.email} onChange={e => setNewTenant({ ...newTenant, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Unit / Post</label>
                            <input className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 p-4 rounded-xl text-slate-800 dark:text-white outline-none transition-colors" placeholder="e.g. A-101 OR Main Gate" value={newTenant.flatNo || ''} onChange={e => setNewTenant({ ...newTenant, flatNo: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Mobile Number</label>
                            <input className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 p-4 rounded-xl text-slate-800 dark:text-white outline-none transition-colors" placeholder="e.g. 9876543210" value={newTenant.mobile || ''} onChange={e => setNewTenant({ ...newTenant, mobile: e.target.value })} />
                        </div>
                        <div className="col-span-full pt-4">
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-900/50 transition-all transform hover:scale-[1.01]">
                                Verify & Onboard Account
                            </button>
                            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-4">* Default password will be set to '123'. User can change it later.</p>
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
                                                        const res = await fetch('http://localhost:5001/api/verification/resend-verification', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({ userId: t._id })
                                                        });

                                                        const data = await res.json();

                                                        if (res.ok) {
                                                            if (data.verificationLink) {
                                                                // Email service not configured - show link
                                                                const confirmLink = await showConfirm(
                                                                    'Email Service Not Configured',
                                                                    'The backend email service is not set up.\n\nDo you want to copy the verification link to share it manually?',
                                                                    'Copy Link',
                                                                    'Cancel'
                                                                );

                                                                if (confirmLink) {
                                                                    navigator.clipboard.writeText(data.verificationLink);
                                                                    await showAlert('Copied!', 'Verification link copied to clipboard.', 'success');
                                                                }
                                                            } else {
                                                                await showAlert('Sent!', 'Verification email sent successfully.', 'success');
                                                            }
                                                        } else {
                                                            await showAlert('Failed', (data.message || 'Failed to send email'), 'error');
                                                        }
                                                    } catch (error) {
                                                        console.error(error);
                                                        await showAlert('Error', error.message, 'error');
                                                    }
                                                }}
                                                className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-bold text-[10px] uppercase tracking-wider hover:underline transition-colors"
                                                title="Resend verification email"
                                            >
                                                Resend
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td className="py-6 px-4 text-right">
                                    <button onClick={() => handleDelete(t._id)} className="text-red-500 dark:text-red-400 font-bold hover:underline text-xs">Remove</button>
                                </td>
                            </tr>
                        ))}
                        {tenants.length === 0 && <tr><td colSpan="7" className="py-10 text-center text-slate-400 italic">No residents onboarded yet.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TenantsTab;
