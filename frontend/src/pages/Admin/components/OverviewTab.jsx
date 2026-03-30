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
        blue: 'from-blue-600 to-cyan-500',
        green: 'from-emerald-600 to-teal-500',
        orange: 'from-orange-600 to-amber-500',
        red: 'from-rose-600 to-red-500',
        indigo: 'from-indigo-600 to-violet-500',
        purple: 'from-fuchsia-600 to-purple-500'
    };

    const shadowColor = {
        blue: 'shadow-blue-200/50 dark:shadow-none',
        green: 'shadow-emerald-200/50 dark:shadow-none',
        orange: 'shadow-orange-200/50 dark:shadow-none',
        red: 'shadow-rose-200/50 dark:shadow-none',
        indigo: 'shadow-indigo-200/50 dark:shadow-none',
        purple: 'shadow-fuchsia-200/50 dark:shadow-none'
    };

    return (
        <div className={`relative overflow-hidden bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 p-6 transition-all duration-500 group cursor-pointer hover:-translate-y-2 shadow-xl ${shadowColor[color]}`}>
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradients[color]} text-white shadow-lg group-hover:rotate-6 transition-transform duration-500`}>
                        <Icon size={24} />
                    </div>
                    {trend && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <TrendingUp size={12} />
                            {trend}
                        </div>
                    )}
                </div>
                
                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1 tabular-nums group-hover:scale-105 origin-left transition-transform duration-500">
                    {value}
                </h3>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</p>
                
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradients[color]} animate-pulse`}></div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">{sub}</p>
                </div>
            </div>

            {/* Background Glow */}
            <div className={`absolute -bottom-12 -right-12 w-32 h-32 bg-gradient-to-br ${gradients[color]} rounded-full blur-3xl opacity-5 dark:opacity-10 group-hover:opacity-20 transition-opacity duration-700`}></div>
        </div>
    );
};

const QuickAction = ({ label, icon: Icon, onClick, color = 'indigo' }) => {
    const colors = {
        indigo: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
        green: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
        purple: 'group-hover:text-purple-600 dark:group-hover:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
        blue: 'group-hover:text-blue-600 dark:group-hover:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
    };

    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-4 p-8 bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-[2.5rem] hover:shadow-2xl hover:shadow-indigo-200/40 dark:hover:shadow-none transition-all duration-500 group relative overflow-hidden"
        >
            <div className={`p-5 rounded-2xl ${colors[color]} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}>
                <Icon size={32} />
            </div>
            <div className="text-center">
                <span className="block text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">{label}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Launch Module</span>
            </div>
            
            {/* Hover Decor */}
            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <ArrowRight size={40} className="-rotate-45" />
            </div>
        </button>
    );
};

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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Operations Center Header */}
            <div
                className={`group relative overflow-hidden rounded-[2.5rem] p-8 text-white transition-all duration-1000 shadow-2xl shadow-indigo-200/40 dark:shadow-none animate-gradient bg-[length:200%_200%] ${!activeEvent ? `bg-gradient-to-br ${gradient}` : ''}`}
                style={bannerStyle}
            >
                {/* High-fidelity background decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:scale-125 transition-transform duration-[3s]"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-[80px]"></div>

                <div className="flex flex-col lg:flex-row items-center justify-between relative z-10 gap-8">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="bg-white/20 p-5 rounded-[2rem] backdrop-blur-xl border border-white/30 shadow-2xl group-hover:rotate-[10deg] transition-transform duration-500">
                                <span className="animate-wave text-4xl inline-block origin-bottom-right">
                                    {activeEvent ? (
                                        activeEvent.animation === 'snowfall' ? '❄️' :
                                            activeEvent.animation === 'fireworks' ? '🎆' :
                                                activeEvent.animation === 'diyas-sparkle' ? '🪔' :
                                                    activeEvent.animation === 'tricolor-confetti' ? '🇮🇳' :
                                                        activeEvent.animation === 'peace-symbols' ? '🕊️' : '🙌'
                                    ) : '🏢'}
                                </span>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-400 border-4 border-white/20 rounded-full animate-ping"></div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                                    Operations Live
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Normal Latency</span>
                                </div>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight leading-none mb-2 drop-shadow-md">
                                {activeEvent ? activeEvent.heroBannerText : `${greeting}, Administrator!`}
                            </h1>
                            <p className="text-white/80 text-sm font-bold max-w-md">
                                {activeEvent ? `Celebrating ${activeEvent.name} at STATUS Sharan` : `Welcome to the command center. You have ${pendingComplaintsCount} urgent tickets requiring attention.`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white/20 shadow-2xl flex items-center gap-6 group/clock hover:bg-white/20 transition-all duration-500">
                            <div className="text-right">
                                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70 group-hover:opacity-100 transition-opacity">
                                    {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                                </p>
                                <p className="text-xs font-bold opacity-70 group-hover:opacity-100">
                                    {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="h-10 w-px bg-white/20"></div>
                            <div className="flex flex-col">
                                <p className="text-3xl font-black leading-none tracking-tighter tabular-nums">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <span className="text-[10px] text-center font-black opacity-50 uppercase tracking-widest mt-1">Status: Syncing</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <style>{`
                    @keyframes gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .animate-gradient {
                        animation: gradient 8s ease infinite;
                    }
                `}</style>
            </div>

            {/* Bento Grid Stats */}
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

            {/* Command Pallete / Quick Actions */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">Rapid Control</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
