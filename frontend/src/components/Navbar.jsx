import React, { useState, useEffect } from 'react';
import { Bell, Search, Settings, User, Menu, X, Sun, Moon, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL, resolveImageURL } from '../config';

const Navbar = ({ title, showSearch = true, notifications = 0, onMenuClick, onTabChange, onLogout, rightComponent }) => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getRoleBadge = () => {
        const roleColors = {
            admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
            user: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
            superadmin: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
            guard: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
        };
        return roleColors[user?.role] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    };

    const getProfileImage = () => {
        return resolveImageURL(user?.profileImage);
    };

    return (
        <nav className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 shadow-sm transition-colors w-full">
            <div className="h-full px-4 md:px-6 flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
                    >
                        <Menu size={24} className="text-slate-600 dark:text-slate-300" />
                    </button>

                    <div className="hidden md:block min-w-0">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{getGreeting()}</p>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-none truncate">{title}</h1>
                    </div>
                    {/* Mobile Only Title */}
                    <h1 className="md:hidden text-base sm:text-lg font-bold text-slate-800 dark:text-white truncate pr-2 leading-tight">{title}</h1>
                </div>

                {/* Center Section - Real-time Clock (Desktop) */}
                <div className="hidden lg:flex flex-col items-center flex-shrink-0 px-4">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-white font-mono font-bold text-xl">
                        <Clock size={16} className="text-indigo-500 animate-pulse" />
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase truncate">
                        {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 md:gap-3 flex-1 justify-end">
                    {/* Optional Right Component (e.g. Activity Feed) */}
                    {rightComponent && (
                        <div className="shrink-0 flex items-center">
                            {rightComponent}
                        </div>
                    )}

                    {/* Search - Compact */}
                    {showSearch && (
                        <div className="hidden xl:flex relative w-48 transition-all focus-within:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                            />
                        </div>
                    )}

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            <Bell size={20} className="text-slate-600 dark:text-slate-300" />
                            {Array.isArray(notifications) && notifications.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-800"></span>
                            )}
                        </button>
                        {/* Dropdown removed for brevity, keeping existing logic if not replaced - Wait, I'm waiting creating full replacement. Need to include dropdown logic.*/}
                        {showNotifications && (
                            <div className="fixed right-4 top-16 w-[90vw] max-w-sm sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur">
                                    <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{Array.isArray(notifications) ? notifications.length : 0} New</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    {Array.isArray(notifications) && notifications.length > 0 ? (
                                        notifications.map((notif, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setShowNotifications(false);
                                                    if (notif.onClick) notif.onClick();
                                                }}
                                                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-700 transition-colors group"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">{notif.title}</p>
                                                    {notif.type && <span className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 px-1.5 py-0.5 rounded">{notif.type}</span>}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Clock size={10} />
                                                    {notif.time || 'Just now'}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-400">
                                            <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No new notifications</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                    <button
                                        onClick={() => { setShowNotifications(false); if (onTabChange) onTabChange('complaints'); }}
                                        className="w-full py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors uppercase tracking-wider"
                                    >
                                        View All Notifications
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Theme */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                    >
                        {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-slate-600" />}
                    </button>

                    {/* Profile */}
                    <div className="relative border-l border-slate-200 dark:border-slate-700 pl-3 ml-1">
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-3 p-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                        >
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                                    {getProfileImage() ? (
                                        <img src={getProfileImage()} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-bold text-sm">
                                            {user?.name?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                                {/* Online Indicator */}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                            </div>

                            <div className="hidden lg:block text-left pr-2">
                                <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">{user?.name}</p>
                                <p className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">{user?.role}</p>
                            </div>
                        </button>

                        {/* Profile Dropdown */}
                        {showProfile && (
                            <div className="fixed right-4 top-16 w-64 sm:absolute sm:right-0 sm:top-full sm:mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold overflow-hidden">
                                            {getProfileImage() ? (
                                                <img src={getProfileImage()} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{user?.name?.[0] || 'U'}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1">{user?.name}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-1">
                                    <button
                                        onClick={() => { setShowProfile(false); onTabChange('profile'); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-medium transition-colors"
                                    >
                                        <User size={16} /> My Profile
                                    </button>
                                    <button
                                        onClick={() => { setShowProfile(false); onTabChange('profile'); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-medium transition-colors"
                                    >
                                        <Settings size={16} /> Settings
                                    </button>
                                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                                    <button
                                        onClick={() => { setShowProfile(false); onLogout ? onLogout() : logout(); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav >
    );
};

export default Navbar;

