
import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle, Smartphone, Monitor, RefreshCw, Settings } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const CommunicationTab = ({ token }) => {
    const [testEmail, setTestEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }
    const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'

    // This mimics the backend template for preview purposes
    const previewHtml = `
        <style>
            @media only screen and (max-width: 600px) {
                .container { width: 100% !important; border-radius: 0 !important; border: none !important; margin: 0 !important; }
                .content-padding { padding: 20px !important; }
                .header-padding { padding: 20px 10px !important; }
                .logo-text { font-size: 24px !important; }
                .otp-box { font-size: 28px !important; letter-spacing: 4px !important; padding: 15px 20px !important; width: 80% !important; }
            }
        </style>
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
             <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td align="center" style="padding: 0;">
                        <!-- Main Container -->
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #eee; border-radius: 8px; overflow: hidden;" class="container">
                            
                            <!-- Header with Branding -->
                            <tr>
                                <td align="center" style="background-color: #f9f9f9; padding: 30px; border-bottom: 3px solid #006D77;" class="header-padding">
                                    <h1 class="logo-text" style="color: #006D77; margin: 0; font-size: 28px; letter-spacing: 1px; font-family: Arial, sans-serif; font-weight: bold;">STATUS <span style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: normal; color: #333;">Sharan</span></h1>
                                    <p style="font-size: 13px; color: #666; margin: 5px 0 0; text-transform: uppercase; letter-spacing: 2px;">Where dreams find solace</p>
                                </td>
                            </tr>

                            <!-- Main Content -->
                            <tr>
                                <td align="center" style="padding: 40px 30px;" class="content-padding">
                                    <h2 style="color: #333; margin-top: 0; font-size: 22px;">Hello, Admin User!</h2>
                                    <p style="color: #555; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
                                        Use the verification code below to login to your account.<br>
                                        This code is valid for the next <strong>10 minutes</strong>.
                                    </p>
                                    
                                    <!-- OTP Box -->
                                    <div class="otp-box" style="
                                        font-size: 36px; 
                                        font-weight: bold; 
                                        letter-spacing: 8px; 
                                        color: #006D77; 
                                        background-color: #e6f2f3; 
                                        padding: 24px 40px; 
                                        border-radius: 12px;
                                        display: inline-block;
                                        margin-bottom: 30px;
                                        border: 2px dashed #006D77;
                                        font-family: 'Courier New', monospace;
                                    ">
                                        123456
                                    </div>

                                    <p style="font-size: 14px; color: #888; margin-top: 0;">
                                        If you didn't request this code, please ignore this email.
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center" style="background-color: #006D77; color: white; padding: 20px; font-size: 12px;">
                                    <p style="margin: 0;">&copy; 2026 Status Sharan Residents Portal | Ahmedabad</p>
                                    <p style="margin: 10px 0 0; opacity: 0.8;">Secure Automated Notification System</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    `;

    const handleSendTest = async (e) => {
        e.preventDefault();
        setSending(true);
        setStatus(null);

        try {
            const res = await fetch(`${API_BASE_URL}/verification/test-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: testEmail })
            });
            const data = await res.json();

            if (data.success) {
                setStatus({ type: 'success', message: `✅ Email sent successfully to ${testEmail}!` });
            } else {
                setStatus({ type: 'error', message: `❌ Failed: ${data.error || 'Unknown error'}` });
            }
        } catch (error) {
            setStatus({ type: 'error', message: `❌ Network Error: ${error.message}` });
        } finally {
            setSending(false);
        }
    };

    const [smsBalance, setSmsBalance] = useState(null);
    const [loadingSms, setLoadingSms] = useState(false);
    const [twilioConfig, setTwilioConfig] = useState({
        accountSid: '',
        authToken: '',
        phoneNumber: '',
        isActive: false
    });
    const [savingTwilio, setSavingTwilio] = useState(false);

    const fetchTwilioConfig = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/society`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data?.twilioConfig) {
                setTwilioConfig({
                    accountSid: data.twilioConfig.accountSid || '',
                    authToken: data.twilioConfig.authToken || '',
                    phoneNumber: data.twilioConfig.phoneNumber || '',
                    isActive: data.twilioConfig.isActive || false
                });
            }
        } catch (error) {
            console.error('Failed to fetch Twilio config:', error);
        }
    };

    const fetchSmsBalance = async () => {
        setLoadingSms(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/sms-balance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setSmsBalance(data);
        } catch (error) {
            console.error('Failed to fetch SMS balance:', error);
        } finally {
            setLoadingSms(false);
        }
    };

    const handleSaveTwilio = async (e) => {
        e.preventDefault();
        setSavingTwilio(true);
        setStatus(null);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/society/twilio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(twilioConfig)
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', message: '✅ Twilio Configuration Saved Successfully!' });
                fetchSmsBalance();
            } else {
                setStatus({ type: 'error', message: data.message || 'Failed to save config' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Network error saving Twilio config' });
        } finally {
            setSavingTwilio(false);
        }
    };

    React.useEffect(() => {
        if (token) {
            fetchSmsBalance();
            fetchTwilioConfig();
        }
    }, [token]);

    return (
        <div className="p-6 space-y-6 overflow-y-auto max-h-screen custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Communication & Email</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage email templates and SMS notifications</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Side: Test & Settings */}
                <div className="space-y-6">
                    {/* SMS Balance Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl shadow-indigo-200 dark:shadow-none text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12"><Smartphone size={80} /></div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                                    {smsBalance?.isGlobal ? 'Global Balance (System)' : 'Society Account Balance'}
                                </p>
                                {loadingSms ? (
                                    <div className="h-10 w-32 bg-white/10 animate-pulse rounded-lg mt-1"></div>
                                ) : (
                                    <h2 className="text-2xl sm:text-3xl font-black">
                                        {smsBalance?.balance && !isNaN(smsBalance.balance)
                                            ? `${smsBalance.currency || '$'}${parseFloat(smsBalance.balance).toFixed(2)}`
                                            : smsBalance?.balance || '0.00'}
                                    </h2>
                                )}
                                <p className="text-[10px] mt-2 font-bold text-white/50 uppercase tracking-tighter">Current Plan: {smsBalance?.type || 'Standard'}</p>
                            </div>
                            <button
                                onClick={fetchSmsBalance}
                                disabled={loadingSms}
                                className={`p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all ${loadingSms ? 'animate-spin' : ''}`}
                            >
                                <RefreshCw size={20} />
                            </button>
                        </div>
                        {smsBalance?.note && <p className="mt-4 text-[9px] font-bold text-white/40 italic">{smsBalance.note}</p>}
                    </div>

                    {/* Twilio Configuration Form */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-4">
                            <Settings className="text-indigo-500" size={20} />
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Twilio Account Settings</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 italic">Configure your own Twilio account to use your custom sender ID and manage your own balance.</p>

                        <form onSubmit={handleSaveTwilio} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Account SID</label>
                                    <input
                                        type="password"
                                        value={twilioConfig.accountSid}
                                        onChange={e => setTwilioConfig({ ...twilioConfig, accountSid: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Auth Token</label>
                                    <input
                                        type="password"
                                        value={twilioConfig.authToken}
                                        onChange={e => setTwilioConfig({ ...twilioConfig, authToken: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="••••••••••••••••••••••••••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Twilio Phone Number</label>
                                    <input
                                        type="text"
                                        value={twilioConfig.phoneNumber}
                                        onChange={e => setTwilioConfig({ ...twilioConfig, phoneNumber: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="+1XXXXXXXXXX"
                                    />
                                </div>
                                <div className="flex items-center gap-3 py-2">
                                    <div
                                        onClick={() => setTwilioConfig({ ...twilioConfig, isActive: !twilioConfig.isActive })}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${twilioConfig.isActive ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${twilioConfig.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Use this account for SMS</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={savingTwilio}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                            >
                                {savingTwilio ? 'Saving...' : 'Save Twilio Configuration'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-4">
                            <Send className="text-teal-500" size={20} />
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Send Test Email</h3>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Send a real verification email to yourself to test the design and delivery.
                        </p>

                        <form onSubmit={handleSendTest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Recipient Email
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="email"
                                        required
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        placeholder="Enter your email..."
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {sending ? 'Sending...' : 'Send'}
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </form>

                        {status && (
                            <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                <div className="text-sm">{status.message}</div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Template Settings</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">OTP Expiry Time</span>
                                <span className="text-sm text-slate-500">5 Minutes (Fixed)</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Service</span>
                                <span className="px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded">Gmail (SMTP)</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fail-Safe Mode</span>
                                <span className="px-2 py-1 text-xs font-bold text-teal-600 bg-teal-100 rounded">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Preview */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Live Preview</h3>
                        <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('desktop')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Monitor size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Smartphone size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={`
                        border-4 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-100 transition-all duration-300 mx-auto
                        ${viewMode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-[600px]'}
                    `}>
                        <div className="w-full h-full bg-white overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunicationTab;
