import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import { io } from 'socket.io-client';
import { API_BASE_URL, BACKEND_URL, resolveImageURL } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
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
    Video,
    Zap,
    Scale,
    UserCheck,
    Search,
    ShieldCheck,
    Phone
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
import AdminSubscription from './AdminSubscription';
import AssetManagement from './AssetManagement';
import ReportsTab from './components/ReportsTab';
import CommunicationTab from './components/CommunicationTab';
import PaymentSettingsTab from './components/PaymentSettingsTab';
import LegalNoticeTab from './components/LegalNoticeTab';
import SkillAdmin from './SkillAdmin';
import ResidentLookupTab from './components/ResidentLookupTab';
import ParkingSystem from './ParkingSystem';
import ConfirmationModal from '../../components/ConfirmationModal';
import DailyHelpAdmin from './components/DailyHelpAdmin';
import ChildSafetyAdmin from './components/ChildSafetyAdmin';
import usePreventBack from '../../hooks/usePreventBack';
import IntercomCallTab from '../Guard/components/IntercomCallTab';

const AdminDashboard = () => {
    usePreventBack();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [societyDetails, setSocietyDetails] = useState(null);
    const [flats, setFlats] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [notices, setNotices] = useState([]);
    const [incomingCall, setIncomingCall] = useState(null);
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

    useEffect(() => {
        if (window.location.hash === '#billing' || window.location.hash === '#subscription') {
            setActiveTab('subscription');
        }
    }, [window.location.hash]);

    useEffect(() => {
        if (!user || !user.company) return;

        const socket = io(BACKEND_URL, { transports: ['polling', 'websocket'] });
        socket.on('connect', () => {
            socket.emit('join_society', user.company);
        });

        socket.on('receive_sos', (data) => {
            const audio = new Audio('https://commondatastorage.googleapis.com/codeskulptor-assets/week7-brrring.m4a');
            audio.play().catch(e => console.log("Audio play failed", e));
            const locString = data.location && data.location.lat ? `${data.location.lat.toFixed(4)}, ${data.location.lng.toFixed(4)}` : "Unknown";
            showWarning('🚨 SOS ALERT! 🚨', `User: ${data.userName || data.user} | Location: ${locString}`);
            fetchData();
        });

        socket.on('subscription_updated', (data) => {
            showSuccess('Subscription Event', data.message);
            fetchData();
        });

        socket.on('incoming-call', (data) => {
            console.log("📞 Incoming Call for Admin:", data);
            setIncomingCall(data);
        });

        socket.on('call-rejected', () => {
             showWarning('Call Ended', 'The call was disconnected.');
        });

        return () => socket.disconnect();
    }, [user]);

    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'user-analytics', label: 'User Analytics', icon: BarChart3 },
        { id: 'lookup', label: 'Resident Lookup', icon: Search },
        { id: 'rooms', label: 'Flat Management', icon: Building },
        { id: 'tenants', label: 'Residents', icon: Users },
        { id: 'communication', label: 'Communication & Email', icon: Mail },
        { id: 'billing', label: 'Invoices & Billing', icon: Receipt },
        { id: 'broadcast', label: 'Broadcast', icon: MessageCircle },
        { id: 'expenses', label: 'Expense Tracker', icon: Wallet },
        { id: 'defaulters', label: 'Defaulters', icon: AlertCircle },
        { id: 'guards', label: 'Security Officers', icon: Shield },
        { id: 'daily-help', label: 'Daily Help Registry', icon: Users },
        { id: 'child-safety', label: 'Child Safety Logs', icon: ShieldCheck },
        { id: 'cctv', label: 'CCTV Controller', icon: Video },
        { id: 'skills', label: 'Marketplace (Skills)', icon: UserCheck },
        { id: 'parking', label: 'Parking Manager', icon: Zap },
        { id: 'complaints', label: 'Complaints', icon: AlertCircle },
        { id: 'notices', label: 'Notices', icon: Bell },
        { id: 'committee', label: 'Committee', icon: UserPlus },
        { id: 'facility', label: 'Facilities', icon: Calendar },
        { id: 'assets', label: 'Assets', icon: Wrench },
        { id: 'reports', label: 'Analytics & Reports', icon: FileText },
        { id: 'emergency', label: 'Emergency & SOS', icon: AlertTriangle },
        { id: 'profile', label: 'Profile', icon: Settings },
        { id: 'subscription', label: 'Plan Upgrade', icon: Shield },
        { id: 'legal-notice', label: 'Legal Notice', icon: Scale },
        { id: 'payment-settings', label: 'Payment Gateway', icon: CreditCard },
        { id: 'intercom', label: 'Intercom Calling', icon: Phone },
    ];

    const renderContent = () => {
        if (loading && activeTab === 'overview') return <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Control Center...</p>
        </div>;

        switch (activeTab) {
            case 'overview': return <OverviewTab stats={stats} invoices={invoices} user={user} complaints={complaints} onAction={setActiveTab} />;
            case 'user-analytics': return <UserAnalyticsTab />;
            case 'lookup': return <ResidentLookupTab tenants={tenants} invoices={invoices} complaints={complaints} flats={flats} />;
            case 'rooms': return <RoomsTab flats={flats} refresh={fetchData} token={user?.token} complaints={complaints} />;
            case 'tenants': return <TenantsTab tenants={tenants} flats={flats} refresh={fetchData} token={user?.token} />;
            case 'billing': return <BillingTab invoices={invoices} tenants={tenants} refresh={fetchData} token={user?.token} societyDetails={societyDetails} />;
            case 'broadcast': return <BroadcastTab />;
            case 'expenses': return <ExpenseTracker token={user?.token} />;
            case 'defaulters': return <DefaultersTab invoices={invoices} />;
            case 'guards': return <GuardsTab token={user?.token} refresh={fetchData} flats={flats} />;
            case 'daily-help': return <DailyHelpAdmin token={user?.token} />;
            case 'child-safety': return <ChildSafetyAdmin />;
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
            case 'communication': return <CommunicationTab token={user?.token} societyDetails={societyDetails} />;
            case 'payment-settings': return <PaymentSettingsTab token={user?.token} />;
            case 'legal-notice': return <LegalNoticeTab society={societyDetails} />;
            case 'cctv': return <CCTVTab />;
            case 'intercom': return <IntercomCallTab user={user} />;
            default: return <OverviewTab stats={stats} invoices={invoices} user={user} />;
        }
    };

    const IncomingCallModal = () => {
        if (!incomingCall) return null;
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>
                <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-[40px] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative border-4 border-indigo-500/20">
                        <Phone size={40} className="text-indigo-600 dark:text-indigo-400 animate-bounce" />
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500 animate-ping"></div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-1 uppercase tracking-tighter">Incoming Call</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 uppercase tracking-widest text-xs">
                        From: <span className="text-indigo-600 dark:text-indigo-400">{incomingCall.from}</span>
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => {
                                const socket = io(BACKEND_URL);
                                socket.emit('call-rejected', { to: incomingCall.fromId });
                                setIncomingCall(null);
                            }}
                            className="py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px]"
                        >
                            Decline
                        </button>
                        <button 
                            onClick={() => {
                                setActiveTab('intercom');
                                window.pendingIncomingCall = incomingCall; 
                                setIncomingCall(null);
                            }}
                            className="py-4 bg-emerald-500 text-white font-black rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                        >
                            <Phone size={14} /> Accept Call
                        </button>
                    </div>
                </div>
            </div>
        );
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
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        {societyDetails?.logo ? (
                            <img src={resolveImageURL(societyDetails.logo)} alt="Logo" className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm object-cover shadow-sm" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-['Montserrat'] font-black text-xl shadow-lg border border-white/10">
                                {societyDetails?.name?.[0] || 'S'}
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
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-['Montserrat']">Admin Portal</p>
                        </div>
                    </div>
                </div>

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

                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.[0] || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Master Admin</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:bg-red-900/20 font-semibold text-sm transition-colors"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <Navbar
                    title={activeTab === 'overview' ? 'Operational Hub' : activeTab.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    showSearch={true}
                    notifications={complaints?.filter(c => c.status === 'Pending').map(c => ({
                        title: `New Alert: ${c.category}`,
                        time: new Date(c.createdAt).toLocaleDateString(),
                        type: 'Alert',
                        onClick: () => setActiveTab('complaints')
                    })) || []}
                    onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    onTabChange={setActiveTab}
                    onLogout={() => setShowLogoutConfirm(true)}
                    rightComponent={<LiveActivityFeed token={user?.token} user={user} />}
                />

                <div className="flex-1 overflow-y-auto p-6">
                    {user?.isDemo && (
                        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl shadow-purple-500/20 flex items-center justify-between overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12"><LayoutDashboard size={80} /></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center"><Zap className="animate-pulse" /></div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-wider leading-none mb-1">Demo Mode Active</h2>
                                    <p className="text-sm font-bold opacity-90">Exploring as an Admin with pre-loaded data.</p>
                                </div>
                            </div>
                            <button onClick={logout} className="px-6 py-2.5 bg-white text-purple-600 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-purple-50 transition-colors shadow-lg relative z-10">Exit Demo</button>
                        </div>
                    )}
                    <SubscriptionLock societyDetails={societyDetails}>
                        {renderContent()}
                    </SubscriptionLock>
                </div>

                <IncomingCallModal />
                {incomingCall && (
                    <audio src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" autoPlay loop />
                )}
                <ChatWidget />
                <ConfirmationModal
                    isOpen={showLogoutConfirm}
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={logout}
                    title="Sign Out?"
                    message="Are you sure you want to securely end your session?"
                    confirmText="Sign Out"
                    cancelText="Keep Browsing"
                    type="danger"
                />
            </main>
        </div>
    );
};

export default AdminDashboard;
