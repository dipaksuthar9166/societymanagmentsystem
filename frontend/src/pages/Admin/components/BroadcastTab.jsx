import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';
import { Send, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BroadcastTab = () => {
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);

    const handleBroadcast = async () => {
        if (!message.trim()) {
            setResult({ type: 'error', text: 'Please enter a message' });
            return;
        }

        setSending(true);
        setResult(null);

        try {
            const res = await fetch(`${API_BASE_URL}/broadcast/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ content: message })
            });

            const data = await res.json();

            if (res.ok) {
                setResult({
                    type: 'success',
                    text: `Message sent to ${data.count} residents successfully!`
                });
                setMessage('');
            } else {
                setResult({ type: 'error', text: data.message || 'Failed to send broadcast' });
            }
        } catch (error) {
            console.error('Broadcast error:', error);
            setResult({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 transition-colors">
                    <Users size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white">Broadcast Message</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Send announcements to all residents</p>
                </div>
            </div>

            {/* Broadcast Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm transition-colors"
            >
                {/* Info Banner */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 mb-6 flex items-start gap-3 transition-colors">
                    <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-bold mb-1">Important Notice</p>
                        <p>This message will be sent to <strong>all residents</strong> in your society. Use this feature for important announcements only.</p>
                    </div>
                </div>

                {/* Message Input */}
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Your Message</span>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your announcement here... (e.g., Water supply will be off from 2 PM to 4 PM today)"
                            rows={6}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
                        />
                        <span className="text-xs text-slate-400 mt-1 block">
                            {message.length} characters
                        </span>
                    </label>

                    {/* Quick Templates */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Quick Templates:</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'Water supply will be off today from 2 PM to 4 PM.',
                                'Society meeting scheduled for this Sunday at 10 AM in the clubhouse.',
                                'Maintenance payment due date is approaching. Please clear your dues.',
                                'Electricity maintenance work tomorrow. Expect brief power cuts.'
                            ].map((template, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMessage(template)}
                                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {template.substring(0, 30)}...
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleBroadcast}
                        disabled={sending || !message.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                Send to All Residents
                            </>
                        )}
                    </button>
                </div>

                {/* Result Message */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${result.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300'
                            }`}
                    >
                        {result.type === 'success' ? (
                            <CheckCircle size={20} className="flex-shrink-0" />
                        ) : (
                            <AlertCircle size={20} className="flex-shrink-0" />
                        )}
                        <p className="font-bold text-sm">{result.text}</p>
                    </motion.div>
                )}
            </motion.div>

            {/* Usage Guidelines */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 transition-colors">
                <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <AlertCircle size={18} className="text-slate-600 dark:text-slate-400" />
                    Best Practices
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                        <span>Keep messages clear and concise</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                        <span>Include specific dates and times for events</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                        <span>Use this feature only for important society-wide announcements</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                        <span>Avoid sending too many broadcasts to prevent notification fatigue</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default BroadcastTab;
