import React, { useState } from 'react';
import { API_BASE_URL } from '../../../config';

const ComplaintsTab = ({ token, refresh, complaints }) => {
    const [formData, setFormData] = useState({ title: '', description: '', category: 'General' });
    const [activeTab, setActiveTab] = useState('new');

    const handleSubmit = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/complaints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ title: '', description: '', category: 'General' });
                refresh();
                setActiveTab('history');
                alert('Complaint Registered Successfully');
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
            {/* Toggle Tabs */}
            <div className="flex justify-center bg-white dark:bg-slate-800 p-2 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 w-fit mx-auto transition-colors">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`px-8 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'new' ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    New Complaint
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-8 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'history' ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    History
                </button>
            </div>

            {activeTab === 'new' ? (
                <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4 italic">Launch Incident Protocol</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg">Report maintenance issues, plumbing problems, or any other concerns directly to the management committee.</p>

                    <div className="space-y-6">
                        <div>
                            <input className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all placeholder:text-slate-400" placeholder="Incident Title (e.g., Leaking Tap)" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] pl-4 mb-2 block">Category</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all appearance-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option>General Maintenance</option>
                                    <option>Plumbing & Water</option>
                                    <option>Electrical</option>
                                    <option>Security</option>
                                    <option>Housekeeping</option>
                                    <option>Billing Issue</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] pl-4 mb-2 block">Detailed Description</label>
                            <textarea className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all resize-none placeholder:text-slate-400" rows="4" placeholder="Describe the issue in detail..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                        </div>
                        <button onClick={handleSubmit} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 dark:from-indigo-600 dark:to-indigo-700 text-white rounded-[2rem] py-5 font-black uppercase tracking-[0.3em] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300">
                            Submit Report
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {complaints && complaints.length > 0 ? (
                        complaints.map((c) => (
                            <div key={c._id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex gap-2 items-center mb-1">
                                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{c.category}</span>
                                            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold">{new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-white">{c.title}</h4>
                                    </div>
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${c.status === 'Resolved' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' :
                                        c.status === 'In Progress' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800' :
                                            'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800'
                                        }`}>
                                        {c.status}
                                    </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl mb-4 border border-transparent dark:border-slate-700/50">{c.description}</p>

                                {c.adminComment && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-700/30">
                                        <p className="text-[10px] font-black text-yellow-700 dark:text-yellow-500 uppercase tracking-wider mb-1">Admin Response</p>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">{c.adminComment}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700 transition-colors">
                            <p className="text-slate-400 font-bold">No complaints found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ComplaintsTab;
