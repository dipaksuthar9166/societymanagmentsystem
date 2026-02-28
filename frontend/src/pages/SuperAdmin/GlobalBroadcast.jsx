import React, { useState } from 'react';
import { Send, Users, Shield, Globe } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const GlobalBroadcast = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [target, setTarget] = useState('all_societies');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!title || !message) return alert('Please fill in all fields');
        if (!window.confirm(`Are you sure you want to send this broadcast to ${target.replace('_', ' ')}?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ title, message, target })
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                setTitle('');
                setMessage('');
            } else {
                alert(data.message || 'Failed to send broadcast');
            }
        } catch (error) {
            console.error(error);
            alert('Network Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Global Broadcast</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Send system-wide announcements</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleBroadcast} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Campaign Target</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setTarget('all_societies')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${target === 'all_societies' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 text-blue-700 dark:text-blue-300' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400'}`}
                                >
                                    <Shield size={24} />
                                    <span className="font-bold text-sm">All Society Admins</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTarget('all_users')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${target === 'all_users' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400'}`}
                                >
                                    <Users size={24} />
                                    <span className="font-bold text-sm">All System Users</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTarget('specific')}
                                    disabled
                                    className="p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center gap-2 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                >
                                    <Globe size={24} />
                                    <span className="font-bold text-sm">Specific Region (Pro)</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Announcement Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Scheduled Maintenance Notice"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Message Content</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your message here..."
                                rows="6"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                required
                            ></textarea>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-indigo-700 dark:hover:bg-blue-700 transition shadow-lg shadow-indigo-200 dark:shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : <><Send size={20} /> Send Broadcast</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Section */}
                <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                        <h3 className="font-black text-blue-800 dark:text-blue-300 text-lg mb-2">Pro Tips</h3>
                        <ul className="space-y-3 text-sm text-blue-700 dark:text-blue-400 font-medium">
                            <li className="flex items-start gap-2">
                                <span className="mt-1">•</span>
                                Use this tool for critical system updates, downtime alerts, or new feature announcements.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1">•</span>
                                "All Society Admins" targets only the master admin of each society.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1">•</span>
                                "All System Users" includes every resident, guard, and committee member. Use with caution.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Recent Broadcasts</h3>
                        <div className="space-y-4">
                            {/* Placeholder for recent history */}
                            <div className="flex items-start gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-2"></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Oct 24, 2024</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">System Maintenance Update</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-2"></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Sep 12, 2024</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">New Feature: Gate Pass</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalBroadcast;
