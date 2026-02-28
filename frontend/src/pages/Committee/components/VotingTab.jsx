import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle, Clock, AlertCircle, Plus, X } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const VotingTab = ({ token, user }) => {
    const [proposals, setProposals] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Option',
        options: 'Approve, Reject'
    });

    const fetchProposals = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/committee/polls`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setProposals(await res.json());
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchProposals();
    }, [token]);

    const handleVote = async (id, optionIndex) => {
        try {
            const res = await fetch(`${API_BASE_URL}/committee/polls/${id}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ optionIndex })
            });

            if (res.ok) {
                fetchProposals();
                alert('Vote Recorded Successfully');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to vote');
            }
        } catch (error) { console.error(error); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const optionsArray = formData.options.split(',').map(o => ({ text: o.trim() }));

            const res = await fetch(`${API_BASE_URL}/committee/polls`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    type: formData.type,
                    options: optionsArray
                })
            });

            if (res.ok) {
                fetchProposals();
                setIsModalOpen(false);
                setFormData({ title: '', description: '', type: 'Option', options: 'Approve, Reject' });
                alert('Proposal Created');
            } else {
                alert('Failed to create proposal');
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Closed': return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
            case 'Open': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
            default: return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Internal Voting & Decisions</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> New Proposal
                </button>
            </div>

            <div className="grid gap-6">
                {proposals.map(proposal => (
                    <div key={proposal._id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-100 dark:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{proposal.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Proposed by <span className="font-semibold">{proposal.createdBy?.designation || proposal.createdBy?.name || 'Committee'}</span>
                                    {' '} on {new Date(proposal.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(proposal.status)}`}>
                                {proposal.status.toUpperCase()}
                            </span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors">
                            {proposal.description}
                        </p>

                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Votes Cast</h4>
                            <div className="flex flex-wrap gap-3">
                                {proposal.votes && proposal.votes.map((vote, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium transition-colors">
                                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                            {vote.user?.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-slate-700 dark:text-slate-300">{vote.user?.designation || vote.user?.name || 'Member'}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                                voted: <span className="font-bold text-indigo-600 dark:text-indigo-400">{proposal.options[vote.optionIndex]?.text}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {(!proposal.votes || proposal.votes.length === 0) && <p className="text-sm text-slate-400 dark:text-slate-500 italic">No votes yet.</p>}
                            </div>
                        </div>

                        {proposal.status === 'Open' && !proposal.userHasVoted && (
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                {proposal.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleVote(proposal._id, idx)}
                                        className={`py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors
                                            ${opt.text.toLowerCase().includes('approve') || opt.text.toLowerCase().includes('yes') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40' :
                                                opt.text.toLowerCase().includes('reject') || opt.text.toLowerCase().includes('no') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40' :
                                                    'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {opt.text}
                                    </button>
                                ))}
                            </div>
                        )}

                        {proposal.userHasVoted && (
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                                <CheckCircle size={16} className="inline mr-1" /> You have voted: {proposal.options[proposal.userVoteOption]?.text}
                            </div>
                        )}
                    </div>
                ))}
                {proposals.length === 0 && (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 transition-colors">
                        No active proposals.
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Create New Proposal</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Title</label>
                                <input
                                    type="text" required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Approve Budget for CCTV"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    required rows="3"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Details about the proposal..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Options (comma separated)</label>
                                <input
                                    type="text" required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                    value={formData.options} onChange={e => setFormData({ ...formData, options: e.target.value })}
                                    placeholder="Approve, Reject OR Yes, No"
                                />
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Proposal'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VotingTab;
