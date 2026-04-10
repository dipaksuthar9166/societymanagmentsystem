import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle2, Clock, Users, Zap } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';

const PollsTab = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPolls = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/community/polls`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPolls(data);
            }
        } catch (error) {
            console.error("Fetch Polls Error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolls();
    }, []);

    const handleVote = async (pollId, optionIndex) => {
        try {
            const res = await fetch(`${API_BASE_URL}/community/polls/${pollId}/vote`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify({ optionIndex })
            });

            if (res.ok) {
                showSuccess('Vote Cast!', 'Your response has been recorded.');
                fetchPolls(); // Refresh to show updated results
            } else {
                const errData = await res.json();
                showError('Action Denied', errData.message || 'You might have already voted.');
            }
        } catch (error) {
            showError('Error', 'Internal server error during voting.');
        }
    };

    const calculatePercentage = (votes, poll) => {
        const total = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        if (total === 0) return 0;
        return Math.round((votes / total) * 100);
    };

    const hasVoted = (poll) => {
        return poll.votedBy?.includes(user.id || user._id);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Society Polls</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest text-[9px]">Participate in Community Decision Making</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                    <Users size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Active Community</span>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse">
                    <BarChart3 size={40} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading active polls...</p>
                </div>
            ) : polls.length > 0 ? (
                <div className="space-y-6">
                    {polls.map((poll) => {
                        const alreadyVoted = hasVoted(poll);
                        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

                        return (
                            <div key={poll._id} className={`bg-white rounded-[45px] border p-8 shadow-sm transition-all ${poll.status === 'Closed' ? 'opacity-80 border-slate-100' : 'border-indigo-100 hover:shadow-2xl hover:border-indigo-200'}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-3 rounded-2xl ${poll.status === 'Closed' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <BarChart3 size={20} />
                                    </div>
                                    <div className="flex-1 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Official Decision</span>
                                            {poll.status === 'Closed' && <span className="text-[9px] font-black text-red-500 bg-red-50 w-fit px-1.5 rounded uppercase tracking-widest">Closed</span>}
                                        </div>
                                        {poll.expiresAt && (
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <Clock size={12} /> Ends: {new Date(poll.expiresAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-800 mb-8 leading-tight uppercase tracking-tight">{poll.title}</h3>
                                {poll.description && <p className="text-slate-500 text-sm mb-6 -mt-6">{poll.description}</p>}

                                <div className="space-y-4 mb-8">
                                    {poll.options.map((opt, idx) => {
                                        const percentage = calculatePercentage(opt.votes, poll);
                                        const isClosed = poll.status === 'Closed' || alreadyVoted;
                                        
                                        return (
                                            <button 
                                                key={idx}
                                                disabled={isClosed}
                                                onClick={() => handleVote(poll._id, idx)}
                                                className={`w-full group relative overflow-hidden rounded-[28px] border-2 transition-all p-5 text-left ${
                                                    alreadyVoted ? 'border-indigo-50' : 
                                                    poll.status === 'Closed' ? 'border-slate-50' : 'border-slate-100 hover:border-indigo-300 active:scale-[0.99]'
                                                }`}
                                            >
                                                {/* Percentage Background Fill */}
                                                <div 
                                                    className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${alreadyVoted ? 'bg-indigo-500/10' : 'bg-slate-50'}`} 
                                                    style={{ width: isClosed ? `${percentage}%` : '0%' }}
                                                ></div>
                                                
                                                <div className="relative flex justify-between items-center z-10 px-2">
                                                    <span className={`text-sm font-black uppercase tracking-wide ${alreadyVoted ? 'text-indigo-800' : 'text-slate-700'}`}>
                                                        {opt.text}
                                                    </span>
                                                    {isClosed && (
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-black text-indigo-600">{percentage}%</span>
                                                            {alreadyVoted && <CheckCircle2 size={18} className="text-indigo-600" />}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={14} /> {totalVotes} Verified Residents Voted
                                    </div>
                                    {!alreadyVoted && poll.status !== 'Closed' && (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                                            <Zap size={12} /> Live Voting Open
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="py-32 text-center bg-white rounded-[60px] border border-dashed border-slate-200">
                    <BarChart3 size={48} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active polls for your society right now</p>
                </div>
            )}
        </div>
    );
};

export default PollsTab;
