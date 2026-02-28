import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { Save, Lock, CreditCard, Bell, AlertTriangle, RefreshCw, Download } from 'lucide-react';

const SystemSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        currency: 'INR (₹)',
        gstPercentage: 18,
        maintenanceMode: false,
        whatsappEnabledGlobal: true,
        paymentGatewayActive: false,
        razorpayKey: '',
        razorpaySecret: '' // Ideally masked
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/settings`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) setSettings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(settings)
            });
            if (res.ok) alert('System Configuration Updated Successfully!');
            else alert('Failed to update settings');
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleBackup = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/backup`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `SaaS_Backup_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert('Backup Failed');
            }
        } catch (error) {
            console.error(error);
            alert('Network Error during backup');
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 dark:text-slate-500 animate-pulse font-bold">Loading Configuration...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Global Configuration</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Manage system-wide parameters and feature switches.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full md:w-auto bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-blue-500 transition-all shadow-xl shadow-slate-200 dark:shadow-blue-900/20"
                >
                    {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Critical Controls */}
                <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-[2.5rem] border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl"><AlertTriangle size={20} /></div>
                        <h3 className="text-lg font-bold text-red-900 dark:text-red-400">Critical Access</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">Maintenance Mode</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Shut down access for all non-admin users.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.maintenanceMode}
                                    onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl"><CreditCard size={20} /></div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Financial & Payment</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Global Payment Gateway</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Razorpay / Stripe Integration</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.paymentGatewayActive}
                                    onChange={e => setSettings({ ...settings, paymentGatewayActive: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {settings.paymentGatewayActive && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                <input
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all input-password"
                                    placeholder="API Key (e.g. rzp_test_...)"
                                    value={settings.razorpayKey || ''}
                                    onChange={e => setSettings({ ...settings, razorpayKey: e.target.value })}
                                />
                                <input
                                    type="password"
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                                    placeholder="API Secret"
                                    value={settings.razorpaySecret || ''}
                                    onChange={e => setSettings({ ...settings, razorpaySecret: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Currency</label>
                                <input
                                    className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white outline-none"
                                    value={settings.currency}
                                    onChange={e => setSettings({ ...settings, currency: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Tax (GST %)</label>
                                <input
                                    type="number"
                                    className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white outline-none"
                                    value={settings.gstPercentage}
                                    onChange={e => setSettings({ ...settings, gstPercentage: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Automation Toggles */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl"><Bell size={20} /></div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Communication Channels</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">WhatsApp API</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Enable automated WhatsApp notifications.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.whatsappEnabledGlobal}
                                    onChange={e => setSettings({ ...settings, whatsappEnabledGlobal: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Data & Security */}
                <div className="bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] md:col-span-2 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-xl"><Lock size={20} /></div>
                        <h3 className="text-lg font-bold">Data Governance & Security</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <h4 className="font-bold mb-2">System Backup</h4>
                            <p className="text-xs text-slate-400 mb-4">Export full database dump (JSON) for disaster recovery.</p>
                            <button
                                onClick={handleBackup}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={16} /> Download Dump
                            </button>
                        </div>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold">GDPR Compliance Mode</h4>
                                    <p className="text-xs text-slate-400 mt-1">Mask sensitive user data (PII) in logs.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SystemSettings;
