import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Plus, Clock, CheckCircle, X } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const MeetingTab = ({ token, user }) => {
    const [meetings, setMeetings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        type: 'General',
        agenda: ''
    });

    const fetchMeetings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/committee/meetings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setMeetings(await res.json());
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, [token]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Combine date and time
            const dateObj = new Date(`${formData.date}T${formData.time}`);

            const res = await fetch(`${API_BASE_URL}/committee/meetings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, date: dateObj })
            });

            if (res.ok) {
                fetchMeetings();
                setIsModalOpen(false);
                setFormData({ title: '', date: '', time: '', type: 'General', agenda: '' });
                alert('Meeting Scheduled Successfully');
            } else {
                alert('Failed to schedule meeting');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Meeting Management</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={18} /> Schedule Meeting
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meetings.map(meeting => (
                    <div key={meeting._id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-colors">
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10 ${meeting.status === 'Scheduled' ? 'bg-green-500' : 'bg-slate-500'
                            }`} />

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Calendar size={24} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${meeting.status === 'Scheduled' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}>
                                {meeting.status}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">{meeting.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{meeting.agenda}</p>

                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                            <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(meeting.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            {/* Placeholder buttons for future functionality */}
                            <button className="flex-1 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg dark:bg-indigo-900/20 dark:text-indigo-400 transition-colors">
                                View Agenda
                            </button>
                            {meeting.status === 'Completed' && (
                                <button className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg dark:bg-slate-700 dark:text-slate-300 transition-colors">
                                    Upload MoM
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {meetings.length === 0 && (
                    <div className="col-span-full p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 transition-colors">
                        No meetings scheduled.
                    </div>
                )}
            </div>

            {/* Create Meeting Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Schedule New Meeting</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Annual General Meeting"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Type</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="General">General</option>
                                    <option value="AGM">AGM</option>
                                    <option value="EGM">EGM</option>
                                    <option value="Committee">Committee Only</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Agenda</label>
                                <textarea
                                    rows="3"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                    value={formData.agenda}
                                    onChange={e => setFormData({ ...formData, agenda: e.target.value })}
                                    placeholder="Brief details about the meeting..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Scheduling...' : 'Schedule Meeting'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingTab;
