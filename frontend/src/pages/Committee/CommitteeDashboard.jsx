import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import { API_BASE_URL, resolveImageURL } from '../../config';
import {
    LayoutDashboard,
    Home,
    UserPlus,
    Receipt,
    Wallet,
    AlertCircle,
    Bell,
    LogOut,
    Building,
    Shield,
    Calendar,
    Menu,
    Users,
    Settings,
    MessageCircle,
    User,
    FileText,
    Truck,
    Vote,
    BarChart3
} from 'lucide-react';

// Components
import Navbar from '../../components/Navbar';
import OverviewTab from '../Admin/components/OverviewTab';
import RoomsTab from '../Admin/components/RoomsTab';
import TenantsTab from '../Admin/components/TenantsTab';
import BillingTab from '../Admin/components/BillingTab';
import ExpenseTracker from '../Admin/components/ExpenseTracker';
import DefaultersTab from '../Admin/components/DefaultersTab';
import GuardsTab from '../Admin/components/GuardsTab';
import ComplaintsTab from '../Admin/components/ComplaintsTab';
import NoticesTab from '../Admin/components/NoticesTab';
import ManageCommittee from '../Admin/components/ManageCommittee';
import FacilityBooking from '../Admin/FacilityBooking';
import ProfileTab from '../../components/ProfileTab';
import ChatWidget from '../../components/ChatWidget';
import BroadcastTab from '../Admin/components/BroadcastTab';
import EmergencyTab from '../Admin/components/EmergencyTab';

// Committee Specific Components
import MeetingTab from './components/MeetingTab';
import VendorTab from './components/VendorTab';
import FinancialReportsTab from './components/FinancialReportsTab';
import VotingTab from './components/VotingTab';
import SubscriptionLock from '../../components/SubscriptionLock';
import AdminSubscription from '../Admin/AdminSubscription';

const CommitteeDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [flats, setFlats] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [notices, setNotices] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [societyDetails, setSocietyDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Fetch relevant data based on access (Assuming backend allows read access for committee)
            const [sRes, fRes, tRes, cRes, nRes, iRes, eRes, societyRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/stats`, config),
                fetch(`${API_BASE_URL}/flats`, config),
                fetch(`${API_BASE_URL}/admin/customers`, config),
                fetch(`${API_BASE_URL}/complaints`, config),
                fetch(`${API_BASE_URL}/notices`, config),
                fetch(`${API_BASE_URL}/invoices`, config),
                fetch(`${API_BASE_URL}/expenses`, config),
                fetch(`${API_BASE_URL}/admin/society`, config)
            ]);

            if (sRes.ok) setStats(await sRes.json());
            if (fRes.ok) setFlats(await fRes.json());
            if (tRes.ok) setTenants(await tRes.json());
            if (cRes.ok) setComplaints(await cRes.json());
            if (nRes.ok) setNotices(await nRes.json());
            if (iRes.ok) setInvoices(await iRes.json());
            if (eRes.ok) setExpenses(await eRes.json());
            if (societyRes && societyRes.ok) setSocietyDetails(await societyRes.json());

        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    // Socket.io for SOS Alerts
    useEffect(() => {
        const socket = io('http://localhost:5001');
        socket.on('connect', () => {
            console.log("Committee connected to socket");
            socket.emit('join_room', 'committee');
        });

        socket.on('receive_sos', (data) => {
            // Basic alert
            // alert(`🚨 SOS ALERT! 🚨\nUser: ${data.user}`);
        });

        // Listen for Real-time Subscription Updates
        socket.on('subscription_updated', (data) => {
            console.log("Subscription Updated:", data);
            alert(`🎉 ${data.message}`);
            // Force re-fetch of society details to update SubscriptionLock
            fetchData();
        });

        return () => socket.disconnect();
    }, []);

    // Define Menu Items based on Role
    const getMenuItems = () => {
        const commonItems = [
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'notices', label: 'Notices & Circulars', icon: Bell },
            { id: 'complaints', label: 'Complaints', icon: AlertCircle },
            { id: 'voting', label: 'Voting & Decisions', icon: Vote }, // Smart Feature
        ];

        let roleItems = [];

        if (user?.role === 'chairman') {
            roleItems = [
                { id: 'meetings', label: 'Meetings (AGM/EGM)', icon: Calendar },
                { id: 'broadcast', label: 'Broadcast Message', icon: MessageCircle },
                { id: 'policies', label: 'Policy Management', icon: Shield }, // Placeholder, can re-use orcreate new
            ];
        } else if (user?.role === 'secretary') {
            roleItems = [
                { id: 'verification', label: 'Resident Verification', icon: UserPlus },
                { id: 'vendors', label: 'Vendor Management', icon: Truck },
                { id: 'facility', label: 'Facility Booking', icon: Calendar },
            ];
        } else if (user?.role === 'treasurer') {
            roleItems = [
                { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
                { id: 'expenses', label: 'Expense Tracker', icon: Wallet },
                { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
                { id: 'defaulters', label: 'Defaulters', icon: AlertCircle },
            ];
        } else {
            // General Member
            roleItems = [
                { id: 'meetings', label: 'Meetings', icon: Calendar },
            ]
        }

        // Add Profile at bottom
        return [...commonItems, ...roleItems,
        { id: 'subscription', label: 'Plan Upgrade', icon: Vote }, // Re-using icon or picking new one like CreditCard if imported
        { id: 'profile', label: 'Profile', icon: Settings }
        ];
    };

    const menuItems = getMenuItems();

    const renderContent = () => {
        if (loading && activeTab === 'overview') return <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">Loading Dashboard...</div>;

        switch (activeTab) {
            // Common
            case 'overview': return <OverviewTab stats={stats} invoices={invoices} user={user} />;
            case 'notices': return <NoticesTab notices={notices} refresh={fetchData} token={user?.token} />;
            case 'complaints': return <ComplaintsTab complaints={complaints} refresh={fetchData} token={user?.token} />;
            case 'voting': return <VotingTab token={user?.token} user={user} />;
            case 'profile': return <ProfileTab initialData={user} />;

            // Chairman
            case 'meetings': return <MeetingTab token={user?.token} user={user} />;
            case 'broadcast': return <BroadcastTab token={user?.token} />;
            case 'policies': return <div className="p-6">Policy Management Module Coming Soon</div>;

            // Secretary
            case 'verification': return <TenantsTab tenants={tenants} flats={flats} refresh={fetchData} token={user?.token} />;
            case 'vendors': return <VendorTab token={user?.token} />;
            case 'facility': return <FacilityBooking token={user?.token} user={user} />;

            // Treasurer
            case 'billing': return <BillingTab invoices={invoices} tenants={tenants} refresh={fetchData} token={user?.token} />;
            case 'expenses': return <ExpenseTracker token={user?.token} expenses={expenses} refresh={fetchData} />;
            case 'reports': return <FinancialReportsTab invoices={invoices} expenses={expenses} />;
            case 'defaulters': return <DefaultersTab invoices={invoices} />;

            case 'subscription': return <AdminSubscription token={user?.token} user={user} />;

            default: return <OverviewTab stats={stats} invoices={invoices} user={user} />;
        }
    };

    // Handle Hash Navigation for Subscription (Re-use Admin style logic)
    useEffect(() => {
        if (window.location.hash === '#billing' || window.location.hash === '#subscription') {
            setActiveTab('subscription');
        }
    }, [window.location.hash]);


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
                            <img src={resolveImageURL(societyDetails.logo)} alt="Logo" className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                                {societyDetails?.name?.[0] || 'C'}
                            </div>
                        )}
                        <div>
                            <h1 className="text-lg font-black text-slate-800 dark:text-white line-clamp-1">{user?.designation || 'Committee'}</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{societyDetails?.name || 'Society'}</p>
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
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role === 'committee_member' ? 'Member' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
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
                <Navbar
                    title={activeTab === 'overview' ? `${user?.designation || 'Committee'} Dashboard` : activeTab.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    showSearch={true}
                    notifications={[]} // Clean for now
                    onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <SubscriptionLock societyDetails={societyDetails}>
                        {renderContent()}
                    </SubscriptionLock>
                </div>

                <ChatWidget />
            </main>
        </div>
    );
};

export default CommitteeDashboard;
