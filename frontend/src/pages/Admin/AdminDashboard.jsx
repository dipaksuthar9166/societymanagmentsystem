import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import { io } from 'socket.io-client';
import { API_BASE_URL, BACKEND_URL, resolveImageURL } from '../../config';
import {
    LayoutDashboard,
    Users,
    Building,
    Receipt,
    Wallet,
    Bell,
    Settings,
    UserPlus,
    Calendar,
    MessageCircle,
    Shield,
    AlertCircle,
    AlertTriangle,
    Wrench,
    FileText,
    LogOut,
    BarChart3,
    Mail,
    CreditCard,
    Video
} from 'lucide-react';

// Components
import Navbar from '../../components/Navbar';
import LiveActivityFeed from '../../components/LiveActivityFeed';
import UserAnalyticsTab from './components/UserAnalyticsTab';
import OverviewTab from './components/OverviewTab';
import RoomsTab from './components/RoomsTab';
import TenantsTab from './components/TenantsTab';
import BillingTab from './components/BillingTab';
import ExpenseTracker from './components/ExpenseTracker';
import DefaultersTab from './components/DefaultersTab';
import GuardsTab from './components/GuardsTab';
import ComplaintsTab from './components/ComplaintsTab';
import NoticesTab from './components/NoticesTab';
import ManageCommittee from './components/ManageCommittee';
import FacilityBooking from './FacilityBooking';
import ProfileTab from '../../components/ProfileTab';
import ChatWidget from '../../components/ChatWidget';
import BroadcastTab from './components/BroadcastTab';
import EmergencyTab from './components/EmergencyTab';
import SubscriptionLock from '../../components/SubscriptionLock';
import CCTVTab from './components/CCTVTab';

