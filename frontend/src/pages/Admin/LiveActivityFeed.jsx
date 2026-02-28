import React, { useState, useEffect, useRef } from 'react';
import {
    Bell,
    User,
    CreditCard,
    FileText,
    AlertTriangle,
    CheckCircle,
    Info,
    LogIn,
    LogOut,
    X,
    Filter
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import io from 'socket.io-client';

const LiveActivityFeed = ({ token, user }) => {
    const [activities, setActivities] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('ALL'); // ALL, INFO, SUCCESS, WARNING, CRITICAL
    const socketRef = useRef(null);

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

    // Setup Socket.io for real-time updates
    useEffect(() => {
        const societyId = user?.companyId || user?.society || user?.company;
        if (!societyId || !token) return;

        console.log('[LiveActivityFeed] Connecting to Socket.io...', { societyId });

        // Connect to Socket.io
        socketRef.current = io(API_BASE_URL, {
            auth: { token }
        });

        socketRef.current.on('connect', () => {
            console.log('[LiveActivityFeed] Socket connected!', socketRef.current.id);
            // Join society room
            socketRef.current.emit('joinSociety', societyId);
            console.log('[LiveActivityFeed] Joined society room:', societyId);
        });

        // Listen for new activities
        socketRef.current.on('newActivity', (activity) => {
            console.log('[LiveActivityFeed] New activity received:', activity);
            setActivities(prev => [activity, ...prev].slice(0, 50));
            setUnreadCount(prev => prev + 1);

            // Show browser notification for critical activities
            if (activity.category === 'CRITICAL' && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                    new Notification('Critical Alert!', {
                        body: activity.description,
                        icon: '/logo.png',
                        tag: activity._id
                    });
                }
            }
        });

        socketRef.current.on('disconnect', () => {
            console.log('[LiveActivityFeed] Socket disconnected');
        });

        return () => {
            if (socketRef.current) {
                console.log('[LiveActivityFeed] Disconnecting socket...');
                socketRef.current.disconnect();
            }
        };
    }, [user?.companyId, user?.society, user?.company, token]);

    // Fetch activities on mount and filter change
    useEffect(() => {
        fetchActivities();
        fetchUnreadCount();
    }, [filter]);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Get icon based on action
    const getActivityIcon = (action, category) => {
        const iconProps = { size: 18 };

        if (category === 'CRITICAL') return <AlertTriangle {...iconProps} className="text-red-500" />;
        if (category === 'SUCCESS') return <CheckCircle {...iconProps} className="text-green-500" />;
        if (category === 'WARNING') return <Info {...iconProps} className="text-amber-500" />;

        switch (action) {
            case 'LOGIN':
            case 'LOGOUT':
                return <LogIn {...iconProps} className="text-blue-500" />;
            case 'PAYMENT_SUCCESS':
            case 'PAYMENT_INITIATED':
                return <CreditCard {...iconProps} className="text-green-500" />;
            case 'DOCUMENT_UPLOADED':
            case 'DOCUMENT_DOWNLOADED':
                return <FileText {...iconProps} className="text-indigo-500" />;
            case 'EMERGENCY_ALERT':
            case 'SOS_TRIGGERED':
                return <AlertTriangle {...iconProps} className="text-red-500" />;
            default:
                return <Info {...iconProps} className="text-slate-500" />;
        }
    };

    // Get category badge color
    const getCategoryColor = (category) => {
        switch (category) {
            case 'CRITICAL':
                return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50';
            case 'SUCCESS':
                return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50';
            case 'WARNING':
                return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
            default:
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50';
        }
    };

    // Format time ago
    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <>
            {/* Bell Icon with Badge */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <Bell size={20} className="text-slate-700 dark:text-slate-300" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Activity Panel */}
                {isOpen && (
                    <div className="absolute right-0 top-14 w-96 max-h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col transition-colors">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Live Activity</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread notifications</p>
                            </div>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <X size={18} className="text-slate-500 dark:text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex gap-1 overflow-x-auto">
                            {['ALL', 'CRITICAL', 'SUCCESS', 'WARNING', 'INFO'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${filter === f
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Activity List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {activities.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No activities yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {activities.map((activity) => (
                                        <div
                                            key={activity._id}
                                            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!activity.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                {/* Icon */}
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getCategoryColor(activity.category)} border`}>
                                                    {getActivityIcon(activity.action, activity.category)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white mb-1">
                                                        {activity.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="font-medium">
                                                            {activity.user?.name || 'System'}
                                                        </span>
                                                        {activity.user?.flatNumber && (
                                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold">
                                                                {activity.user.flatNumber}
                                                            </span>
                                                        )}
                                                        <span>•</span>
                                                        <span>{timeAgo(activity.createdAt)}</span>
                                                    </div>
                                                </div>

                                                {/* Unread Indicator */}
                                                {!activity.isRead && (
                                                    <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-2"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default LiveActivityFeed;
