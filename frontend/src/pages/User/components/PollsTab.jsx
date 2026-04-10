import React, { useState } from 'react';
import { BarChart3, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';

const PollsTab = () => {
    const [votedId, setVotedId] = useState(null);

    const mockPolls = [
        {
            id: 1,
            question: 'Should we extend the society swimming pool hours for the summer season?',
            options: [
                { id: 'a', text: 'Yes, keep it open until 10 PM', votes: 42 },
                { id: 'b', text: 'No, let it be 8 PM', votes: 15 },
                { id: 'c', text: 'Only on weekends', votes: 23 }
            ],
            totalVotes: 80,
            endTime: 'Tomorrow, 6 PM',
            isClosed: false
        },
        {
            id: 2,
            question: 'Preferences for the upcoming Annual Cultural Night theme?',
            options: [
                { id: 'a', text: 'Bollywood Retro', votes: 65 },
                { id: 'b', text: 'Traditional Fusion', votes: 45 },
                { id: 'c', text: 'Goan Carnival', votes: 30 }
            ],
            totalVotes: 140,
            endTime: 'Expired 2 days ago',
            isClosed: true
        }
    ];

    const calculatePercentage = (votes, total) => {
        return Math.round((votes / total) * 100);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Polls</h2>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest text-[10px]">Your opinion matters for the community</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl">
                    <Users size={18} />
                    <span className="text-xs font-black uppercase">240 Residents Active</span>
                </div>
            </div>

            <div className="space-y-6">
                {mockPolls.map((poll) => (
                    <div key={poll.id} className={`bg-white rounded-[40px] border p-8 shadow-sm transition-all ${poll.isClosed ? 'opacity-80 border-slate-100' : 'border-indigo-100 shadow-indigo-500/5 hover:shadow-xl'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2.5 rounded-xl ${poll.isClosed ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'}`}>
                                <BarChart3 size={20} />
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Official Society Poll</span>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <Clock size={12} /> {poll.endTime}
                                </div>
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-slate-800 mb-8 leading-tight">{poll.question}</h3>

                        <div className="space-y-4 mb-8">
                            {poll.options.map((opt) => {
                                const percentage = calculatePercentage(opt.votes, poll.totalVotes);
                                const isSelected = votedId === `${poll.id}-${opt.id}`;
                                
                                return (
                                    <button 
                                        key={opt.id}
                                        disabled={poll.isClosed || votedId?.startsWith(poll.id)}
                                        onClick={() => setVotedId(`${poll.id}-${opt.id}`)}
                                        className={`w-full group relative overflow-hidden rounded-[25px] border-2 transition-all p-4 text-left ${
                                            isSelected ? 'border-indigo-600 bg-indigo-50' : 
                                            poll.isClosed ? 'border-slate-50' : 'border-slate-100 hover:border-indigo-300'
                                        }`}
                                    >
                                        <div 
                                            className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${isSelected ? 'bg-indigo-600/10' : 'bg-slate-50'}`} 
                                            style={{ width: (votedId?.startsWith(poll.id) || poll.isClosed) ? `${percentage}%` : '0%' }}
                                        ></div>
                                        
                                        <div className="relative flex justify-between items-center z-10">
                                            <span className={`text-sm font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                {opt.text}
                                            </span>
                                            {(votedId?.startsWith(poll.id) || poll.isClosed) && (
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
                                <Users size={12} /> {poll.totalVotes} Total Votes Cast
                            </div>
                            {!poll.isClosed && !votedId?.startsWith(poll.id) && (
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Choose an option to vote</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PollsTab;
