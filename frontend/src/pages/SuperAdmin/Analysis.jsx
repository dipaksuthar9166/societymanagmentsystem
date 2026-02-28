import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Activity,
    MapPin,
    Users,
    ArrowUpRight,
    Clock,
    MessageCircle,
    Download,
    ChevronDown,
    MoreHorizontal,
    Briefcase,
    Zap,
    LayoutDashboard
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, trend, updateTime }) => (
    <div className={`${color} rounded-xl p-6 text-white shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
        <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform">
            <Icon size={120} />
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-black mb-1">{value}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">{title}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Icon size={20} />
                </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-white/10 mt-auto">
                <Clock size={12} className="opacity-60" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">update : {updateTime}</span>
            </div>
        </div>
    </div>
);

const SparkLine = ({ color }) => (
    <div className="w-16 h-8">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
                { v: 10 }, { v: 15 }, { v: 8 }, { v: 22 }, { v: 18 }, { v: 25 }
            ]}>
                <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

const Analysis = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/analytics`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setAnalytics(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading Dashboard...</p>
        </div>
    );

    // Dynamic Chart Data
    const chartData = analytics?.charts?.monthlyRevenue?.map(item => ({
        name: item._id, // "YYYY-MM"
        sales: item.revenue
    })) || [];

    // Dynamic Risk/Ticket Data
    const riskData = analytics?.charts?.ticketStats?.map(item => ({
        name: item._id,
        value: item.count
    })) || [];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Row 1: Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${(analytics?.stats?.totalRevenue || 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-gradient-to-r from-[#fe8a39] to-[#fd536b]"
                    updateTime="Just now"
                />
                <StatCard
                    title="Total Users"
                    value={analytics?.stats?.totalUsers || 0}
                    icon={Users}
                    color="bg-gradient-to-r from-[#0ac282] to-[#3fcc9a]"
                    updateTime="Just now"
                />
                <StatCard
                    title="Active Societies"
                    value={analytics?.stats?.totalSocieties || 0}
                    icon={LayoutDashboard}
                    color="bg-gradient-to-r from-[#fe5d70] to-[#fe909d]"
                    updateTime="Just now"
                />
                <StatCard
                    title="System Admins"
                    value={analytics?.stats?.totalAdmins || 0}
                    icon={Briefcase}
                    color="bg-gradient-to-r from-[#4099ff] to-[#73b4ff]"
                    updateTime="Just now"
                />
            </div>

            {/* Row 2: Chart & Risk */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Revenue Analytics</h3>
                            <p className="text-xs text-slate-400 font-medium">Monthly revenue growth over the last year.</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400"><Download size={16} /></button>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} py={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#fd536b"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#fd536b', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 flex flex-col items-center">
                    <div className="w-full mb-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 text-center">Ticket Status</h3>
                    </div>
                    <div className="relative w-full h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
                            <span className="text-3xl font-black text-slate-800 dark:text-white">
                                {riskData.reduce((acc, curr) => acc + curr.value, 0)}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 w-full grid grid-cols-2 gap-4">
                        {riskData.slice(0, 4).map((item, index) => (
                            <div key={index} className="text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.name}</p>
                                <p className="text-xs font-bold text-slate-700 dark:text-white" style={{ color: COLORS[index % COLORS.length] }}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Table & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Top Performing Societies</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Society Name</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Revenue</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {(analytics?.charts?.societyPerformance || []).length > 0 ? (
                                    analytics.charts.societyPerformance.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                        {item.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-indigo-600">{item.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-600">₹{item.revenue?.toLocaleString()}</td>
                                            <td className="px-8 py-6"><SparkLine color={['#11c15b', '#4099ff', '#ff5370'][i % 3]} /></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-6 text-center text-slate-500 text-sm">No transaction data available yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 space-y-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">System Activity</h3>
                    <div className="space-y-6">
                        {(analytics?.recentActivity || []).length > 0 ? (
                            analytics.recentActivity.map((log, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                        <Activity size={20} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{log.user?.name || 'Unknown User'} ({log.society?.name || 'System'})</h4>
                                        <p className="text-xs text-slate-400 font-medium line-clamp-1">{log.action}: {log.description}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-bold">
                                            <Clock size={10} /> {new Date(log.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-4">No recent activity logs.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 4: Updates & Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Latest Inquiries</h3>
                    <div className="space-y-8 border-l-2 border-slate-50 ml-4 pl-8">
                        {(analytics?.recentInquiries || []).length > 0 ? (
                            analytics.recentInquiries.map((inq, i) => (
                                <div key={i} className="relative">
                                    <div className={`absolute left-[-41px] top-0 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 ${inq.status === 'New' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(inq.createdAt).toLocaleDateString()}</p>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{inq.subject}</h4>
                                    <p className="text-xs text-slate-500 font-medium">{inq.name} - {inq.email}</p>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold mt-1 inline-block">{inq.status}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500">No new inquiries.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">System Status</h3>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 rounded-2xl bg-indigo-50 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden shrink-0">
                            <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-2xl">
                                {user?.name?.[0] || 'A'}
                            </div>
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Server Status</p>
                                <p className="text-xs font-bold text-emerald-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Operational</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Database</p>
                                <p className="text-xs font-bold text-emerald-500">Connected (MongoDB)</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Logged In As</p>
                                <p className="text-xs font-bold text-slate-700 dark:text-white break-all">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Login</p>
                                <p className="text-xs font-bold text-slate-700 dark:text-white">Just Now</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
