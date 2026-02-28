import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Zap, ShieldAlert, Cpu, Share2, HeartPulse, UserCheck, ToggleLeft, ToggleRight, Radio } from 'lucide-react';

const CommunityFeatures = () => {
    const { user } = useAuth();
    const [features, setFeatures] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const featureConfig = {
        'EV_PARKING': {
            label: 'AI Smart Parking & EV',
            desc: 'Automated slot booking & EV charging management.',
            icon: Zap,
            color: 'text-amber-500 bg-amber-50'
        },
        'SKILL_MARKET': {
            label: 'Hyper-Local Skill Swap',
            desc: 'Internal marketplace for resident talents & services.',
            icon: UserCheck,
            color: 'text-indigo-500 bg-indigo-50'
        },
        'ASSET_SHARE': {
            label: 'Asset Library (Circular Economy)',
            desc: 'Peer-to-peer sharing of tools & household items.',
            icon: Share2,
            color: 'text-blue-500 bg-blue-50'
        },
        'EMERGENCY_SOS': {
            label: 'One-Tap Med-SOS Chain',
            desc: 'Instant alerts to nearby doctors & blood donors.',
            icon: HeartPulse,
            color: 'text-red-500 bg-red-50'
        },
        'IOT_LEAKAGE': {
            label: 'IoT Utility Sentinels',
            desc: 'Real-time sensors for water/gas leaks & tank levels.',
            icon: Cpu,
            color: 'text-cyan-500 bg-cyan-50'
        },
        'DIGITAL_DEMOCRACY': {
            label: 'Digital Democracy & Whistleblower',
            desc: 'Anonymous reporting & green gamification scores.',
            icon: ShieldAlert,
            color: 'text-emerald-500 bg-emerald-50'
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const fRes = await fetch(`${API_BASE_URL}/superadmin/features`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const lRes = await fetch(`${API_BASE_URL}/superadmin/features/logs`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (fRes.ok) {
                const data = await fRes.json();
                // Ensure all keys exist even if DB is partial
                const allKeys = Object.keys(featureConfig);
                const merged = allKeys.map(key => {
                    const found = data.find(d => d.module === key);
                    return found || { _id: key, module: key, isActive: false }; // Temporary ID for non-persisted
                });
                setFeatures(merged);
            }
            if (lRes.ok) setLogs(await lRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id, currentStatus) => {
        // If it's a temp ID (string), we can't toggle it until it's created. 
        // For prototype, we assume backend seed populated them.
        if (typeof id === 'string') return alert('Please refresh to sync new features.');

        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/features/${id}/toggle`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                setFeatures(features.map(f => f._id === id ? { ...f, isActive: !f.isActive } : f));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Loading Smart Modules...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Community Operating System</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Next-gen modules for a smarter, safer society.</p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, idx) => {
                    // Note: featureConfig is defined inside component or passed as prop. Assuming it's available.
                    // If featureConfig was outside, it would be better. But here it is inside.
                    // Wait, featureConfig is defined at line 12. Use it.
                    const config = featureConfig[feature.module] || {
                        label: feature.module,
                        icon: Zap,
                        color: 'text-slate-500 bg-slate-50 dark:bg-slate-700 dark:text-slate-300'
                    };
                    const Icon = config.icon || Zap; // Fallback icon

                    // Dark mode color adjustment for config.color which is like 'text-amber-500 bg-amber-50'
                    // We need to inject dark classes. 
                    // Simple hack: String replacement or check specific modules.
                    // Better approach: Define dark classes in featureConfig map, but I can't change that part easily without context of rest of file (which I have).
                    // I will change how I use config.color below.

                    let colorClass = config.color;
                    if (config.color.includes('amber')) colorClass = 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20';
                    if (config.color.includes('indigo')) colorClass = 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20';
                    if (config.color.includes('blue')) colorClass = 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
                    if (config.color.includes('red')) colorClass = 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
                    if (config.color.includes('cyan')) colorClass = 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/20';
                    if (config.color.includes('emerald')) colorClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20';


                    return (
                        <div key={idx} className={`relative p-6 rounded-3xl border transition-all duration-300 ${feature.isActive ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200 dark:shadow-slate-900/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-75 grayscale'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${colorClass}`}>
                                    <Icon size={24} />
                                </div>
                                <button onClick={() => handleToggle(feature._id, feature.isActive)} className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    {feature.isActive ? <ToggleRight size={32} className="text-blue-600 dark:text-blue-500" /> : <ToggleLeft size={32} />}
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{config.label}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{config.desc}</p>

                            {feature.isActive && (
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full w-fit">
                                    <Radio size={12} className="animate-pulse" /> Live Active
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Radio size={24} className="text-red-500 dark:text-red-400 animate-pulse" />
                        Live Network Activity
                    </h3>
                </div>
                <div className="p-0">
                    {logs.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium bg-slate-50/50 dark:bg-slate-900/50">
                            No recent smart activity detected. System is standing by.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {logs.map(log => (
                                <div key={log._id} className="p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className={`p-2 rounded-full mt-1 ${log.type === 'SOS_ALERT' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                                            log.type === 'SKILL_LISTING' ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' :
                                                'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                        }`}>
                                        {featureConfig[log.type] ? React.createElement(featureConfig[log.type].icon, { size: 16 }) : <Zap size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                                            {log.title}
                                            <span className="ml-2 text-[10px] font-normal text-slate-400 dark:text-slate-500 uppercase tracking-wider">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{log.description}</p>
                                        <div className="flex gap-2 mt-2">
                                            {log.user && <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{log.user.name}</span>}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${log.status === 'ACTIVE' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                                                    'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                                }`}>{log.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityFeatures;
