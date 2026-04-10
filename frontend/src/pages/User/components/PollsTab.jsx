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
        <div className="space-y-4 animate-in slide-in-from-bottom duration-500 pb-20">
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[#0091ea] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {polls.length > 0 ? polls.map((poll) => {
                        const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
                        const hasVoted = poll.votes?.some(v => v.user.toString() === (user?.id || user?._id)?.toString());

                        return (
                            <div key={poll._id} className="bg-white rounded-[30px] border border-slate-100 p-6 shadow-sm overflow-hidden">
                                <h3 className="text-sm font-black text-slate-800 mb-6 leading-tight uppercase tracking-tight text-center">
                                    {poll.title}
                                </h3>

                                <div className="space-y-3 mb-6">
                                    {poll.options?.map((opt, idx) => {
                                        const isSelected = hasVoted && poll.votes.find(v => v.user.toString() === (user?.id || user?._id)?.toString())?.optionIndex === idx;
                                        return (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#0091ea] bg-[#0091ea]' : 'border-slate-300'}`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{opt.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Progress Bar exactly like image */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] font-black text-[#0091ea] uppercase">
                                            {Math.round((totalVotes / 215) * 100)}% Voted
                                        </span>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase">{totalVotes} / 215 Votes</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-1 justify-end">
                                                <Clock size={10} /> Time Left: 2 Days 15 Hrs
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#0091ea] transition-all duration-1000" 
                                            style={{ width: `${Math.round((totalVotes / 215) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Buttons exactly like image */}
                                <div className="flex gap-3">
                                    <button 
                                        disabled={hasVoted}
                                        className="flex-1 py-3 bg-[#0091ea] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                    >
                                        Vote Now
                                    </button>
                                    <button className="flex-1 py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                                        View Results
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-10 text-slate-400">
                            <BarChart3 className="mx-auto mb-2 opacity-10" size={40} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No active polls</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PollsTab;
