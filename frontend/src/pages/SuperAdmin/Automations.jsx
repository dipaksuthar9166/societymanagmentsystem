import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { MessageSquare, Calendar, History, PlayCircle, Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle, X, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Automations = () => {
    const { user } = useAuth();
    const [automations, setAutomations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]); // Placeholder for now
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Email',
        trigger: 'MANUAL',
        content: ''
    });

    useEffect(() => {
        fetchAutomations();
    }, []);

    const fetchAutomations = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/automations`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setAutomations(data);
                // Placeholder logs
                setLogs([
                    { id: 101, tenant: 'Green Valley', society: 'Admin', time: '10:30 AM', status: 'Delivered', message: 'Subscription Renewal' }
                ]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/automations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setAutomations([data, ...automations]);
                setShowForm(false);
                setFormData({ name: '', type: 'Email', trigger: 'MANUAL', content: '' });
                alert('Automation Rule Created');
            } else {
                alert('Failed to create automation');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggle = async (id, currentStatus) => {
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/automations/${id}/toggle`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setAutomations(automations.map(a => a._id === id ? { ...a, isActive: !a.isActive } : a));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this automation rule?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/automations/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setAutomations(automations.filter(a => a._id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Scanning Transmission Nodes...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-xl text-green-600 dark:text-green-400"><CheckCircle size={24} /></div>
                    <div><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Messages Delivered</p><p className="text-2xl font-bold text-slate-800 dark:text-white">1,245</p></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-xl text-blue-600 dark:text-blue-400"><Clock size={24} /></div>
                    <div><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending Reminders</p><p className="text-2xl font-bold text-slate-800 dark:text-white">42</p></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-xl text-red-600 dark:text-red-400"><AlertCircle size={24} /></div>
                    <div><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Delivery Failures</p><p className="text-2xl font-bold text-slate-800 dark:text-white">8</p></div>
                </div>
            </div>

            {/* Automation List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Smart Automation Rules</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Define system triggers and automated workflows.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
                    >
                        <Plus size={18} /> New Rule
                    </button>
                </div>

                {showForm && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-4">
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input placeholder="Rule Name" required className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-slate-700 dark:text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <select className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer font-bold text-slate-700 dark:text-white" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="Email">Email</option>
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="SMS">SMS</option>
                                    </select>
                                    <select className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none cursor-pointer font-bold text-slate-700 dark:text-white" value={formData.trigger} onChange={e => setFormData({ ...formData, trigger: e.target.value })}>
                                        <option value="MANUAL">Manual Trigger</option>
                                        <option value="SCHEDULED_MONTHLY">Monthly Schedule</option>
                                        <option value="USER_REGISTERED">On User Signup</option>
                                        <option value="PAYMENT_FAILED">On Payment Failure</option>
                                    </select>
                                </div>
                            </div>
                            <textarea placeholder="Message Content (Supports placeholders like [Name], [Amount])" required rows="3" className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none resize-none font-medium text-slate-700 dark:text-white" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}></textarea>
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-bold">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-blue-500 font-bold shadow-lg shadow-slate-200 dark:shadow-blue-900/20">Create Automation</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 dark:text-slate-500 text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                <th className="pb-4 font-semibold">Rule Name</th>
                                <th className="pb-4 font-semibold">Channel & Trigger</th>
                                <th className="pb-4 font-semibold w-1/3">Content Preview</th>
                                <th className="pb-4 font-semibold">Activity</th>
                                <th className="pb-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {automations.length === 0 ? (
                                <tr><td colSpan="5" className="py-8 text-center text-slate-400 dark:text-slate-500 italic">No automation rules defined yet.</td></tr>
                            ) : automations.map(auto => (
                                <tr key={auto._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="py-4 font-bold text-slate-700 dark:text-white">{auto.name}</td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">{auto.type}</span>
                                            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md w-fit font-bold">{auto.trigger.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-sm text-slate-500 dark:text-slate-400 italic max-w-xs truncate" title={auto.content}>"{auto.content}"</td>
                                    <td className="py-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={auto.isActive}
                                                onChange={() => handleToggle(auto._id, auto.isActive)}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </td>
                                    <td className="py-4 space-x-3">
                                        <button className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(auto._id)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Logs Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <History size={20} className="text-blue-600 dark:text-blue-400" />
                        Communication Logs
                    </h3>
                </div>
                <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 dark:text-slate-500 text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                <th className="pb-4 font-semibold">Tenant</th>
                                <th className="pb-4 font-semibold">Society</th>
                                <th className="pb-4 font-semibold">Message</th>
                                <th className="pb-4 font-semibold">Time</th>
                                <th className="pb-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {logs.map((log, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="py-4 font-semibold text-slate-700 dark:text-white">{log.tenant}</td>
                                    <td className="py-4 text-sm text-slate-500 dark:text-slate-400">{log.society}</td>
                                    <td className="py-4 text-sm text-slate-600 dark:text-slate-300">{log.message}</td>
                                    <td className="py-4 text-xs text-slate-400 dark:text-slate-500">{log.time}</td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${log.status === 'Delivered' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                                            log.status === 'Sent' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Automations;
