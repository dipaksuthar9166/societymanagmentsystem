import React, { useState, useEffect, useRef } from 'react';
import {
    Bell,
    CheckCircle,
    Info,
    LogIn,
    AlertTriangle,
    CreditCard,
    FileText,
    Zap,
    X,
    Filter,
    Clock,
    Activity,
    ShieldAlert,
    Download
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import io from 'socket.io-client';

// Sound Effects URLs (CDN for reliability)
const SOUNDS = {
    notification: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Gentle ping
    critical: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3' // Urgent beep
};

const LiveActivityFeed = ({ token, user }) => {
    const [activities, setActivities] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const socketRef = useRef(null);
    const dropdownRef = useRef(null);
    const audioRef = useRef(new Audio(SOUNDS.notification));
    const alertAudioRef = useRef(new Audio(SOUNDS.critical));

    // Fetch initial activities
    const fetchActivities = async () => {
        try {
            const filterParam = filter !== 'ALL' ? `&category=${filter}` : '';
            const res = await fetch(`${API_BASE_URL}/activities?limit=50${filterParam}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/activities/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            const unreadIds = activities.filter(a => !a.isRead).map(a => a._id);
            if (unreadIds.length === 0) return;

            await fetch(`${API_BASE_URL}/activities/mark-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ activityIds: unreadIds })
            });

            setUnreadCount(0);
            setActivities(prev => prev.map(a => ({ ...a, isRead: true })));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Play Sound
    const playSound = (type = 'notification') => {
        try {
            if (type === 'critical') {
                alertAudioRef.current.currentTime = 0;
                alertAudioRef.current.play().catch(e => console.log('Audio play failed', e));
            } else {
                audioRef.current.currentTime = 0;
                audioRef.current.volume = 0.5;
                audioRef.current.play().catch(e => console.log('Audio play failed', e));
            }
        } catch (e) {
            console.error("Sound Error", e);
        }
    };

    // Socket.io connection
    useEffect(() => {
        const societyId = user?.companyId || user?.society || user?.company;
        if (!societyId || !token) return;

        socketRef.current = io(API_BASE_URL, {
            auth: { token }
        });

        socketRef.current.on('connect', () => {
            socketRef.current.emit('joinSociety', societyId);
        });

        socketRef.current.on('newActivity', (activity) => {
            setActivities(prev => [activity, ...prev].slice(0, 50));
            setUnreadCount(prev => prev + 1);

            // Trigger Sound & Notification
            if (activity.category === 'CRITICAL' || activity.type === 'SOS_TRIGGERED') {
                playSound('critical');
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('🚨 CRITICAL ALERT', { body: activity.description });
                }
            } else {
                playSound('notification');
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user?.companyId, user?.society, user?.company, token]);

    useEffect(() => {
        if (token) {
            fetchActivities();
            fetchUnreadCount();
        }
    }, [filter, token]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // --- Helpers for Control Room UI ---

    const getIcon = (action, category) => {
        const props = { size: 18, strokeWidth: 2.5 };
        if (category === 'CRITICAL' || action === 'SOS_TRIGGERED') return <ShieldAlert {...props} className="text-white animate-pulse" />;
        if (action.includes('PAYMENT')) return <CreditCard {...props} className="text-emerald-500" />;
        if (action.includes('LOGIN')) return <LogIn {...props} className="text-blue-500" />;
        if (action.includes('DOC') || action.includes('DOWNLOAD')) return <Download {...props} className="text-indigo-500" />;
        if (category === 'SUCCESS') return <CheckCircle {...props} className="text-emerald-500" />;
        return <Activity {...props} className="text-slate-400" />;
    };

    const getBackground = (category, action) => {
        if (category === 'CRITICAL' || action === 'SOS_TRIGGERED') return 'bg-red-500 text-white shadow-lg shadow-red-500/40 border-red-600';
        if (action.includes('PAYMENT')) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800';
        return 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750';
    };

    const formatActionText = (text, user) => {
        // Simple parser to bold amounts or key terms
        // E.g. "Payment of ₹2000 received" -> highlight ₹2000
        const parts = text.split(/(₹[\d,]+|SOS|Answered|Missed)/g);
        return (
            <span>
                {parts.map((part, i) => {
                    if (part.startsWith('₹')) return <span key={i} className="font-bold text-emerald-600 dark:text-emerald-400">{part}</span>;
                    if (part === 'SOS') return <span key={i} className="font-black text-red-600 bg-red-100 px-1 rounded">SOS</span>;
                    return <span key={i}>{part}</span>;
                })}
            </span>
        );
    };

    const timeAgo = (date) => {
        const diff = (new Date() - new Date(date)) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div className="relative font-sans" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 border ${isOpen
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
            >
                <div className="relative">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    )}
                </div>
                <span className="text-xs font-bold hidden sm:block">Live Feed</span>
                {/* Live Pulse Dot */}
                <div className="flex items-center gap-1.5 pl-1 border-l border-slate-300 dark:border-slate-600 ml-1">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-[400px] sm:w-[500px] h-[600px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5">

                    {/* Control Room Header */}
                    <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                        <div>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Activity size={18} className="text-green-400" />
                                Control Room
                            </h3>
                            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-0.5">Real-time Society Monitor</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors border border-slate-700 uppercase tracking-wider"
                                >
                                    Clear Stream
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X size={18} className="text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 backdrop-blur-sm sticky top-0 z-10">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                            {['ALL', 'CRITICAL', 'PAYMENTS', 'LOGINS', 'COMPLAINTS'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f === 'PAYMENTS' ? 'PAYMENT' : f === 'LOGINS' ? 'LOGIN' : f)}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap uppercase tracking-wider border ${filter === (f === 'PAYMENTS' ? 'PAYMENT' : f === 'LOGINS' ? 'LOGIN' : f)
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feed Content */}
                    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-black/20 p-4 space-y-3 custom-scrollbar">
                        {activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Activity size={32} className="text-slate-400" />
                                </div>
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">System Standing By</p>
                                <p className="text-xs text-slate-400 mt-1">Waiting for user events...</p>
                            </div>
                        ) : (
                            activities.map((item) => (
                                <div
                                    key={item._id}
                                    className={`relative p-4 rounded-2xl border transition-all duration-300 group ${getBackground(item.category, item.action)}`}
                                >
                                    {/* Action Icon Absolute Positioned for 'Critical' items, otherwise inline */}
                                    <div className="flex items-start gap-4">
                                        {/* Avatar / Icon */}
                                        <div className="shrink-0 relative">
                                            {item.user?.name ? (
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                    {item.user.name.charAt(0)}
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                                    {getIcon(item.action, item.category)}
                                                </div>
                                            )}
                                            {/* Status Badge Over Avatar */}
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                                                {getIcon(item.action, item.category)}
                                            </div>
                                        </div>

                                        {/* Content Body */}
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                    {item.user?.name || 'System'}
                                                    {item.user?.flatNumber && (
                                                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-[9px] text-slate-600 dark:text-slate-300">
                                                            {item.user.flatNumber}
                                                        </span>
                                                    )}
                                                </p>
                                                <span className="text-[10px] font-mono font-medium text-slate-400 flex items-center gap-1 bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-full">
                                                    <Clock size={8} />
                                                    {timeAgo(item.createdAt)}
                                                </span>
                                            </div>

                                            <p className={`text-sm leading-relaxed ${item.category === 'CRITICAL' ? 'font-bold text-white' : 'font-medium text-slate-800 dark:text-slate-200'}`}>
                                                {formatActionText(item.description)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Status Bar */}
                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400 flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            SYSTEM OPERATIONAL
                        </span>
                        <span>SOCKET: CONNECTED</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveActivityFeed;
