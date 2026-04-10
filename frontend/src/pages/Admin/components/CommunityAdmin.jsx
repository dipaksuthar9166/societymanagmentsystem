import React, { useState, useEffect } from 'react';
import { BarChart3, MessageSquare, Plus, Trash2, Clock, Users, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';
import { useToast } from '../../../components/ToastProvider';

const CommunityAdmin = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const [polls, setPolls] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPollModal, setShowPollModal] = useState(false);
    
    // New Poll State
    const [newPoll, setNewPoll] = useState({
        title: '',
        options: ['', ''],
        expiresAt: ''
    });

    const refreshData = async () => {
        try {
            const [pRes, fRes] = await Promise.all([
                fetch(`${API_BASE_URL}/community/polls`, { headers: { Authorization: `Bearer ${user.token}` } }),
                fetch(`${API_BASE_URL}/community/forum`, { headers: { Authorization: `Bearer ${user.token}` } })
            ]);
            if (pRes.ok) setPolls(await pRes.json());
            if (fRes.ok) setPosts(await fRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: newPoll.title,
                options: newPoll.options.map(opt => ({ text: opt, votes: 0 })),
                expiresAt: newPoll.expiresAt,
                company: user.company,
                status: 'Open'
            };

            const res = await fetch(`${API_BASE_URL}/admin/community/polls`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showSuccess("Poll Published", "Residents can now vote!");
                setShowPollModal(false);
                setNewPoll({ title: '', options: ['', ''], expiresAt: '' });
                refreshData();
            }
        } catch (error) {
            showError("Failed", "Check if all fields are filled.");
        }
    };

    const deletePoll = async (id) => {
        if (!window.confirm("Delete this poll?")) return;
        try {
            await fetch(`${API_BASE_URL}/admin/community/polls/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            showSuccess("Deleted", "Poll removed.");
            refreshData();
        } catch (error) {
            showError("Error", "Could not delete.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-[30px] shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Community Governance</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage society engagement and decisions</p>
                </div>
                <button 
                    onClick={() => setShowPollModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#0091ea] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                    <Plus size={18} /> New Poll
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Polls Management */}
                <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <BarChart3 size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Live Poll Analytics</h3>
                    </div>

                    <div className="space-y-4">
                        {polls.map(poll => (
                            <div key={poll._id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-sm font-black text-slate-800 pr-8">{poll.title}</h4>
                                    <button onClick={() => deletePoll(poll._id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {poll.options.map((opt, i) => (
                                        <div key={i} className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                                            <span>{opt.text}</span>
                                            <span>{opt.votes} Votes</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Forum Moderation */}
                <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <MessageSquare size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Social Stream</h3>
                    </div>

                    <div className="space-y-4">
                        {posts.map(post => (
                            <div key={post._id} className="p-5 border border-slate-50 rounded-3xl group hover:bg-slate-50 transition-all">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black">{post.author?.name?.[0]}</div>
                                        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{post.author?.name}</span>
                                    </div>
                                    <button className="text-slate-300 hover:text-red-500">
                                        <ShieldCheck size={16} />
                                    </button>
                                </div>
                                <p className="text-xs font-bold text-slate-800 mb-1">{post.title}</p>
                                <p className="text-[10px] text-slate-400 truncate">{post.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Poll Creation Modal */}
            {showPollModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPollModal(false)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-black text-slate-800 mb-6">Create Global Poll</h2>
                        
                        <div className="space-y-4 font-bold text-slate-600">
                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Polling Question</label>
                                <input 
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-[#0091ea]/20"
                                    placeholder="Ex: Next society party date?"
                                    value={newPoll.title}
                                    onChange={e => setNewPoll({...newPoll, title: e.target.value})}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Options</label>
                                {newPoll.options.map((opt, i) => (
                                    <input 
                                        key={i}
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none"
                                        placeholder={`Option ${i+1}`}
                                        value={opt}
                                        onChange={e => {
                                            const newOpts = [...newPoll.options];
                                            newOpts[i] = e.target.value;
                                            setNewPoll({...newPoll, options: newOpts});
                                        }}
                                    />
                                ))}
                                <button 
                                    onClick={() => setNewPoll({...newPoll, options: [...newPoll.options, '']})}
                                    className="text-[10px] uppercase font-black text-[#0091ea] ml-1"
                                >+ Add Option</button>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 ml-1">Expiry Date</label>
                                <input 
                                    type="date"
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none"
                                    value={newPoll.expiresAt}
                                    onChange={e => setNewPoll({...newPoll, expiresAt: e.target.value})}
                                />
                            </div>

                            <button 
                                onClick={handleCreatePoll}
                                className="w-full py-4 bg-[#0091ea] text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4"
                            >Publish to Residents</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityAdmin;
