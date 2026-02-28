import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Globe,
    Building2,
    Zap,
    CreditCard,
    ShieldCheck,
    MessageSquare,
    ArrowUpRight,
    FileText,
    Settings,
    LogOut,
    Grid
} from 'lucide-react';

// Components
import Navbar from '../../components/Navbar';
import Societies from './Societies';
import Analysis from './Analysis';
import TrafficAnalytics from './TrafficAnalytics';
import Automations from './Automations';
import SaaSPlans from './SaaSPlans';
import SystemSettings from './SystemSettings';
import GlobalBroadcast from './GlobalBroadcast';
import SupportTickets from './SupportTickets';
import AuditLogs from './AuditLogs';
import CommunityFeatures from './CommunityFeatures';
import Inquiries from './Inquiries';

const SuperAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notifications, setNotifications] = useState(3);
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'traffic', label: 'Live Traffic', icon: Globe },
        { id: 'societies', label: 'Societies', icon: Building2 },
        { id: 'features', label: 'Community OS', icon: Grid },
        { id: 'automations', label: 'Smart Automations', icon: Zap },
        { id: 'plans', label: 'SaaS Plans', icon: CreditCard },
        { id: 'broadcast', label: 'Global Broadcast', icon: ShieldCheck },
        { id: 'support', label: 'Support Desk', icon: MessageSquare },
        { id: 'inquiries', label: 'Direct Leads', icon: ArrowUpRight },
        { id: 'audit', label: 'Audit Logs', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Analysis />;
            case 'traffic': return <TrafficAnalytics />;
            case 'societies': return <Societies />;
            case 'features': return <CommunityFeatures />;
            case 'automations': return <Automations />;
            case 'plans': return <SaaSPlans />;
            case 'broadcast': return <GlobalBroadcast />;
            case 'support': return <SupportTickets />;
            case 'inquiries': return <Inquiries />;
            case 'audit': return <AuditLogs />;
            case 'settings': return <SystemSettings />;
            default: return <Analysis />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:relative z-50 w-64 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo/Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-['Montserrat'] font-black text-xl shadow-lg border border-white/10">
                            S
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1 line-clamp-1">
                                <span className="text-sm font-['Montserrat'] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">
                                    Global
                                </span>
                                <span className="text-2xl font-['Great_Vibes'] text-indigo-600 dark:text-indigo-400 font-normal -ml-1">
                                    Control
                                </span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-['Montserrat']">System Administration</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${activeTab === item.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.[0] || 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name || 'Super Admin'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">System Owner</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 font-semibold text-sm transition-colors"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                {/* Header with Navbar */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
                    <div className="flex-1">
                        <Navbar
                            title={activeTab === 'societies' ? 'Network Overview' : activeTab.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            showSearch={true}
                            notifications={notifications}
                            onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </div>
                </div>

                {/* Content Area - Fluid Layout */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default SuperAdminDashboard;
