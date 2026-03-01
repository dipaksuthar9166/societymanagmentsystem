import React, { useState, useEffect } from 'react';
import { useEventTheme } from '../../../context/EventThemeContext';
import { DollarSign, Home, Receipt, AlertCircle, TrendingUp, Users, Calendar, ArrowRight } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const StatCard = ({ label, value, sub, icon: Icon, color, trend }) => {
    const gradients = {
        blue: 'from-blue-500 via-cyan-500 to-blue-500',
        green: 'from-green-500 via-emerald-500 to-green-500',
        orange: 'from-orange-500 via-amber-500 to-orange-500',
        red: 'from-red-500 via-rose-500 to-red-500',
        indigo: 'from-indigo-500 via-purple-500 to-indigo-500',
        purple: 'from-purple-500 via-pink-500 to-purple-500'
    };

    const iconBg = {
        blue: 'bg-blue-50 dark:bg-blue-900/30',
        green: 'bg-green-50 dark:bg-green-900/30',
        orange: 'bg-orange-50 dark:bg-orange-900/30',
        red: 'bg-red-50 dark:bg-red-900/30',
        indigo: 'bg-indigo-50 dark:bg-indigo-900/30',
        purple: 'bg-purple-50 dark:bg-purple-900/30'
    };

    const iconColor = {
        blue: 'text-blue-600 dark:text-blue-400',
        green: 'text-green-600 dark:text-green-400',
        orange: 'text-orange-600 dark:text-orange-400',
        red: 'text-red-600 dark:text-red-400',
        indigo: 'text-indigo-600 dark:text-indigo-400',
        purple: 'text-purple-600 dark:text-purple-400'
    };

    const trendBg = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    };

    const circleBg = {
        blue: 'bg-blue-50 dark:bg-blue-500',
        green: 'bg-green-50 dark:bg-green-500',
        orange: 'bg-orange-50 dark:bg-orange-500',
        red: 'bg-red-50 dark:bg-red-500',
        indigo: 'bg-indigo-50 dark:bg-indigo-500',
        purple: 'bg-purple-50 dark:bg-purple-500'
    };

    return (
        <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group cursor-pointer transform hover:scale-[1.02]">
            {/* Animated Gradient Top Border */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradients[color]} animate-gradient bg-[length:200%_100%]`}></div>

            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${iconBg[color]} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={18} className={iconColor[color]} />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded ${trendBg[color]}`}>
                            <TrendingUp size={12} />
                            {trend}
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-0.5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">{value}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                </div>
            </div>

            {/* Decorative Circle */}
            <div className={`absolute bottom-0 right-0 w-16 h-16 ${circleBg[color]} rounded-full -mr-8 -mb-8 opacity-20 dark:opacity-10 group-hover:opacity-30 dark:group-hover:opacity-20 transition-opacity duration-300`}></div>

            {/* Custom Animation */}
            <style>{`
                @keyframes gradient {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
                .animate-gradient {
                    animation: gradient 3s ease infinite;
                }
            `}</style>
        </div>
    );
};

const QuickAction = ({ label, icon: Icon, onClick, color = 'indigo' }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-${color}-300 dark:hover:border-${color}-500 hover:shadow-md transition-all group`}
    >
        <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/30 group-hover:bg-${color}-100 dark:group-hover:bg-${color}-900/50 transition-colors`}>
            <Icon size={20} className={`text-${color}-600 dark:text-${color}-400`} />
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <ArrowRight size={16} className="ml-auto text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
    </button>
);

