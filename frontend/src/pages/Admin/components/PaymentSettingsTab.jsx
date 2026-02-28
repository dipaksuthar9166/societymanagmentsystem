import React, { useState, useEffect } from 'react';
import { CreditCard, Save, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useAlert } from '../../../context/AlertContext';
import { API_BASE_URL } from '../../../config';

const PaymentSettingsTab = ({ token }) => {
    const { showAlert } = useAlert();
    const [settings, setSettings] = useState({
        keyId: '',
        keySecret: '',
        isActive: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/society`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const company = await response.json();
                if (company.paymentGateway) {
                    setSettings({
                        keyId: company.paymentGateway.keyId || '',
                        keySecret: '',
                        isActive: company.paymentGateway.isActive || false
                    });
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (settings.isActive && (!settings.keyId || (!settings.keySecret && !settings.keyId))) {
            showAlert('error', 'Please provide both Key ID and Secret to enable payments.');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('razorpayKeyId', settings.keyId);
            formData.append('razorpayKeySecret', settings.keySecret);
            formData.append('razorpayActive', settings.isActive);

            const response = await fetch(`${API_BASE_URL}/admin/society`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to update');

            showAlert('success', 'Payment gateway settings updated successfully!');
            setSettings(prev => ({ ...prev, keySecret: '' }));
        } catch (error) {
            console.error(error);
            showAlert('error', 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Online Payment Configuration</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Configure Razorpay to accept payments from residents directly to your account.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-8">
                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                {settings.isActive ? <CheckCircle size={20} /> : <Lock size={20} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white">Accept Online Payments</h3>
                                <p className="text-xs text-slate-500">Allow residents to pay bills via UPI, Cards, Netbanking.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.isActive}
                                onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Lock size={16} /> API Credentials</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                You can find these keys in your Razorpay Dashboard under <strong>Settings &rarr; API Keys</strong>.
                                <br />Ensure you are using <strong>Live Mode</strong> keys for real transactions.
                            </p>
                            <a href="https://dashboard.razorpay.com/" target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline">Go to Razorpay Dashboard &rarr;</a>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Key ID</label>
                                <input
                                    type="text"
                                    required={settings.isActive}
                                    value={settings.keyId}
                                    onChange={(e) => setSettings({ ...settings, keyId: e.target.value })}
                                    placeholder="rzp_live_xxxxxxxxxxxxxx"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Key Secret</label>
                                <input
                                    type="password"
                                    // required={settings.isActive && !settings.keyId} 
                                    value={settings.keySecret}
                                    onChange={(e) => setSettings({ ...settings, keySecret: e.target.value })}
                                    placeholder="Enter new secret to update"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                                />
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                    <AlertCircle size={10} /> Leave blank to keep existing secret
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : <Save size={18} />}
                            Save Configuration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentSettingsTab;
