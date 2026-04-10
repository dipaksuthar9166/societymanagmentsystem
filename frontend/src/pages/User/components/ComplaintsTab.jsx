import React, { useState } from 'react';
import { API_BASE_URL } from '../../../config';
import { Plus, History, MessageSquare, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const ComplaintsTab = ({ token, refresh, complaints, isMobile }) => {
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
            }
        } catch (error) { console.error(error); }
    };

    if (isMobile) {
        return (
            <div className="space-y-6">
                {/* Premium Tab Switcher */}
                <div className="flex bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[25px] w-full sticky top-0 z-20 border border-white/50 shadow-sm">
                    <button onClick={() => setActiveTab('new')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'new' ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-slate-400'}`}>
                        <Plus size={16} /> Raise Ticket
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-slate-400'}`}>
                        <History size={16} /> Helpdesk
                    </button>
                </div>

                {activeTab === 'new' ? (
                    <div className="bg-white p-6 rounded-[40px] shadow-xl border border-slate-100 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-[30px]">
                            <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                                <MessageSquare size={28} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none mb-1">Issue Protocol</h3>
                                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em]">Priority Helpdesk Ticket</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Inquiry / Subject</label>
                                <input className="w-full bg-slate-50 border border-slate-100 rounded-[25px] p-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-300" placeholder="Summary of the issue" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Categorization</label>
                                <select className="w-full bg-slate-50 border border-slate-100 rounded-[25px] p-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 appearance-none cursor-pointer" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option>General Maintenance</option>
                                    <option>Plumbing & Water</option>
                                    <option>Electrical System</option>
                                    <option>Security & Guarding</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Detailed Description</label>
                                <textarea className="w-full bg-slate-50 border border-slate-100 rounded-[30px] p-6 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none" rows="4" placeholder="Describe the problem in detail..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <button onClick={handleSubmit} className="w-full bg-slate-900 text-white rounded-[25px] py-5 font-black uppercase tracking-[0.3em] text-xs shadow-2xl active:scale-95 transition-all">Assign To Team</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {complaints && complaints.length > 0 ? (
                            complaints.map((c) => (
                                <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-xl group active:scale-[0.98] transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <MessageSquare size={18} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-800 tracking-tight leading-none mb-1">{c.title}</h4>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.category}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : c.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${c.status === 'Resolved' ? 'bg-emerald-500' : 'bg-orange-400 animate-pulse'}`} />
                                            {c.status}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-[20px] mb-4 border border-slate-100">
                                        <p className="text-slate-600 text-xs font-medium leading-relaxed">{c.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Logged on {new Date(c.createdAt).toLocaleDateString()}</span>
                                        <span className="text-indigo-600">View ID: #{c._id?.slice(-6).toUpperCase()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                                <div className="text-center py-24 bg-white rounded-[50px] border-4 border-dashed border-slate-50">
                                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <MessageSquare size={48} className="text-indigo-200" />
                                    </div>
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Helpdesk Records</p>
                                </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ORIGINAL DESKTOP UI
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500 pb-10">
            <div className="flex justify-center bg-white dark:bg-slate-800 p-2 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 w-fit mx-auto transition-colors">
                <button onClick={() => setActiveTab('new')} className={`px-8 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'new' ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>New Complaint</button>
                <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'history' ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>History</button>
            </div>

            {activeTab === 'new' ? (
                <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4 italic">Launch Incident Protocol</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg">Report maintenance issues, plumbing problems, or any other concerns directly to the management committee.</p>
                    <div className="space-y-6">
                        <input className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400" placeholder="Incident Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-100 appearance-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            <option>General Maintenance</option>
                            <option>Plumbing & Water</option>
                            <option>Electrical</option>
                            <option>Security</option>
                            <option>Housekeeping</option>
                        </select>
                        <textarea className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none" rows="4" placeholder="Describe the issue in detail..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                        <button onClick={handleSubmit} className="w-full bg-gradient-to-r from-slate-900 to-slate-800 dark:from-indigo-600 dark:to-indigo-700 text-white rounded-[2rem] py-5 font-black uppercase tracking-[0.3em] shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">Submit Report</button>
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
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${c.status === 'Resolved' ? 'bg-green-50 text-green-600 border-green-100' : c.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                        {c.status}
                                    </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">{c.description}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[3rem] border border-dashed border-slate-200 transition-colors"><p className="text-slate-400 font-bold">No complaints found</p></div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ComplaintsTab;
