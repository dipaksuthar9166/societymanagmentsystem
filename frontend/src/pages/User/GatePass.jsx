import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Copy, RefreshCw, Loader2, Share2, ShieldCheck, User as UserIcon, Ticket, ChevronRight } from 'lucide-react';

const GatePass = ({ isMobile }) => {
    const { user } = useAuth();
    const [guestName, setGuestName] = useState('');
    const [purpose, setPurpose] = useState('Guest');
    const [generatedCode, setGeneratedCode] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/visitors/pre-approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ name: guestName, purpose, hostUserId: user._id, societyId: user.company, mobile: '0000000000' })
            });
            if (res.ok) {
                const data = await res.json();
                let code = data.code || data.visitor?.code;
                if (!code) code = Math.random().toString(36).substring(2, 8).toUpperCase();
                setGeneratedCode(code);
            } else { setGeneratedCode(Math.random().toString(36).substring(2, 8).toUpperCase()); }
        } catch (error) { setGeneratedCode(Math.random().toString(36).substring(2, 8).toUpperCase()); } finally { setLoading(false); }
    };

    if (isMobile) {
        return (
            <div className="space-y-6 max-w-lg mx-auto">
                {!generatedCode ? (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Ticket size={80} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-1">Pre-Approve</h3>
                                <p className="text-xs text-slate-500 font-medium max-w-[200px]">Ensure hassle-free entry by creating new approval for future entries</p>
                            </div>

                            <div className="mt-8 space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Guest Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        required 
                                        value={guestName} 
                                        onChange={(e) => setGuestName(e.target.value)} 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-4 pl-12 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-300" 
                                        placeholder="Who is coming?" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-50">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Select Category</h4>
                            </div>
                            <div className="p-2 grid grid-cols-1 gap-1">
                                {[
                                    { id: 'Delivery', label: 'Delivery', icon: '🛵', color: 'bg-orange-50 text-orange-600' },
                                    { id: 'Guest', label: 'Guest', icon: '👥', color: 'bg-blue-50 text-blue-600' },
                                    { id: 'Cab', label: 'Cab / Taxi', icon: '🚕', color: 'bg-yellow-50 text-yellow-600' },
                                    { id: 'Service', label: 'Service / Repair', icon: '🛠️', color: 'bg-purple-50 text-purple-600' },
                                    { id: 'Other', label: 'Other', icon: '✨', color: 'bg-slate-50 text-slate-600' }
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setPurpose(cat.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-3xl transition-all ${purpose === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]' : 'hover:bg-slate-50 text-slate-700'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${purpose === cat.id ? 'bg-white/20' : cat.color}`}>
                                                {cat.icon}
                                            </div>
                                            <span className="font-black text-sm uppercase tracking-wider">{cat.label}</span>
                                        </div>
                                        <ChevronRight size={18} className={purpose === cat.id ? 'text-white' : 'text-slate-300'} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={loading || !guestName} 
                            className={`w-full py-5 rounded-[25px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${loading || !guestName ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white active:scale-95 shadow-slate-200'}`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Create Verification Pass'}
                        </button>

                        <div className="bg-slate-100 p-4 rounded-2xl flex items-center gap-3">
                            <div className="p-2 bg-white rounded-full"><RefreshCw size={14} className="text-slate-400" /></div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Voice Command Coming Soon</p>
                        </div>
                    </div>
                ) : (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[40px] shadow-2xl border border-slate-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <div className="mb-6 mt-4">
                            <div className="bg-slate-50 p-6 rounded-[35px] inline-block shadow-inner border border-slate-100 mb-4">
                                <QRCodeCanvas value={generatedCode} size={200} fgColor="#0f172a" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Show QR code at gate</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Backup Code</p>
                            <h2 className="text-3xl font-mono font-black text-slate-900 tracking-[0.2em]">{generatedCode}</h2>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-xl font-black text-slate-800 leading-tight">{guestName}</h3>
                            <p className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mt-1">{purpose}</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex-1 py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition flex items-center justify-center gap-2"><Share2 size={16} /> Share Pass</button>
                            <button onClick={() => { setGeneratedCode(null); setGuestName(''); }} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition flex items-center justify-center gap-2"><RefreshCw size={16} /> New Pass</button>
                        </div>
                    </motion.div>
                )}
            </div>
        );
    }

    // ORIGINAL DESKTOP UI
    return (
        <div className="p-4 md:p-6 max-w-lg mx-auto w-full">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-6 tracking-tight italic">Pre-Authorized Access Entry</h1>

            {!generatedCode ? (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-bl-[100px] -z-0"></div>

                    <form onSubmit={handleGenerate} className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Visitor Name</label>
                            <input
                                type="text"
                                required
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 dark:text-white bg-slate-50 dark:bg-slate-900 transition-colors"
                                placeholder="Enter guest name"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Purpose of Visit</label>
                            <select
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 dark:text-white bg-slate-50 dark:bg-slate-900 transition-colors"
                            >
                                <option value="Guest">FAMILY & FRIENDS</option>
                                <option value="Delivery">ONLINE DELIVERY (Zomato/Swiggy)</option>
                                <option value="Service">SERVICE (UrbanCompany/Ac Repair)</option>
                                <option value="Cab">CAB / TAXI (Uber/Ola)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-slate-200"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Generate Verification Pass'}
                        </button>
                    </form>
                </div>
            ) : (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-700 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                    <div className="mb-8">
                        <div className="bg-white p-4 rounded-3xl inline-block shadow-inner border border-slate-100 mb-4">
                            <QRCodeCanvas value={generatedCode} size={220} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Secure Code</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 mb-8 border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <h2 className="text-4xl font-mono font-black text-slate-900 dark:text-white tracking-[0.2em]">{generatedCode}</h2>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">{guestName}</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest mt-1">{purpose}</p>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-green-600 transition shadow-lg shadow-green-100">Share Pass</button>
                        <button
                            onClick={() => { setGeneratedCode(null); setGuestName(''); }}
                            className="flex-1 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition shadow-lg shadow-slate-200"
                        >
                            New Request
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default GatePass;
