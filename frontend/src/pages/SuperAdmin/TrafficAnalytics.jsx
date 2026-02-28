import React, { useState, useEffect } from 'react';
import {
    Globe, Smartphone, Monitor, UserCheck, Activity, MapPin, Tablet, Users, Download,
    MoreHorizontal, Search, Trash2, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, updateTime }) => (
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
                <Activity size={12} className="opacity-60" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">update : {updateTime}</span>
            </div>
        </div>
    </div>
);

const TrafficAnalytics = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const result = await res.json();
            if (res.ok) setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // 10s Live Update
        return () => clearInterval(interval);
    }, []);

    // Socket Listener for real-time
    useEffect(() => {
        if (!window.io) return;
        const socket = window.io;
        socket.on('new_visitor', (newVisit) => {
            // Optimistic update or just simpler refetch
            fetchData();
        });
        return () => socket.off('new_visitor');
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Calibrating Analytics...</p>
        </div>
    );

    const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const deviceData = data?.stats?.devices || [];
    const countryData = data?.stats?.countries || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Row 1: Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Live Visitors (5 min)"
                    value={data?.live?.count || 0}
                    icon={Activity}
                    color="bg-gradient-to-r from-[#10b981] to-[#34d399]"
                    updateTime="Live"
                />
                <StatCard
                    title="Total Visits (24h)"
                    value={data?.stats?.daily || 0}
                    icon={Users}
                    color="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]"
                    updateTime="Just now"
                />
                <StatCard
                    title="Top Region"
                    value={data?.stats?.countries[0]?._id || 'Global'}
                    icon={Globe}
                    color="bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa]"
                    updateTime="Just now"
                />
                <StatCard
                    title="Unique Sessions"
                    value={(data?.stats?.daily * 0.7).toFixed(0)} // Approximated for demo
                    icon={UserCheck}
                    color="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]"
                    updateTime="Just now"
                />
            </div>

            {/* Row 2: Live Map & Device Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Visitor Feed */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Live Traffic Feed</h3>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Real-time</p>
                    </div>
                    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 backdrop-blur-sm">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Location</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Page Path</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Device</th>
                                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {data?.live?.visitors?.map((v, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors animate-in slide-in-from-left duration-300">
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-slate-800 dark:text-white">{v.userName || 'Guest'}</span>
                                                {v.userEmail && <span className="text-[10px] text-slate-400">{v.userEmail}</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                                    <MapPin size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-white">{v.city !== 'Unknown' ? v.city : 'Anonymous'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{v.country}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-600 dark:text-slate-400">{v.path}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                                                    {v.device === 'mobile' ? <Smartphone size={14} /> : v.device === 'tablet' ? <Tablet size={14} /> : <Monitor size={14} />}
                                                    {v.os}
                                                </div>
                                                {(v.deviceVendor && v.deviceVendor !== 'Unknown') && (
                                                    <span className="text-[10px] text-slate-400 mt-1 pl-6">
                                                        {v.deviceVendor} {v.deviceModel !== 'Unknown' ? v.deviceModel : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right text-xs font-mono font-bold text-emerald-500">
                                            Just Now
                                        </td>
                                    </tr>
                                ))}
                                {(!data?.live?.visitors || data.live.visitors.length === 0) && (
                                    <tr><td colSpan="4" className="text-center p-8 text-slate-400 text-sm">Waiting for live traffic...</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Device Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Device Breakdown</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Last 24 Hours</p>
                    <div className="relative w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
                            <Smartphone size={32} className="text-slate-300 dark:text-slate-600 mb-2" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3: Demographics */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Visitor Demographics (Top Countries)</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={countryData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                            <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} width={100} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default TrafficAnalytics;
