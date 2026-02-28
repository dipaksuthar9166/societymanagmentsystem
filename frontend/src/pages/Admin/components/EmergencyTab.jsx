import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../config';
import { AlertTriangle, MapPin, CheckCircle, Clock, Flame } from 'lucide-react';

const EmergencyTab = ({ token }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/alerts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setAlerts(data);
        } catch (error) {
            console.error("Fetch Alerts Error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchAlerts();
        const interval = setInterval(() => { if (token) fetchAlerts() }, 10000);
        return () => clearInterval(interval);
    }, [token]);

    const handleResolve = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/alerts/${id}/resolve`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAlerts();
        } catch (error) {
            alert("Failed to resolve");
        }
    };

    const openMap = (lat, lng) => {
        if (!lat || !lng) return alert("Location data not available");
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    const totalAlerts = alerts.length;
    const activeAlerts = alerts.filter(a => a.status === 'Active').length;
    const resolvedAlerts = alerts.filter(a => a.status !== 'Active').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <AlertTriangle className="text-red-600 dark:text-red-500" /> Emergency Alerts
            </h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Total Alerts</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{totalAlerts}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 animate-pulse">
                        <Flame size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Active Emergencies</p>
                        <p className="text-2xl font-black text-red-600 dark:text-red-400">{activeAlerts}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Resolved</p>
                        <p className="text-2xl font-black text-green-600 dark:text-green-400">{resolvedAlerts}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <p className="text-slate-500 dark:text-slate-400">Loading alerts...</p>
            ) : (
                <div className="space-y-4">
                    {alerts.length > 0 ? (
                        alerts.map(alert => (
                            <div
                                key={alert._id}
                                className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${alert.status === 'Active'
                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 shadow-red-100 dark:shadow-none shadow-lg'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-75'
                                    }`}
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className={`font-black text-lg ${alert.status === 'Active' ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {alert.type || 'EMERGENCY'}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${alert.status === 'Active' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                            }`}>
                                            {alert.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-slate-800 dark:text-white font-bold">{alert.userName}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(alert.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto">
                                    {alert.location && alert.location.lat && (
                                        <button
                                            onClick={() => openMap(alert.location.lat, alert.location.lng)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                                        >
                                            <MapPin size={18} /> View Map
                                        </button>
                                    )}

                                    {alert.status === 'Active' && (
                                        <button
                                            onClick={() => handleResolve(alert._id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white font-bold rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition shadow-lg dark:shadow-none"
                                        >
                                            <CheckCircle size={18} /> Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <p className="text-slate-500 dark:text-slate-400">No recent emergency alerts.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmergencyTab;
