import React, { useState, useEffect, useRef } from 'react';
import { 
    Phone, 
    Video, 
    Search, 
    User as UserIcon, 
    X, 
    Loader2, 
    Shield, 
    Wrench, 
    Clock, 
    Book, 
    MessageSquare,
    Home,
    Users,
    Activity,
    CreditCard,
    ChevronRight,
    Volume2,
    VideoOff,
    MicOff,
    Monitor
} from 'lucide-react';
import { API_BASE_URL } from '../../../config';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../../../config';
import { useToast } from '../../../components/ToastProvider';

const IntercomCallTab = ({ user, isMobile }) => {
    const { showError, showSuccess } = useToast();
    const [residents, setResidents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('quick-call'); 
    
    // Call states
    const [callingStatus, setCallingStatus] = useState(null); 
    const [currentCall, setCurrentCall] = useState(null); 
    const [roomName, setRoomName] = useState('');
    
    const socketRef = useRef(null);
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);

    useEffect(() => {
        fetchResidents();
        
        socketRef.current = io(BACKEND_URL, { transports: ['polling', 'websocket'] });
        
        socketRef.current.on('call-accepted', (data) => {
            console.log("Call accepted!", data);
            showSuccess('Call Connected', 'Connected successfully.');
            setCallingStatus('in-call');
            startJitsiCall(data.roomName);
        });

        socketRef.current.on('call-rejected', () => {
            showError('Call Rejected', 'The recipient declined the call.');
            endCall();
        });

        socketRef.current.on('connect', () => {
            console.log("Socket connected, processing initial room joins...");
            if (user) {
                socketRef.current.emit('join_room', user._id || user.id);
                socketRef.current.emit('join_role', { 
                    societyId: user.company || user.societyId, 
                    role: user.role 
                });
            }

            // Process pending call ONLY AFTER socket is ready
            if (window.pendingIncomingCall) {
                const call = window.pendingIncomingCall;
                window.pendingIncomingCall = null;
                
                console.log("Auto-accepting pending call after socket connect:", call);
                setCallingStatus('in-call');
                setRoomName(call.roomName);
                setCurrentCall({ name: call.from, _id: call.fromId });

                socketRef.current.emit('call-accepted', {
                    to: call.fromId,
                    roomName: call.roomName
                });

                setTimeout(() => startJitsiCall(call.roomName), 300);
            }
        });

        return () => {
            if (jitsiApiRef.current) jitsiApiRef.current.dispose();
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const fetchResidents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/community/directory`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setResidents(data.filter(r => r._id !== user._id && r._id !== user.id).map(r => ({
                    ...r,
                    sortFlat: parseInt((r.flatNo || '').replace(/\D/g, '') || 0)
                })).sort((a,b) => a.sortFlat - b.sortFlat));
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const initiateCall = (recipient) => {
        const generatedRoom = `intercom_${Math.random().toString(36).substr(2, 9)}`;
        setRoomName(generatedRoom);
        setCurrentCall(recipient);
        setCallingStatus('calling');

        socketRef.current.emit('initiate-call', {
            to: recipient._id,
            from: user.name,
            fromId: user._id || user.id,
            societyId: user.company || user.societyId,
            roomName: generatedRoom
        });
    };

    const startJitsiCall = (roomName) => {
        // Advanced DOM Validation: Ensure the container is not only referenced but also present in the active document
        if (!jitsiContainerRef.current || !document.contains(jitsiContainerRef.current)) {
            console.warn("Jitsi container node is not attached to the document yet. Retrying...");
            setTimeout(() => startJitsiCall(roomName), 400); // Wait for React to finish mounting the div
            return;
        }

        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
        }

        const domain = "meet.jit.si";
        const options = {
            roomName: roomName,
            width: "100%",
            height: "100%",
            parentNode: jitsiContainerRef.current,
            configOverwrite: { 
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                disableDeepLinking: true,
                prejoinPageEnabled: false
            },
            interfaceConfigOverwrite: {
                MOBILE_APP_PROMO: false,
                TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup', 'videoquality', 'fittoscreen']
            },
            userInfo: {
                displayName: user.name
            }
        };
        
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current.addEventListeners({
            readyToClose: () => endCall(),
            videoConferenceLeft: () => endCall()
        });
    };

    const endCall = () => {
        if (jitsiApiRef.current) jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
        setCallingStatus(null);
        setCurrentCall(null);
        setRoomName('');
    };

    const filteredResidents = residents.filter(r => 
        (r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (r.flatNo && r.flatNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // --- MOBILE VIEW ---
    if (isMobile) {
        if (callingStatus === 'calling') {
            return (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[40px] shadow-2xl h-[600px] border border-slate-100">
                    <div className="relative">
                        <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-8 relative border-4 border-indigo-200">
                            <Phone size={48} className="text-indigo-600 animate-pulse" />
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 animate-ping opacity-25"></div>
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Calling...</h3>
                    <p className="text-lg font-bold text-indigo-600 mb-12">{currentCall?.name} ({currentCall?.flatNo})</p>
                    <button 
                        onClick={endCall}
                        className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-red-600 transition-all hover:scale-110"
                    >
                        <X size={32} />
                    </button>
                </div>
            );
        }

        if (callingStatus === 'in-call') {
            return (
                <div className="relative w-full h-[650px] bg-black rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-900">
                    <div ref={jitsiContainerRef} className="w-full h-full" />
                    <button 
                        onClick={endCall}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 px-10 py-4 bg-red-600 text-white rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-700 shadow-2xl z-50 flex items-center gap-2"
                    >
                        <X size={20} /> End Meeting
                    </button>
                </div>
            );
        }

        return (
            <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 max-w-lg mx-auto">
                {/* Header */}
                <div className="px-6 pt-10 pb-4 text-center">
                    <h1 className="text-lg font-black text-slate-800 dark:text-white mb-6 uppercase tracking-widest">MyGateConnect</h1>
                    <div className="relative group mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Residents, Guard..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold border-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 text-slate-800 dark:text-white"
                        />
                    </div>
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setActiveTab('quick-call')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'quick-call' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}><Phone size={14} /> QUICK CALL</button>
                        <button onClick={() => setActiveTab('recent')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'recent' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}><Clock size={14} /> RECENT</button>
                        <button onClick={() => setActiveTab('directory')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}><Book size={14} /> DIRECTORY</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-24">
                    {activeTab === 'quick-call' && (
                        <div className="space-y-4">
                            <button onClick={() => initiateCall({ _id: 'guard', name: 'Security Guard', flatNo: 'Emergency' })} className="w-full flex items-center justify-between p-4 bg-red-500 hover:bg-red-600 transition-colors rounded-2xl text-white shadow-lg"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Shield size={24} /></div><div className="text-left"><h3 className="text-sm font-black uppercase tracking-wider">SECURITY GUARD</h3><p className="text-[10px] font-bold opacity-80">Call Now</p></div></div><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 shadow-lg"><Phone size={18} /></div></button>
                            <button onClick={() => initiateCall({ _id: 'admin', name: 'Maintenance Desk', flatNo: 'Office' })} className="w-full flex items-center justify-between p-4 bg-blue-500 hover:bg-blue-600 transition-colors rounded-2xl text-white shadow-lg"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Wrench size={24} /></div><div className="text-left"><h3 className="text-sm font-black uppercase tracking-wider">MAINTENANCE</h3><p className="text-[10px] font-bold opacity-80">Help Desk</p></div></div><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-lg"><Phone size={18} /></div></button>
                            <div className="mt-8"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Frequent Contacts</p><div className="space-y-3">{loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div> : filteredResidents.slice(0, 5).map(r => (<div key={r._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:scale-[1.01]"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r._id}`} alt="avatar" className="w-full h-full object-cover" /></div><div><h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">{r.flatNo || 'N/A'}</h3><p className="text-xs font-bold text-slate-400 truncate w-32">{r.name}</p></div></div><div className="flex gap-2"><button onClick={() => initiateCall(r)} className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"><Phone size={16} /></button><button className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"><MessageSquare size={16} /></button></div></div>))}</div></div>
                        </div>
                    )}
                    {activeTab !== 'quick-call' && (
                        <div className="space-y-3">{loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={32} /></div> : filteredResidents.map(r => (<div key={r._id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400"><UserIcon size={24} /></div><div><h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">{r.flatNo}</h3><p className="text-xs font-bold text-slate-400">{r.name}</p></div></div><button onClick={() => initiateCall(r)} className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"><Phone size={16} /></button></div>))}</div>
                    )}
                </div>
            </div>
        );
    }

    // --- DESKTOP VIEW (Premium & Clean) ---
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            {/* Left Side: Directory & Search */}
            <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Society Registry</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Intercom Access Network</p>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by Flat or Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-xl text-sm font-semibold border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="animate-spin text-indigo-600" size={40} />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Building Directory...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredResidents.map(r => (
                                <div key={r._id} className="group p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-indigo-600 font-black text-xs uppercase tracking-tighter group-hover:scale-110 transition-transform">
                                            {r.flatNo || 'Ext'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-black text-slate-800 dark:text-white truncate uppercase tracking-tighter">{r.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => initiateCall(r)}
                                            className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                                        >
                                            <Phone size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Command Center & Active Call */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Status Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-3xl text-white shadow-xl shadow-indigo-500/20 overflow-hidden relative group">
                    <Monitor className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 transition-transform group-hover:scale-125" size={100} />
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Intercom Hub</h3>
                    <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Gate & Security Controls</p>
                    
                    <div className="mt-8 grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => initiateCall({ _id: 'guard', name: 'Security Guard', flatNo: 'Emergency' })}
                            className="bg-white/10 hover:bg-red-500 transition-all p-4 rounded-2xl backdrop-blur-md flex flex-col items-center gap-2 border border-white/10"
                        >
                            <Shield size={24} />
                            <span className="text-[10px] font-black uppercase">Guard</span>
                        </button>
                        <button 
                            onClick={() => initiateCall({ _id: 'admin', name: 'Maintenance Desk', flatNo: 'Office' })}
                            className="bg-white/10 hover:bg-blue-500 transition-all p-4 rounded-2xl backdrop-blur-md flex flex-col items-center gap-2 border border-white/10"
                        >
                            <Wrench size={24} />
                            <span className="text-[10px] font-black uppercase">Help Desk</span>
                        </button>
                    </div>
                </div>

                {/* Active View / Dialer */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl flex flex-col">
                    {callingStatus ? (
                        <div className="flex-1 flex flex-col">
                            {callingStatus === 'calling' ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 animate-in fade-in duration-500">
                                    <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 relative shadow-lg">
                                        <Volume2 size={40} className="text-indigo-600 animate-bounce" />
                                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500 animate-ping opacity-25"></div>
                                    </div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Connecting to</p>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter text-center">{currentCall?.name}</h3>
                                    <div className="mt-12 flex gap-4">
                                        <button onClick={endCall} className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-all active:scale-90 shadow-lg shadow-red-500/30">
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 bg-black relative animate-in zoom-in duration-300">
                                    <div ref={jitsiContainerRef} className="w-full h-full" />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button onClick={endCall} className="px-4 py-2 bg-red-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg">Hangup</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                                <Phone size={32} className="opacity-20" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Ready to Call</h3>
                            <p className="text-xs font-bold opacity-60 mt-2">Select a resident or service to initiate communication.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntercomCallTab;
