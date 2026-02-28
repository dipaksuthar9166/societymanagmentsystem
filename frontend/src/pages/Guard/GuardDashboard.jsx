import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';
import { API_BASE_URL, resolveImageURL } from '../../config';
import {
    LayoutDashboard,
    UserPlus,
    Shield,
    Box,
    ScanLine,
    LogOut,
    Users,
    Activity,
    CreditCard,
    Search,
    Zap,
    Video
} from 'lucide-react';
import SOSButton from '../../components/SOSButton';
import SubscriptionLock from '../../components/SubscriptionLock';
import ConfirmationModal from '../../components/ConfirmationModal';
import Navbar from '../../components/Navbar';

// Charts
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Import Sub-Components
import VisitorTab from './components/VisitorTab';
import ParcelTab from './components/ParcelTab';
import StaffTab from './components/StaffTab';
import ScanTab from './components/ScanTab';
import GuardParking from './components/GuardParking';
import AdminSubscription from '../Admin/AdminSubscription';
import ChatWidget from '../../components/ChatWidget';
import CCTVTab from '../Admin/components/CCTVTab';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const GuardDashboard = () => {
    const { user, logout } = useAuth();
    const { showSuccess, showWarning } = useToast();
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Vehicle Search State
    const [plateNo, setPlateNo] = useState('');
    const [vehicleRes, setVehicleRes] = useState(null);

    // Analytics State
    const [stats, setStats] = useState({
        weekly: [0, 0, 0, 0, 0, 0, 0],
        types: [0, 0, 0, 0],
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        notifications: []
    });
    const [societyDetails, setSocietyDetails] = useState(null);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/guard/visitors`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    const visitors = await res.json();

                    // 1. Weekly Traffic Logic
                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const today = new Date();
                    const last7Days = [];
                    const trafficCounts = [0, 0, 0, 0, 0, 0, 0];

                    for (let i = 6; i >= 0; i--) {
                        const d = new Date(today);
                        d.setDate(today.getDate() - i);
                        last7Days.push(days[d.getDay()]);
                    }

                    visitors.forEach(v => {
                        const visitDate = new Date(v.createdAt); // Use createdAt for consistency
                        const diffTime = Math.abs(today - visitDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays <= 7) {
                            const dayIndex = 6 - (Math.floor((today - visitDate) / (1000 * 60 * 60 * 24)));
                            if (dayIndex >= 0 && dayIndex <= 6) {
                                trafficCounts[dayIndex]++;
                            }
                        }
                    });

                    // 2. Entry Type Breakdown
                    const typeCounts = [0, 0, 0, 0];
                    visitors.forEach(v => {
                        if (v.visitorType === 'Guest') typeCounts[0]++;
                        else if (v.visitorType === 'Delivery') typeCounts[1]++;
                        else if (v.visitorType === 'Service') typeCounts[2]++;
                        else typeCounts[3]++; // Cab/Other
                    });

                    // 3. Fake Notifications for now (or extract from recent visitors)
                    const recentVisitors = visitors.slice(0, 5).map(v => ({
                        title: `New Entry: ${v.name || 'Visitor'}`,
                        time: new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        type: v.visitorType,
                        onClick: () => setActiveTab('visitor')
                    }));

                    setStats({
                        weekly: trafficCounts,
                        types: typeCounts,
                        labels: last7Days,
                        notifications: recentVisitors
                    });
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        if (activeTab === 'overview') {
            fetchStats();
        }
    }, [activeTab, user.token]);

    useEffect(() => {
        const fetchSocietyDetails = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/admin/society`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                if (res.ok) {
                    setSocietyDetails(await res.json());
                }
            } catch (error) {
                console.error("Error fetching society details:", error);
            }
        };
        fetchSocietyDetails();
    }, [user.token]);


    const handleVehicleSearch = async (e) => {
        e.preventDefault();
        if (!plateNo) return;
        try {
            const res = await fetch(`${API_BASE_URL}/guard/vehicle-search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ plateNo: plateNo.toUpperCase() })
            });
            const data = await res.json();
            if (data.found) {
                setVehicleRes({
                    owner: data.owner.name,
                    flat: `${data.owner.block || ''}-${data.owner.flatNo || ''}`,
                    type: 'Resident',
                    status: 'Allowed'
                });
                showSuccess('Vehicle Found', `Owner: ${data.owner.name}`);
            } else {
                setVehicleRes({ notFound: true });
                showWarning('Vehicle Not Found', 'No resident registered with this plate.');
            }
        } catch (error) {
            console.error("Search error", error);
        }
    };

    const OverviewTab = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Quick Actions & Welcome Row */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Overview</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Welcome back, {user?.name || 'Officer'}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setActiveTab('visitor')}
                        className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
                    >
                        <UserPlus size={18} />
                        <span>New Visitor</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('scan')}
                        className="py-2.5 px-5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 dark:shadow-none transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
                    >
                        <ScanLine size={18} />
                        <span>Scan Pass</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Traffic Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                            <Users size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-2 py-1 rounded-lg">
                            <Activity size={10} /> Live
                        </span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-1">{stats.weekly[6] || 0}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Entries</p>
                </div>

                {/* Breakdown Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-indigo-500/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                            <Box size={24} />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.types[1]}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Parcels</p>
                        </div>
                        <div className="w-px bg-slate-100 dark:bg-slate-700"></div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats.types[0]}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Guests</p>
                        </div>
                    </div>
                </div>

                {/* Vehicle Search Widget - Compact */}
                <div className="lg:col-span-2 bg-slate-900 dark:bg-black p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Search size={80} /></div>
                    <div className="relative z-10">
                        <h4 className="font-bold text-sm tracking-wide mb-3 flex items-center gap-2"><Search size={16} /> Vehicle Lookup</h4>
                        <form onSubmit={handleVehicleSearch} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="MH 02 AB 1234"
                                value={plateNo}
                                onChange={(e) => setPlateNo(e.target.value.toUpperCase())}
                                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono tracking-wider focus:outline-none focus:bg-white/20 transition-colors uppercase placeholder-white/30"
                            />
                            <button type="submit" className="px-4 bg-indigo-600 rounded-xl hover:bg-indigo-500 text-white transition-colors font-bold text-sm">
                                Check
                            </button>
                        </form>
                        {vehicleRes && (
                            <div className={`mt-3 text-xs p-2 rounded-lg border flex items-center gap-2 ${vehicleRes.notFound ? 'bg-red-500/20 border-red-500/30 text-red-200' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'}`}>
                                {vehicleRes.notFound ? <Zap size={12} /> : <Shield size={12} />}
                                <span className="font-semibold">{vehicleRes.notFound ? 'No resident found.' : `${vehicleRes.owner} • ${vehicleRes.flat}`}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Weekly Traffic</h3>
                        <div className="flex gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1"></span>
                            <span className="text-xs text-slate-400 font-bold">Visitors</span>
                        </div>
                    </div>
                    <div className="h-64">
                        <Bar
                            data={{
                                labels: stats.labels,
                                datasets: [{
                                    label: 'Visitors',
                                    data: stats.weekly,
                                    backgroundColor: '#6366f1',
                                    borderRadius: 6,
                                    hoverBackgroundColor: '#4f46e5',
                                    barThickness: 30
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 8 } },
                                scales: {
                                    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11, weight: 'bold' } } },
                                    y: { display: false }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">Distribution</h3>
                    <div className="flex-1 relative min-h-[160px]">
                        <Doughnut
                            data={{
                                labels: ['Guest', 'Delivery', 'Staff', 'Other'],
                                datasets: [{
                                    data: stats.types,
                                    backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#64748b'],
                                    borderWidth: 0,
                                    cutout: '70%'
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } }
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <span className="block text-3xl font-black text-slate-800 dark:text-white">{stats.weekly[6] || 0}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span><span className="text-[10px] font-bold text-slate-500">Guest</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span><span className="text-[10px] font-bold text-slate-500">Delivery</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-[10px] font-bold text-slate-500">Staff</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500"></span><span className="text-[10px] font-bold text-slate-500">Other</span></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'visitor', label: 'New Entry', icon: UserPlus },
        { id: 'scan', label: 'Scan Access Pass', icon: ScanLine },
        { id: 'parcel', label: 'Parcels Management', icon: Box },
        { id: 'parking', label: 'Parking Status', icon: Activity },
        { id: 'staff', label: 'Service Staff', icon: Users },
        { id: 'cctv', label: 'CCTV View', icon: Video },
        { id: 'subscription', label: 'Subscription', icon: CreditCard },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab />;
            case 'visitor': return <VisitorTab user={user} />;
            case 'parcel': return <ParcelTab user={user} />;
            case 'staff': return <StaffTab user={user} />;
            case 'parking': return <GuardParking user={user} />;
            case 'scan': return <ScanTab user={user} GoHome={() => setActiveTab('overview')} />;
            case 'cctv': return <CCTVTab />;
            case 'subscription': return <AdminSubscription token={user?.token} user={user} />;
            default: return <OverviewTab />;
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
                                {societyDetails?.name?.[0] || 'G'}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1 line-clamp-1">
                                <span className="text-sm font-['Montserrat'] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">
                                    {(societyDetails?.name || 'Gate').split(' ')[0]}
                                </span>
                                <span className="text-2xl font-['Great_Vibes'] text-indigo-600 dark:text-indigo-400 font-normal -ml-1">
                                    {(societyDetails?.name || 'Keeper').split(' ').slice(1).join(' ') || 'Keeper'}
                                </span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-['Montserrat']">Security Access</p>
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
                                {user?.name?.[0] || 'G'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Security Officer</p>
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
                {/* Header with Navbar */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
                    <div className="flex-1">
                        <Navbar
                            title={activeTab === 'overview' ? 'Station Dashboard' : activeTab.replace(/([A-Z])/g, ' $1').trim()}
                            showSearch={true}
                            notifications={stats.notifications}
                            onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            onTabChange={setActiveTab}
                            onLogout={() => setShowLogoutConfirm(true)}
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <SubscriptionLock societyDetails={societyDetails}>
                        {renderContent()}
                    </SubscriptionLock>
                </div>

                {/* Floating SOS Button */}
                <div className="absolute bottom-6 right-6 z-30">
                    <SOSButton />
                </div>

                <ChatWidget />

                <ConfirmationModal
                    isOpen={showLogoutConfirm}
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={logout}
                    title="Sign Out?"
                    message="Are you sure you want to end your shift?"
                    confirmText="Sign Out"
                    cancelText="Cancel"
                    type="danger"
                />
            </main>
        </div>
    );
};

export default GuardDashboard;