const OverviewTab = ({ stats, invoices, user, complaints, onAction }) => {
    const { activeEvent } = useEventTheme(); // Hook
    const totalCollection = stats?.financials?.totalCollected || 0;

    // Time & Greeting State
    const [currentTime, setCurrentTime] = useState(new Date());
    const [greeting, setGreeting] = useState('');
    const [gradient, setGradient] = useState('from-indigo-600 to-purple-600');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now);
            const hrs = now.getHours();

            // Priority 1: Festive Event
            if (activeEvent) {
                // We rely on CSS variables set by the context for buttons, but for this specific gradient card,
                // we might want a specific look.
                // However, let's try to map the event type to a gradient or just use the primary color?
                // For now, let's stick to a robust time-based one UNLESS event is super special?
                // Actually, the user explicitly asked to change the hero banner background.
                // We can use inline style for that.
                return;
            }

            if (hrs >= 5 && hrs < 12) {
                setGreeting('Good Morning');
                setGradient('from-orange-400 via-pink-500 to-rose-500'); // Sunrise
            } else if (hrs >= 12 && hrs < 17) {
                setGreeting('Good Afternoon');
                setGradient('from-blue-500 via-cyan-500 to-teal-400'); // Day
            } else if (hrs >= 17 && hrs < 21) {
                setGreeting('Good Evening');
                setGradient('from-indigo-600 via-purple-600 to-fuchsia-600'); // Sunset
            } else {
                setGreeting('Good Night'); // or 'Working Late?'
                setGradient('from-slate-800 via-slate-900 to-black'); // Night
            }
        };

        updateTime();
        const timer = setInterval(updateTime, 1000 * 60); // Update every minute
        return () => clearInterval(timer);
    }, [activeEvent]); // Dependency added

    // Separate Independent Calculations from invoices prop
    const pendingInvoices = invoices?.filter(i => i.status?.toLowerCase() === 'pending') || [];
    const overdueInvoices = invoices?.filter(i => i.status?.toLowerCase() === 'overdue') || [];

    const pendingAmount = pendingInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const overdueAmount = overdueInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0); // Include Arrears sum

    const pendingCount = pendingInvoices.length;
    const overdueCount = overdueInvoices.length;

    // Calculate complaints from prop
    const pendingComplaintsCount = complaints ? complaints.filter(c => c.status === 'Pending').length : (stats?.pendingComplaints || 0);
    const totalComplaintsCount = complaints ? complaints.length : (stats?.totalComplaints || pendingComplaintsCount);

    // Festive Override Logic
    const bannerStyle = activeEvent ? {
        background: `linear-gradient(135deg, ${activeEvent.theme.primary}, ${activeEvent.theme.secondary})`
    } : {};

    // When activeEvent is present, gradient class is ignored due to inline style priority on background
    // But we should remove the class to be safe or ensure inline wins.
    // Actually, 'bg-gradient-to-r' sets background-image. Inline 'background' overrides it.

    return (
        <div className="space-y-6">
            {/* ... (Welcome Section remains unchanged) */}
            <div
                className={`rounded-2xl p-4 text-white shadow-lg transition-all duration-1000 relative overflow-hidden animate-gradient bg-[length:200%_200%] ${!activeEvent ? `bg-gradient-to-r ${gradient}` : ''}`}
                style={bannerStyle}
            >
                {/* Decorative Shapes for specific times */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-6 -mb-6 blur-2xl"></div>

                <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                            <span className="animate-wave text-2xl inline-block origin-bottom-right">
                                {activeEvent ? (
                                    activeEvent.animation === 'snowfall' ? '❄️' :
                                        activeEvent.animation === 'fireworks' ? '🎆' :
                                            activeEvent.animation === 'diyas-sparkle' ? '🪔' :
                                                activeEvent.animation === 'tricolor-confetti' ? '🇮🇳' :
                                                    activeEvent.animation === 'peace-symbols' ? '🕊️' : '👋'
                                ) : '👋'}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold flex items-center gap-2 leading-tight">
                                {activeEvent ? activeEvent.heroBannerText : `${greeting}, ${user?.name?.split(' ')[0] || 'Admin'}!`}
                            </h1>
                            <p className="text-white/90 text-xs font-medium">
                                {activeEvent ? `Celebrating ${activeEvent.name} at STATUS Sharan` : "Here's what's happening today."}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-sm flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                                {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                            </p>
                            <p className="text-[10px] font-medium opacity-80">
                                {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <p className="text-2xl font-black leading-none tracking-tight">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                <style>{`
                    @keyframes gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .animate-gradient {
                        animation: gradient 6s ease infinite;
                    }
                    @keyframes wave {
                        0%, 100% { transform: rotate(0deg); }
                        25% { transform: rotate(20deg); }
                        75% { transform: rotate(-15deg); }
                    }
                    .animate-wave {
                        animation: wave 1.5s ease-in-out infinite;
                        transform-origin: 70% 70%;
                        display: inline-block;
                    }
                `}</style>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Collection"
                    value={`₹${totalCollection.toLocaleString()}`}
                    sub="Lifetime revenue"
                    icon={DollarSign}
                    color="green"
                    trend={`${user?.isDemo ? '+12%' : ''}`}
                />
                {/* Changed Occupancy to Pending for better financial visibility */}
                <StatCard
                    label="Pending Bills"
                    value={`₹${pendingAmount.toLocaleString()}`}
                    sub={`${pendingCount} invoices to be paid`}
                    icon={Receipt}
                    color="orange"
                />
                <StatCard
                    label="Overdue (Arrears)"
                    value={`₹${overdueAmount.toLocaleString()}`}
                    sub={`${overdueCount} defaulters`}
                    icon={AlertCircle}
                    color="red"
                />
                <StatCard
                    label="Complaints"
                    value={pendingComplaintsCount}
                    sub={`${totalComplaintsCount} total tickets`}
                    icon={Users}
                    color="indigo"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickAction label="Create Invoice" icon={Receipt} color="indigo" onClick={() => onAction?.('billing')} />
                    <QuickAction label="Add Resident" icon={Users} color="green" onClick={() => onAction?.('tenants')} />
                    <QuickAction label="Post Notice" icon={Calendar} color="purple" onClick={() => onAction?.('notices')} />
                    <QuickAction label="View Reports" icon={TrendingUp} color="blue" onClick={() => onAction?.('reports')} />
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Financial Habits</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Last 6 Months</span>
                    </div>
                    <div className="h-72">
                        {(() => {
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            const today = new Date();
                            const last6Months = [];
                            const collectedData = [0, 0, 0, 0, 0, 0];
                            const pendingData = [0, 0, 0, 0, 0, 0];
                            const overdueData = [0, 0, 0, 0, 0, 0];

                            for (let i = 5; i >= 0; i--) {
                                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                                last6Months.push(months[d.getMonth()]);
                            }

                            invoices?.forEach(inv => {
                                const d = new Date(inv.createdAt);
                                const diffMonths = (today.getFullYear() - d.getFullYear()) * 12 + (today.getMonth() - d.getMonth());
                                const status = inv.status ? inv.status.toLowerCase() : ''; // Robust case handling

                                if (diffMonths >= 0 && diffMonths <= 5) {
                                    const idx = 5 - diffMonths;
                                    if (status === 'paid') collectedData[idx] += inv.totalAmount;
                                    else if (status === 'pending') pendingData[idx] += inv.totalAmount;
                                    else if (status === 'overdue') overdueData[idx] += inv.totalAmount;
                                }
                            });

                            return (
                                <Line
                                    data={{
                                        labels: last6Months,
                                        datasets: [{
                                            label: 'Collected',
                                            data: collectedData,
                                            borderColor: '#10b981',
                                            backgroundColor: (context) => {
                                                const ctx = context.chart.ctx;
                                                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                                                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                                                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                                                return gradient;
                                            },
                                            fill: true,
                                            tension: 0.4,
                                            pointRadius: 4,
                                            pointHoverRadius: 6,
                                            pointBackgroundColor: '#10b981',
                                            pointBorderColor: '#fff',
                                            pointBorderWidth: 2
                                        }, {
                                            label: 'Pending',
                                            data: pendingData,
                                            borderColor: '#f59e0b',
                                            backgroundColor: (context) => {
                                                const ctx = context.chart.ctx;
                                                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                                                gradient.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
                                                gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
                                                return gradient;
                                            },
                                            fill: true,
                                            tension: 0.4,
                                            pointRadius: 4,
                                            pointHoverRadius: 6,
                                            pointBackgroundColor: '#f59e0b',
                                            pointBorderColor: '#fff',
                                            pointBorderWidth: 2
                                        }, {
                                            label: 'Overdue',
                                            data: overdueData,
                                            borderColor: '#ef4444',
                                            backgroundColor: (context) => {
                                                const ctx = context.chart.ctx;
                                                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                                                gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
                                                gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
                                                return gradient;
                                            },
                                            fill: true,
                                            tension: 0.4,
                                            pointRadius: 4,
                                            pointHoverRadius: 6,
                                            pointBackgroundColor: '#ef4444',
                                            pointBorderColor: '#fff',
                                            pointBorderWidth: 2
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        interaction: {
                                            mode: 'index',
                                            intersect: false,
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    color: 'rgba(148, 163, 184, 0.1)',
                                                    drawBorder: false
                                                },
                                                ticks: {
                                                    color: '#94a3b8',
                                                    font: { size: 10, weight: '600' },
                                                    callback: (value) => '₹' + value.toLocaleString()
                                                }
                                            },
                                            x: {
                                                grid: { display: false },
                                                ticks: {
                                                    color: '#94a3b8',
                                                    font: { size: 10, weight: '600' }
                                                }
                                            }
                                        },
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                                align: 'end',
                                                labels: {
                                                    usePointStyle: true,
                                                    boxWidth: 6,
                                                    padding: 20,
                                                    color: '#94a3b8',
                                                    font: { size: 11, weight: 'bold' }
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                titleFont: { size: 12, weight: 'bold' },
                                                bodyFont: { size: 12 },
                                                padding: 12,
                                                cornerRadius: 10,
                                                displayColors: true,
                                                callbacks: {
                                                    label: (context) => {
                                                        let label = context.dataset.label || '';
                                                        if (label) label += ': ';
                                                        if (context.parsed.y !== null) label += '₹' + context.parsed.y.toLocaleString();
                                                        return label;
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                />
                            );
                        })()}
                    </div>
                </div>

                {/* Complaints Doughnut */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Complaint Status</h3>
                    <div className="h-72 flex items-center justify-center">
                        {(() => {
                            const pending = complaints ? complaints.filter(c => c.status === 'Pending').length : (stats?.pendingComplaints || 0);
                            const total = complaints ? complaints.length : (stats?.totalComplaints || 0);
                            const resolved = Math.max(0, total - pending);

                            if (total === 0) return <div className="text-slate-400 dark:text-slate-500 text-sm font-medium">No complaints data</div>;

                            return (
                                <Doughnut
                                    data={{
                                        labels: ['Resolved', 'Pending'],
                                        datasets: [{
                                            data: [resolved, pending],
                                            backgroundColor: (context) => {
                                                const ctx = context.chart.ctx;
                                                const gradient1 = ctx.createLinearGradient(0, 0, 0, 200);
                                                gradient1.addColorStop(0, '#34d399');
                                                gradient1.addColorStop(1, '#059669');
                                                const gradient2 = ctx.createLinearGradient(0, 0, 0, 200);
                                                gradient2.addColorStop(0, '#f87171');
                                                gradient2.addColorStop(1, '#dc2626');
                                                return [gradient1, gradient2];
                                            },
                                            borderWidth: 0,
                                            cutout: '65%', // Sligher thicker ring
                                            hoverOffset: 4
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: 'bold' }, color: '#94a3b8' } }
                                        }
                                    }}
                                />
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
                    <button className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-700">
                                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Invoice</th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Resident</th>
                                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                                <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                                <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {invoices?.slice(0, 5).map(inv => (
                                <tr key={inv._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="py-3 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">#{inv._id.slice(-6).toUpperCase()}</td>
                                    <td className="py-3 px-4 font-semibold text-sm text-slate-800 dark:text-white">{inv.customerName}</td>
                                    <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">₹{inv.totalAmount.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${inv.status === 'Paid' ? 'bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                            inv.status === 'Overdue' ? 'bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                'bg-orange-100/50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default OverviewTab;
