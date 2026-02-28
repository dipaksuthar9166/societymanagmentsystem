import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    Users,
    TrendingUp,
    DollarSign,
    FileText,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Activity,
    BarChart3,
    PieChart,
    Download,
    Zap,
    X // Fixed import for X
} from 'lucide-react';
import { API_BASE_URL } from '../../../config';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const UserAnalyticsTab = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [timeRange, setTimeRange] = useState('30'); // days

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/analytics/user-analytics?days=${timeRange}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (res.status === 401) {
                console.error("Session expired or unauthorized");
                return;
            }

            const data = await res.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportData = () => {
        const dataStr = JSON.stringify(analytics, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user-analytics-${new Date().toISOString()}.json`;
        link.click();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        User Analytics Dashboard
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Comprehensive user activity and financial analysis
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">

                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="365">Last Year</option>
                    </select>
                    <button
                        onClick={exportData}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm"
                    >
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Users className="text-blue-600" />}
                    title="Total Users"
                    value={analytics?.summary?.totalUsers || 0}
                    change="+12%"
                    bgColor="bg-blue-50 dark:bg-blue-900/20"
                    lineColor="blue"
                />
                <StatCard
                    icon={<DollarSign className="text-green-600" />}
                    title="Total Collected"
                    value={`₹${(analytics?.summary?.totalCollected || 0).toLocaleString()}`}
                    change="+8%"
                    bgColor="bg-green-50 dark:bg-green-900/20"
                    lineColor="green"
                />
                <StatCard
                    icon={<AlertCircle className="text-amber-600" />}
                    title="Pending Amount"
                    value={`₹${(analytics?.summary?.totalPending || 0).toLocaleString()}`}
                    change="-5%"
                    bgColor="bg-amber-50 dark:bg-amber-900/20"
                    lineColor="amber"
                />
                <StatCard
                    icon={<FileText className="text-purple-600" />}
                    title="Active Complaints"
                    value={analytics?.summary?.activeComplaints || 0}
                    change="-3%"
                    bgColor="bg-purple-50 dark:bg-purple-900/20"
                    lineColor="purple"
                />
            </motion.div>

            {/* Payment Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Payment Status */}
                <motion.div variants={itemVariants} className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500"></div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 size={20} className="text-teal-600" />
                        User Payment Status
                    </h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={analytics?.userPayments || []}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`₹${value}`, 'Amount']}
                                />
                                <Legend />
                                <Bar dataKey="paid" fill="#10b981" name="Paid" radius={[4, 4, 0, 0]} animationDuration={1000} />
                                <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} animationDuration={1000} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Payment Distribution */}
                <motion.div variants={itemVariants} className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <PieChart size={20} className="text-blue-600" />
                        Payment Distribution
                    </h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <RechartsPieChart>
                                <Pie
                                    data={analytics?.paymentDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(analytics?.paymentDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => `₹${value}`}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Activity Timeline */}
            <motion.div variants={itemVariants} className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-indigo-600" />
                    User Activity Timeline
                </h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={analytics?.activityTimeline || []}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(str) => {
                                const date = new Date(str);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={2} dot={false} name="Logins" animationDuration={1500} />
                            <Line type="monotone" dataKey="payments" stroke="#10b981" strokeWidth={2} dot={false} name="Payments" animationDuration={1500} />
                            <Line type="monotone" dataKey="complaints" stroke="#f59e0b" strokeWidth={2} dot={false} name="Complaints" animationDuration={1500} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Detailed User Table */}
            <motion.div variants={itemVariants} className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 via-gray-500 to-slate-500"></div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                    Detailed User Breakdown
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">User</th>
                                <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Flat</th>
                                <th className="text-right py-3 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Paid</th>
                                <th className="text-right py-3 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Pending</th>
                                <th className="text-center py-3 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Complaints</th>
                                <th className="text-center py-3 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Last Active</th>
                                <th className="text-center py-3 px-4 text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(analytics?.userDetails || []).map((user, index) => (
                                <motion.tr
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                                {user.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800 dark:text-white">{user.name}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300 font-medium">{user.flatNo}</td>
                                    <td className="py-3 px-4 text-right text-sm text-green-600 dark:text-green-400 font-semibold">₹{user.paid?.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right text-sm text-amber-600 dark:text-amber-400 font-semibold">₹{user.pending?.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.complaints > 0 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                            {user.complaints}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                                        {user.lastActive}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {user.pending > 0 ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                                                Pending
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-600 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                                                Clear
                                            </span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* User Detail Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <UserDetailModal
                        user={selectedUser}
                        onClose={() => setSelectedUser(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Stat Card Component
const StatCard = ({ icon, title, value, change, bgColor, lineColor = 'blue' }) => {
    const gradients = {
        blue: 'from-blue-500 via-cyan-500 to-blue-500',
        green: 'from-green-500 via-emerald-500 to-green-500',
        amber: 'from-amber-500 via-orange-500 to-amber-500',
        purple: 'from-purple-500 via-pink-500 to-purple-500',
        teal: 'from-teal-500 via-emerald-500 to-teal-500',
        slate: 'from-slate-500 via-gray-500 to-slate-500'
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden bg-white dark:bg-slate-800`}
        >
            {/* Top Gradient Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[lineColor]} animate-gradient bg-[length:200%_100%]`} />

            <div className="flex items-center justify-between mb-3 relative z-10">
                <div className={`p-3 rounded-lg shadow-sm ${bgColor}`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 relative z-10">
                {title}
            </h3>
            <p className="text-2xl font-black text-slate-800 dark:text-white relative z-10 tracking-tight">
                {value}
            </p>

            {/* Background decorative element */}
            <div className="absolute -bottom-4 -right-4 opacity-5 zoom-in-150 transform scale-150 text-current">
                {icon}
            </div>
        </motion.div>
    );
};

// User Detail Modal Component
const UserDetailModal = ({ user, onClose }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {user.name}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Resident Details</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <X size={24} className="text-slate-400" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white border-l-4 border-teal-500 pl-3">Contact Info</h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-3">
                        <DetailRow label="Flat Number" value={user.flatNo} icon={<TrendingUp size={16} />} />
                        <DetailRow label="Email" value={user.email} icon={<Users size={16} />} />
                        <DetailRow label="Last Active" value={user.lastActive} icon={<Activity size={16} />} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white border-l-4 border-amber-500 pl-3">Financial Status</h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-3">
                        <DetailRow label="Total Paid" value={`₹${user.paid?.toLocaleString()}`} valueColor="text-green-600 font-bold" icon={<DollarSign size={16} />} />
                        <DetailRow label="Pending Dues" value={`₹${user.pending?.toLocaleString()}`} valueColor="text-amber-600 font-bold" icon={<AlertCircle size={16} />} />
                        <DetailRow label="Complaints" value={user.complaints} icon={<FileText size={16} />} />
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <button onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium text-sm">
                    Close
                </button>
                <button className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium text-sm shadow-md shadow-teal-500/20">
                    Download Report
                </button>
            </div>
        </motion.div>
    </motion.div>
);

const DetailRow = ({ label, value, valueColor = "text-slate-800 dark:text-white", icon }) => (
    <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            {icon}
            <span>{label}</span>
        </div>
        <span className={`text-sm ${valueColor}`}>{value}</span>
    </div>
);

export default UserAnalyticsTab;
