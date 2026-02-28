import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { MessageSquare, AlertCircle, CheckCircle, Clock, Send, Search } from 'lucide-react';

const SupportTickets = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reply, setReply] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/tickets`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) setTickets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!reply) return;

        try {
            const res = await fetch(`${API_BASE_URL}/tickets/${selectedTicket._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ response: reply, status: 'In Progress' })
            });
            const updatedTicket = await res.json();
            if (res.ok) {
                setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
                setSelectedTicket(updatedTicket);
                setReply('');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = async (status) => {
        try {
            const res = await fetch(`${API_BASE_URL}/tickets/${selectedTicket._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ status })
            });
            const updatedTicket = await res.json();
            if (res.ok) {
                setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
                setSelectedTicket(updatedTicket);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredTickets = tickets.filter(t =>
        (filter === 'All' || t.status === filter) &&
        (t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.societyId?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
            case 'In Progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
            case 'Resolved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
            case 'Closed': return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-100px)] gap-6 animate-in fade-in duration-500">
            {/* Ticket List */}
            <div className={`w-full md:w-1/3 flex flex-col bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white mb-4">Support Desk</h2>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                            className="w-full pl-10 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${filter === f ? 'bg-slate-800 dark:bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[500px] md:max-h-none bg-white dark:bg-slate-800">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm animate-pulse">Loading Tickets...</div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">No tickets found.</div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {filteredTickets.map(ticket => (
                                <div
                                    key={ticket._id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedTicket?._id === ticket._id ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-500 dark:border-blue-400' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1 truncate">{ticket.subject}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{ticket.description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                                            {ticket.societyId?.name?.[0] || 'S'}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{ticket.societyId?.name || 'Unknown Society'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Detail */}
            <div className={`flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="md:hidden mb-4 text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1"
                            >
                                ← Back to Tickets
                            </button>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h2 className="text-xl font-black text-slate-800 dark:text-white">{selectedTicket.subject}</h2>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                                        <span className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                                            <MessageSquare size={16} className="text-slate-400 dark:text-slate-500" />
                                            {selectedTicket.societyId?.name || 'Unknown Society'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={16} />
                                            {new Date(selectedTicket.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                    {['Open', 'Resolved', 'Closed'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            disabled={selectedTicket.status === status}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${selectedTicket.status === status ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                        >
                                            Mark {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 h-[400px] md:h-auto bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</p>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                            </div>

                            <div className="space-y-4">
                                {selectedTicket.responses?.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.sender?._id === user._id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl ${msg.sender?._id === user._id ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-200 dark:shadow-blue-900/20' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm'}`}>
                                            <p className="text-sm">{msg.message}</p>
                                            <p className={`text-[10px] mt-2 opacity-70 ${msg.sender?._id === user._id ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {new Date(msg.createdAt).toLocaleString()} • {msg.sender?.name || 'User'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reply Box */}
                        <form onSubmit={handleReply} className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                            <div className="flex gap-3">
                                <input
                                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="Type your reply..."
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="p-3 bg-indigo-600 dark:bg-blue-600 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-blue-700 transition shadow-lg shadow-indigo-200 dark:shadow-blue-900/20"
                                    onClick={handleReply}
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
                            <MessageSquare size={40} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-1">Select a Ticket</h3>
                        <p className="text-sm">Choose a ticket from the list to view details & respond.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportTickets;
