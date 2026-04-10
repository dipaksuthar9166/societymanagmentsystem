import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';
import { useToast } from '../../../components/ToastProvider';

const PollsTab = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [votedId, setVotedId] = useState(null);

    const fetchPolls = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/community/polls`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPolls(data);
            }
        } catch (error) {
            console.error("Polls Fetch Error", error);
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
            const data = await res.json();

            if (res.ok) {
                showSuccess("Vote Recorded", "Thank you for participating!");
                fetchPolls();
            } else {
                showError("Voting Failed", data.message || "Could not record vote.");
            }
        } catch (error) {
            showError("Network Error", "Check your connection.");
        }
    };

    const calculatePercentage = (votes, total) => {
        if (!total || total === 0) return 0;
        return Math.round((votes / total) * 100);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Polls</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest text-[10px]">Your opinion matters for the community</p>
                </div>
                {!loading && (
                    <div className="hidden md:flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl">
                        <Users size={18} />
                        <span className="text-xs font-black uppercase">{polls.length} Polls Live</span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {polls.length > 0 ? polls.map((poll) => {
                        const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
                        const hasVoted = poll.votes?.some(v => v.user.toString() === (user?.id || user?._id)?.toString());

                        return (
                            <div key={poll._id} className={`bg-white rounded-[40px] border p-8 shadow-sm transition-all ${poll.status === 'Closed' ? 'opacity-80 border-slate-100' : 'border-indigo-100 shadow-indigo-500/5 hover:shadow-xl'}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-2.5 rounded-xl ${poll.status === 'Closed' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <BarChart3 size={20} />
                                    </div>
                                    <div className="flex-1 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Official Society Poll</span>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <Clock size={12} /> {poll.expiresAt ? new Date(poll.expiresAt).toLocaleDateString() : 'Ending Soon'}
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-800 mb-8 leading-tight">{poll.title}</h3>

                                <div className="space-y-4 mb-8">
                                    {poll.options?.map((opt, idx) => {
                                        const percentage = calculatePercentage(opt.votes, totalVotes);
                                        const isSelected = hasVoted && poll.votes.find(v => v.user.toString() === (user?.id || user?._id)?.toString())?.optionIndex === idx;
                                        
                                        return (
                                            <button 
                                                key={idx}
                                                disabled={poll.status === 'Closed' || hasVoted}
                                                onClick={() => handleVote(poll._id, idx)}
                                                className={`w-full group relative overflow-hidden rounded-[25px] border-2 transition-all p-4 text-left ${
                                                    isSelected ? 'border-indigo-600 bg-indigo-50' : 
                                                    poll.status === 'Closed' ? 'border-slate-50' : 'border-slate-100 hover:border-indigo-300'
                                                }`}
                                            >
                                                <div 
                                                    className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${isSelected ? 'bg-indigo-600/10' : 'bg-slate-50'}`} 
                                                    style={{ width: hasVoted || poll.status === 'Closed' ? `${percentage}%` : '0%' }}
                                                ></div>
                                                
                                                <div className="relative flex justify-between items-center z-10">
                                                    <span className={`text-sm font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                        {opt.text}
                                                    </span>
                                                    {(hasVoted || poll.status === 'Closed') && (
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-black text-indigo-600">{percentage}%</span>
                                                            {isSelected && <CheckCircle2 size={16} className="text-indigo-600" />}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={12} /> {totalVotes} Total Votes Cast
                                    </div>
                                    {poll.status !== 'Closed' && !hasVoted && (
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Choose an option to vote</p>
                                    )}
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-20 text-slate-400">
                            <BarChart3 className="mx-auto mb-4 opacity-10" size={60} />
                            <p className="font-bold">No active polls at the moment.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PollsTab;
