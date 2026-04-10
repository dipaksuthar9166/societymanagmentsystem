import React, { useState, useEffect, useRef } from 'react';
import { Mic, Radio, MessageCircle, Signal, Shield, Users, Volume2 } from 'lucide-react';

const WalkieTab = ({ user }) => {
    const [isTransmitting, setIsTransmitting] = useState(false);
    const [broadcasts, setBroadcasts] = useState([
        { id: 1, sender: 'Gate 1 - Officer Sharma', msg: 'Delivery vehicle MH02-1234 entered.', time: '2 mins ago', type: 'info' },
        { id: 2, sender: 'Main Tower Security', msg: 'Resident reported water leakage in B-wing.', time: '5 mins ago', type: 'alert' },
        { id: 3, sender: 'Patrol Team 2', msg: 'Basement CCTV check completed. All clear.', time: '12 mins ago', type: 'info' },
    ]);
    const [status, setStatus] = useState('Standby');
    const scrollRef = useRef(null);

    const handlePTTStart = () => {
        setIsTransmitting(true);
        setStatus('TRANSMITTING...');
        // In a real app: navigator.mediaDevices.getUserMedia(...)
    };

    const handlePTTEnd = () => {
        setIsTransmitting(false);
        setStatus('Standby');
        const newMsg = {
            id: Date.now(),
            sender: `Officer ${user?.name || 'Gate'}`,
            msg: 'Voice message broadcasted to all security units.',
            time: 'Just now',
            type: 'voice'
        };
        setBroadcasts([newMsg, ...broadcasts]);
    };

    return (
        <div className="h-[calc(100vh-180px)] flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Left: Walkie Interface */}
            <div className="w-full md:w-80 bg-slate-900 rounded-[50px] p-8 flex flex-col items-center justify-between shadow-2xl border-t-8 border-slate-800">
                <div className="w-full">
                    {/* Screen */}
                    <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-3xl p-6 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20 animate-scan"></div>
                        <div className="flex justify-between items-center mb-4">
                            <Signal size={12} className="text-emerald-500" />
                            <div className="flex gap-1">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></span>
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">CH-01 SECURITY MGR</p>
                        <h4 className={`text-xl font-mono font-black ${isTransmitting ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                            {status}
                        </h4>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                            <Radio size={16} className="text-slate-400" />
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Global Channel</p>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                            <Shield size={16} className="text-slate-400" />
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Emergency Ready</p>
                        </div>
                    </div>
                </div>

                {/* Big PTT Button */}
                <div className="relative">
                    {isTransmitting && (
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25 scale-150"></div>
                    )}
                    <button 
                        onMouseDown={handlePTTStart}
                        onMouseUp={handlePTTEnd}
                        onTouchStart={handlePTTStart}
                        onTouchEnd={handlePTTEnd}
                        className={`w-32 h-32 rounded-full border-8 border-slate-800 flex flex-col items-center justify-center transition-all active:scale-90 touch-none shadow-2xl ${isTransmitting ? 'bg-red-600' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                        <Mic size={32} className="text-white mb-2" />
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">PUSH TO TALK</span>
                    </button>
                </div>

                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center leading-relaxed">
                    Hold to broadcast voice<br />to all active guard units
                </p>
            </div>

            {/* Right: History/Log */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter">Talkie Log</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent society broadcasts</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400">12 ONLINE</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {broadcasts.map(log => (
                        <div key={log.id} className={`p-4 rounded-[25px] border ${
                            log.type === 'alert' ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20' : 
                            log.type === 'voice' ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/20' :
                            'bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-700'
                        } flex gap-4 animate-in slide-in-from-right duration-300`}>
                            <div className={`p-2 rounded-xl h-fit ${
                                log.type === 'alert' ? 'bg-red-500 text-white' : 
                                log.type === 'voice' ? 'bg-indigo-500 text-white' :
                                'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}>
                                {log.type === 'voice' ? <Volume2 size={16} /> : <Radio size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{log.sender}</p>
                                    <p className="text-[9px] font-bold text-slate-400">{log.time}</p>
                                </div>
                                <p className={`text-sm font-bold ${log.type === 'alert' ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {log.msg}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Message Bar */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                    <button onClick={() => setBroadcasts([{ id: Date.now(), sender: 'Main Gate', msg: 'All Clear.', time: 'Just now', type: 'info' }, ...broadcasts])} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors">All Clear</button>
                    <button onClick={() => setBroadcasts([{ id: Date.now(), sender: 'Main Gate', msg: 'Emergency Assistance Needed!', time: 'Just now', type: 'alert' }, ...broadcasts])} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition-colors">Alert SOS</button>
                </div>
            </div>
        </div>
    );
};

export default WalkieTab;
