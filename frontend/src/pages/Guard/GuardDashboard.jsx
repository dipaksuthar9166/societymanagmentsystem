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
    Video,
    Phone,
    Radio,
    ChevronRight,
    Search as SearchIcon,
    MoreHorizontal,
    Bell,
    Box as BoxIcon,
    Camera,
    ShieldAlert
} from 'lucide-react';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../../config';
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
import IntercomCallTab from './components/IntercomCallTab';
import WalkieTab from './components/WalkieTab';
import usePreventBack from '../../hooks/usePreventBack';

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
    usePreventBack();
    const { user, logout } = useAuth();
    const { showSuccess, showWarning } = useToast();
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // Socket Listener for Intercom Calls
    useEffect(() => {
        const socket = io(BACKEND_URL, { 
            transports: ['polling', 'websocket']
        });
        
        if (user) {
            socket.emit('join_room', user.id || user._id);
        }

        socket.on('incoming-call', (data) => {
            console.log("📞 Incoming Intercom Call for Guard:", data);
            setIncomingCall(data);
        });

        socket.on('call-rejected', () => {
             // Rejection handling
        });

        return () => socket.disconnect();
    }, [user]);

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

    const OverviewTab = () => {
        if (isMobile) {
            return (
                <div className="pb-32 animate-in fade-in duration-500">
                    {/* Hero Header - Scaled Down */}
                    <div className="relative h-56 -mx-6 -mt-6 mb-16 overflow-hidden">
                        <img 
                            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                            className="w-full h-full object-cover"
                            alt="Society Header"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                        <div className="absolute bottom-6 left-6">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="p-1 px-2 bg-red-500 text-[9px] font-black text-white rounded-md uppercase tracking-wider animate-pulse">Live</span>
                                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{societyDetails?.name || 'Gate Station'}</span>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none mb-1">Security Dashboard</h2>
                            <p className="text-white/60 text-xs font-bold tracking-tight">Officer: <span className="text-indigo-400">{user?.name}</span></p>
                        </div>
                    </div>

                    {/* Quick Stats - More Compact */}
                    <div className="grid grid-cols-2 gap-3 -mt-14 relative z-10 px-4 mb-6">
                        <div className="bg-white p-4 rounded-[28px] shadow-xl shadow-slate-200 border border-slate-50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Users size={18} />
                            </div>
                            <div>
                                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Entries</h3>
                                <p className="text-xl font-black text-slate-800 tracking-tighter leading-none">{stats.weekly[6] || 0}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-[28px] shadow-xl shadow-slate-200 border border-slate-50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                <ShieldAlert size={18} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Alerts</h3>
                                <p className="text-xl font-black text-slate-800 tracking-tighter leading-none">0</p>
                            </div>
                        </div>
                    </div>

                    {/* Society Actions Grid - Tightened */}
                    <div className="px-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-md font-black text-slate-800 uppercase tracking-tighter">Guard Actions</h3>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-black uppercase tracking-widest">Station Center</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3 mb-8">
                            {[
                                { id: 'visitor', label: 'New Entry', icon: UserPlus, color: 'text-orange-600', bg: 'bg-orange-50' },
                                { id: 'scan', label: 'Scan Pass', icon: ScanLine, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { id: 'intercom', label: 'Intercom', icon: Phone, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { id: 'parcel', label: 'Parcels', icon: BoxIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { id: 'cctv', label: 'CCTV View', icon: Video, color: 'text-red-600', bg: 'bg-red-50' },
                                { id: 'staff', label: 'Staff Log', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { id: 'parking', label: 'Parking', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' },
                                { id: 'walkie', label: 'Walkie', icon: Radio, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            ].map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => setActiveTab(action.id)}
                                    className="flex flex-col items-center gap-2 group active:scale-95 transition-all"
                                >
                                    <div className={`w-14 h-14 ${action.bg} ${action.color} rounded-[22px] flex items-center justify-center shadow-lg shadow-transparent group-hover:shadow-current/10 transition-all`}>
                                        <action.icon size={22} className="stroke-[2.5px]" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{action.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Vehicle Search - Premium Row */}
                        <div className="bg-slate-900 rounded-[35px] p-6 text-white mb-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5"><SearchIcon size={80} /></div>
                            <div className="relative z-10">
                                <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-4 text-white/60">Vehicle Lookup</h4>
                                <form onSubmit={handleVehicleSearch} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="MH 02 AB 1234"
                                        value={plateNo}
                                        onChange={(e) => setPlateNo(e.target.value.toUpperCase())}
                                        className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 text-xs font-mono tracking-widest focus:outline-none focus:bg-white/20 transition-all uppercase"
                                    />
                                    <button type="submit" className="p-3.5 bg-indigo-600 rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 active:scale-95 transition-all">
                                        <SearchIcon size={20} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                {/* Desktop Header and regular dashboard logic... */}
                {/* (Keep standard desktop OverviewTab content as currently implemented) */}
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
                                <BoxIcon size={24} />
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
                        <div className="absolute top-0 right-0 p-4 opacity-10"><SearchIcon size={80} /></div>
                        <div className="relative z-10">
                            <h4 className="font-bold text-sm tracking-wide mb-3 flex items-center gap-2"><SearchIcon size={16} /> Vehicle Lookup</h4>
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
    };

    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'visitor', label: 'New Entry', icon: UserPlus },
        { id: 'scan', label: 'Scan Access Pass', icon: ScanLine },
        { id: 'parcel', label: 'Parcels Management', icon: Box },
        { id: 'parking', label: 'Parking Status', icon: Activity },
        { id: 'staff', label: 'Service Staff', icon: Users },
        { id: 'intercom', label: 'Intercom Calling', icon: Phone },
        { id: 'walkie', label: 'Guard Talky', icon: Radio },
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
            case 'intercom': return <IntercomCallTab user={user} isMobile={isMobile} />;
            case 'walkie': return <WalkieTab user={user} />;
            case 'cctv': return <CCTVTab />;
            case 'subscription': return <AdminSubscription token={user?.token} user={user} />;
            default: return <OverviewTab />;
        }
    };

    // Mobile specific layout
    if (isMobile) {
        return (
            <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
                <main className="flex-1 overflow-y-auto scroll-smooth">
                    {/* Render Content or Overview */}
                    <div className={activeTab === 'overview' ? '' : 'px-4 pt-6 pb-32'}>
                         <SubscriptionLock societyDetails={societyDetails}>
                            {activeTab === 'overview' ? <OverviewTab /> : (
                                <div className="fixed inset-0 bg-white z-[60] overflow-y-auto pb-32">
                                     <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-white sticky top-0 z-[70]">
                                        <button onClick={() => setActiveTab('overview')} className="p-2 bg-slate-50 rounded-xl"><ChevronRight className="rotate-180" size={20}/></button>
                                        <h3 className="font-black text-slate-800 uppercase tracking-tighter">{activeTab}</h3>
                                     </div>
                                     <div className="p-4">
                                        {renderContent()}
                                     </div>
                                </div>
                            )}
                        </SubscriptionLock>
                    </div>
                </main>

                {/* Mobile Bottom Nav - Styled like User Side */}
                <div className="fixed bottom-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-4 z-50">
                    {[
                        { id: 'overview', label: 'Home', icon: LayoutDashboard },
                        { id: 'visitor', label: 'Entries', icon: Users },
                        { id: 'cctv', label: 'CCTV', icon: Camera },
                        { id: 'intercom', label: 'Call', icon: Phone }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setActiveTab(btn.id)}
                            className={`flex flex-col items-center gap-1 transition-all ${activeTab === btn.id ? 'text-indigo-600' : 'text-slate-400'}`}
                        >
                            <div className={`p-2 rounded-2xl transition-all ${activeTab === btn.id ? 'bg-indigo-50' : ''}`}>
                                <btn.icon size={22} className={activeTab === btn.id ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{btn.label}</span>
                        </button>
                    ))}
                    <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 text-slate-400">
                        <div className="p-2 rounded-2xl"><MoreHorizontal size={22} /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">More</span>
                    </button>
                </div>

                {/* Mobile Sidebar/Menu */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[100] animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                            <div className="p-8 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
                                        {user?.name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg">{user?.name}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Security Post</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                                {menuItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600'}`}
                                    >
                                        <item.icon size={20} className="stroke-[2.5px]" />
                                        <span className="font-black text-sm uppercase tracking-tighter">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="p-6 border-t border-slate-100">
                                <button onClick={() => setShowLogoutConfirm(true)} className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest">Sign Out</button>
                            </div>
                        </div>
                    </div>
                )}

                <IncomingCallModal />
                {incomingCall && (
                    <audio src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" autoPlay loop />
                )}
                <SOSButton />
            </div>
        );
    }

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