import { Link } from 'react-router-dom';
import AdminSubscription from './AdminSubscription';
import AssetManagement from './AssetManagement';
import ReportsTab from './components/ReportsTab';
import CommunicationTab from './components/CommunicationTab';
import PaymentSettingsTab from './components/PaymentSettingsTab';
import LegalNoticeTab from './components/LegalNoticeTab';
import SkillAdmin from './SkillAdmin'; // New
import ParkingSystem from './ParkingSystem'; // New
import { Scale, Zap, UserCheck } from 'lucide-react'; // Added Icons
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminDashboard = () => {
    // Check URL or prop for redirect if needed, but for now state is enough
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [societyDetails, setSocietyDetails] = useState(null);
    const [flats, setFlats] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [notices, setNotices] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const { showSuccess, showWarning } = useToast();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const fetchData = async () => {
        if (user?.isDemo) {
            setStats({
                totalMembers: 142,
                totalRevenue: 450000,
                pendingComplaints: 3,
                activeNotices: 5,
                collectionEfficiency: 94
            });
            setSocietyDetails({ name: "SocietyPro Demo Residency", address: "Cyber Hub, Mumbai" });
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [sRes, fRes, tRes, cRes, nRes, iRes, societyRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/stats`, config),
                fetch(`${API_BASE_URL}/flats`, config),
                fetch(`${API_BASE_URL}/admin/customers`, config),
                fetch(`${API_BASE_URL}/complaints`, config),
                fetch(`${API_BASE_URL}/notices`, config),
                fetch(`${API_BASE_URL}/invoices`, config),
                fetch(`${API_BASE_URL}/admin/society`, config)
            ]);

            if (sRes.ok) setStats(await sRes.json());
            if (fRes.ok) setFlats(await fRes.json());
            if (tRes.ok) setTenants(await tRes.json());
            if (cRes.ok) setComplaints(await cRes.json());
            if (nRes.ok) setNotices(await nRes.json());
            if (iRes.ok) setInvoices(await iRes.json());
            if (societyRes.ok) setSocietyDetails(await societyRes.json());

        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    // Handle Hash Navigation (e.g. from SubscriptionLock)
    useEffect(() => {
        if (window.location.hash === '#billing' || window.location.hash === '#subscription') {
            setActiveTab('subscription');
        }
    }, [window.location.hash]);

    // Socket.io for SOS Alerts
    useEffect(() => {
        if (!user || !user.company) return;

        const socket = io(BACKEND_URL);
        socket.on('connect', () => {
            console.log("Admin connected to socket");
            // Join the specific society room
            socket.emit('join_society', user.company);
        });

        socket.on('receive_sos', (data) => {
            const audio = new Audio('https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a');
            audio.play().catch(e => console.log("Audio play failed", e));

            // Format Location for alert
            const locString = data.location && data.location.lat ? `${data.location.lat.toFixed(4)}, ${data.location.lng.toFixed(4)}` : "Unknown";

            showWarning('🚨 SOS ALERT! 🚨', `User: ${data.userName || data.user} | Location: ${locString}`);

            // Re-fetch data to show alert in feed if needed
            fetchData();
        });

        // Listen for Real-time Subscription Updates
        socket.on('subscription_updated', (data) => {
            console.log("Subscription Updated:", data);
            showSuccess('Subscription Event', data.message);
            fetchData();
        });

        return () => socket.disconnect();
    }, [user]);

    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'user-analytics', label: 'User Analytics', icon: BarChart3 },
        { id: 'rooms', label: 'Flat Management', icon: Building },
        { id: 'tenants', label: 'Residents', icon: Users },
        { id: 'communication', label: 'Communication & Email', icon: Mail },
        { id: 'billing', label: 'Invoices & Billing', icon: Receipt },
        { id: 'broadcast', label: 'Broadcast', icon: MessageCircle },
        { id: 'expenses', label: 'Expense Tracker', icon: Wallet },
        { id: 'defaulters', label: 'Defaulters', icon: AlertCircle },
        { id: 'guards', label: 'Security & Staff', icon: Shield },
        { id: 'cctv', label: 'CCTV Controller', icon: Video },
        { id: 'skills', label: 'Skill Approvals', icon: UserCheck }, // New
        { id: 'parking', label: 'Parking Manager', icon: Zap }, // New
        { id: 'complaints', label: 'Complaints', icon: AlertCircle },
        { id: 'notices', label: 'Notices', icon: Bell },
        { id: 'committee', label: 'Committee', icon: UserPlus },
        { id: 'facility', label: 'Facilities', icon: Calendar },
        { id: 'assets', label: 'Assets', icon: Wrench },
        { id: 'reports', label: 'Analytics & Reports', icon: FileText },
        { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
        { id: 'profile', label: 'Profile', icon: Settings },
        { id: 'subscription', label: 'Plan Upgrade', icon: Shield },
        { id: 'legal-notice', label: 'Legal Notice', icon: Scale },
        { id: 'payment-settings', label: 'Payment Gateway', icon: CreditCard },
    ];

    const renderContent = () => {
        if (loading && activeTab === 'overview') return <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">Loading Admin Dashboard...</div>;

        switch (activeTab) {
            case 'overview': return <OverviewTab stats={stats} invoices={invoices} user={user} complaints={complaints} onAction={setActiveTab} />;
            case 'user-analytics': return <UserAnalyticsTab />;
            case 'rooms': return <RoomsTab flats={flats} refresh={fetchData} token={user?.token} complaints={complaints} />;
            case 'tenants': return <TenantsTab tenants={tenants} flats={flats} refresh={fetchData} />;
            case 'billing': return <BillingTab invoices={invoices} tenants={tenants} refresh={fetchData} token={user?.token} societyDetails={societyDetails} />;
            case 'broadcast': return <BroadcastTab />;
            case 'expenses': return <ExpenseTracker token={user?.token} />;
            case 'defaulters': return <DefaultersTab invoices={invoices} />;
            case 'guards': return <GuardsTab token={user?.token} refresh={fetchData} flats={flats} />;
            case 'skills': return <SkillAdmin token={user?.token} />;
            case 'parking': return <ParkingSystem token={user?.token} />;
            case 'complaints': return <ComplaintsTab complaints={complaints} refresh={fetchData} token={user?.token} />;
            case 'notices': return <NoticesTab notices={notices} refresh={fetchData} token={user?.token} />;
            case 'committee': return <ManageCommittee refresh={fetchData} token={user?.token} />;
            case 'facility': return <FacilityBooking />;
            case 'assets': return <AssetManagement token={user?.token} />;
            case 'reports': return <ReportsTab token={user?.token} />;
            case 'emergency': return <EmergencyTab token={user?.token} />;
            case 'profile': return <ProfileTab initialData={user} societyDetails={societyDetails} refreshSociety={fetchData} />;
            case 'subscription': return <AdminSubscription token={user?.token} user={user} />;
            case 'communication': return <CommunicationTab />;
            case 'payment-settings': return <PaymentSettingsTab token={user?.token} />;
            case 'legal-notice': return <LegalNoticeTab society={societyDetails} />;
            case 'cctv': return <CCTVTab />;
            default: return <OverviewTab stats={stats} invoices={invoices} user={user} />;
        }
    };


    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
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
                        {societyDetails?.logo ? (
                            <img src={resolveImageURL(societyDetails.logo)} alt="Logo" className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm object-cover shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-['Montserrat'] font-black text-xl shadow-lg border border-white/10">
                                {societyDetails?.name?.[0] || 'A'}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1 line-clamp-1">
                                <span className="text-sm font-['Montserrat'] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">
                                    {(societyDetails?.name || 'Status').split(' ')[0]}
                                </span>
                                <span className="text-2xl font-['Great_Vibes'] text-indigo-600 dark:text-indigo-400 font-normal -ml-1">
                                    {(societyDetails?.name || 'Status Sharan').split(' ').slice(1).join(' ') || 'Sharan'}
                                </span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-['Montserrat']">Society Management</p>
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
                                {user?.name?.[0] || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 font-semibold text-sm transition-colors"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                {/* Header with Navbar and Activity Feed */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
                    <div className="flex-1">
                        <Navbar
                            title={activeTab === 'overview' ? 'Dashboard Overview' : activeTab.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            showSearch={true}
                            notifications={complaints?.filter(c => c.status === 'Pending').map(c => ({
                                title: `New Complaint: ${c.category}`,
                                time: new Date(c.createdAt).toLocaleDateString(),
                                type: 'Complaint',
                                onClick: () => {
                                    setActiveTab('complaints');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            })) || []}
                            onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            onTabChange={setActiveTab}
                            onLogout={() => setShowLogoutConfirm(true)}
                        />
                    </div>

                    {/* Live Activity Feed - Admin Only */}
                    <div className="ml-4">
                        <LiveActivityFeed token={user?.token} user={user} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {user?.isDemo && (
                        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-xl shadow-yellow-500/20 flex items-center justify-between overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12"><LayoutDashboard size={80} /></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center"><Zap className="animate-pulse" /></div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-wider leading-none mb-1">Demo Mode Active</h2>
                                    <p className="text-sm font-bold opacity-90">Exploring as a Society Administrator with pre-loaded data.</p>
                                </div>
                            </div>
                            <button onClick={logout} className="px-6 py-2.5 bg-white text-amber-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-amber-50 transition-colors shadow-lg relative z-10">Exit Demo</button>
                        </div>
                    )}
                    <SubscriptionLock societyDetails={societyDetails}>
                        {renderContent()}
                    </SubscriptionLock>
                </div>

                <ChatWidget />

                <ConfirmationModal
                    isOpen={showLogoutConfirm}
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={logout}
                    title="Sign Out?"
                    message="Are you sure you want to exit your administrator session?"
                    confirmText="Sign Out"
                    cancelText="Stay Here"
                    type="danger"
                />
            </main>
        </div>
    );
};


export default AdminDashboard;

