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
    UserCheck
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
import ParkingSystem from './ParkingSystem';
import ConfirmationModal from '../../components/ConfirmationModal';

const AdminDashboard = () => {
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

    useEffect(() => {
        if (window.location.hash === '#billing' || window.location.hash === '#subscription') {
            setActiveTab('subscription');
        }
    }, [window.location.hash]);

    useEffect(() => {
        if (!user || !user.company) return;

        const socket = io(BACKEND_URL, { transports: ['websocket'] });
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
        { id: 'skills', label: 'Skill Approvals', icon: UserCheck },
        { id: 'parking', label: 'Parking Manager', icon: Zap },
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
        if (loading && activeTab === 'overview') return <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Control Center...</p>
        </div>;

        switch (activeTab) {
            case 'overview': return <OverviewTab stats={stats} invoices={invoices} user={user} complaints={complaints} onAction={setActiveTab} />;
            case 'user-analytics': return <UserAnalyticsTab />;
            case 'rooms': return <RoomsTab flats={flats} refresh={fetchData} token={user?.token} complaints={complaints} />;
            case 'tenants': return <TenantsTab tenants={tenants} flats={flats} refresh={fetchData} token={user?.token} />;
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
            case 'communication': return <CommunicationTab token={user?.token} societyDetails={societyDetails} />;
            case 'payment-settings': return <PaymentSettingsTab token={user?.token} />;
            case 'legal-notice': return <LegalNoticeTab society={societyDetails} />;
            case 'cctv': return <CCTVTab />;
            default: return <OverviewTab stats={stats} invoices={invoices} user={user} />;
        }
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-all duration-500 font-['Montserrat'] overflow-hidden">
            {/* Custom Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Sidebar - Floating Modern Style */}
            <aside className={`
                fixed lg:relative z-[70] h-[calc(100%-2rem)] m-4 w-72 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-[2.5rem] flex flex-col transition-all duration-500 shadow-2xl shadow-slate-200/50 dark:shadow-none
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
            `}>
                {/* Logo Section */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-4 group">
                    <div className="relative">
                        {societyDetails?.logo ? (
                            <img src={resolveImageURL(societyDetails.logo)} alt="Logo" className="w-12 h-12 rounded-2xl object-cover shadow-2xl group-hover:rotate-12 transition-transform duration-500 ring-4 ring-white dark:ring-slate-700" />
                        ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:scale-110 transition-transform duration-500">
                                {societyDetails?.name?.[0] || 'S'}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse shadow-sm"></div>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h2 className="text-lg font-black text-slate-800 dark:text-white leading-none tracking-tight truncate uppercase">
                            {societyDetails?.name?.split(' ')[0] || 'Status'}
                        </h2>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1.5 ml-0.5 whitespace-nowrap">
                            Admin Portal
                        </span>
                    </div>
                </div>

                {/* Navigation - Enhanced list */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide custom-scrollbar">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                            className={`
                                w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 relative group
                                ${activeTab === item.id
                                    ? 'bg-slate-900 border-slate-800 text-white shadow-xl shadow-slate-200/50 dark:shadow-none dark:bg-indigo-600 dark:border-indigo-500'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/40 hover:text-slate-900 dark:hover:text-white'
                                }
                            `}
                        >
                            <div className={`
                                p-2 rounded-xl transition-all duration-300
                                ${activeTab === item.id ? 'bg-white/10' : 'bg-transparent group-hover:bg-indigo-50 dark:group-hover:bg-white/5'}
                            `}>
                                <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                            </div>
                            <span className="text-sm font-bold tracking-tight">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User Card - Refined */}
                <div className="p-4 mt-auto">
                    <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-[2rem] p-4 border border-slate-100 dark:border-slate-700/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white ring-2 ring-white/50 dark:ring-slate-700">
                                {user?.name?.[0] || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800 dark:text-white truncate">{user?.name}</p>
                                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Master Admin</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-900/30 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                        >
                            <LogOut size={16} /> Secure Exit
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Modern Header */}
                <div className="px-8 pt-6 pb-2">
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
                </div>

                {/* Scrollable Content Container */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar scroll-smooth">
                    {user?.isDemo && (
                        <div className="mb-8 p-6 rounded-[2rem] bg-slate-900 dark:bg-indigo-600 text-white shadow-2xl shadow-indigo-200/40 dark:shadow-none flex items-center justify-between overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-[2s]"></div>
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
                                    <Zap className="animate-pulse text-yellow-300" size={32} />
                                </div>
                                <div className="">
                                    <h2 className="text-xl font-black uppercase tracking-[0.2em] leading-none mb-2">Simulated Insight</h2>
                                    <p className="text-sm font-bold opacity-70 max-w-md">Demo account active with pre-seeded analytics. Real-world synchronization disabled.</p>
                                </div>
                            </div>
                            <button onClick={logout} className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all shadow-xl active:scale-95 relative z-10">
                                Return to Live
                            </button>
                        </div>
                    )}

                    <div className="animate-presence">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <SubscriptionLock societyDetails={societyDetails}>
                                    {renderContent()}
                                </SubscriptionLock>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                <ChatWidget />

                <ConfirmationModal
                    isOpen={showLogoutConfirm}
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={logout}
                    title="Terminate Session?"
                    message="Are you sure you want to securely sign out of the administrator control panel?"
                    confirmText="Terminate"
                    cancelText="Stay Active"
                    type="danger"
                />
            </main>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: rgba(148, 163, 184, 0.2); 
                    border-radius: 10px; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
                    background: rgba(148, 163, 184, 0.4); 
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
