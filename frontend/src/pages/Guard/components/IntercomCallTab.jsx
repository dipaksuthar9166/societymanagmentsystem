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
    CreditCard
} from 'lucide-react';
import { API_BASE_URL } from '../../../config';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../../../config';
import { useToast } from '../../../components/ToastProvider';

const IntercomCallTab = ({ user }) => {
    const { showError, showSuccess } = useToast();
    const [residents, setResidents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('quick-call'); // quick-call, recent, directory
    
    // Call states
    const [callingStatus, setCallingStatus] = useState(null); // 'calling', 'in-call'
    const [currentCall, setCurrentCall] = useState(null); // The person being called
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

        // Auto-accept if there's a pending call (from dashboard modal)
        if (window.pendingIncomingCall) {
            const call = window.pendingIncomingCall;
            window.pendingIncomingCall = null;
            
            setCallingStatus('in-call');
            setRoomName(call.roomName);
            setCurrentCall({ name: call.from, _id: call.fromId });

            socketRef.current.emit('call-accepted', {
                to: call.fromId,
                roomName: call.roomName
            });

            setTimeout(() => startJitsiCall(call.roomName), 200);
        }

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
            roomName: generatedRoom
        });
    };

    const startJitsiCall = (roomName) => {
        if (!jitsiContainerRef.current) return;

        const domain = "meet.jit.si";
        const options = {
            roomName: roomName,
            width: "100%",
            height: "100%",
            parentNode: jitsiContainerRef.current,
            configOverwrite: { 
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                disableDeepLinking: true
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup', 'videoquality', 'participants-pane']
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
                
                {/* Search Bar */}
                <div className="relative group mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Residents, Guard, or Service (e.g., A-402)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-semibold border-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 text-slate-800 dark:text-white"
                    />
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                    <button 
                        onClick={() => setActiveTab('quick-call')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'quick-call' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                    >
                        <Phone size={14} /> QUICK CALL
                    </button>
                    <button 
                        onClick={() => setActiveTab('recent')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'recent' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                    >
                        <Clock size={14} /> RECENT
                    </button>
                    <button 
                        onClick={() => setActiveTab('directory')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                    >
                        <Book size={14} /> DIRECTORY
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-24">
                {activeTab === 'quick-call' && (
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Call</p>
                        
                        {/* Security Guard Card */}
                        <div className="p-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden group">
                            <button 
                                onClick={() => initiateCall({ _id: 'guard', name: 'Security Guard', flatNo: 'Emergency' })}
                                className="w-full flex items-center justify-between p-4 bg-red-500 group-hover:bg-red-600 transition-colors rounded-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                        <Shield size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider">SECURITY GUARD</h3>
                                        <p className="text-[10px] font-bold text-red-100">Call Now</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 shadow-lg">
                                    <Phone size={18} />
                                </div>
                            </button>
                        </div>

                        {/* Maintenance Card */}
                        <div className="p-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden group">
                            <button 
                                onClick={() => initiateCall({ _id: 'admin', name: 'Maintenance Desk', flatNo: 'Office' })}
                                className="w-full flex items-center justify-between p-4 bg-blue-500 group-hover:bg-blue-600 transition-colors rounded-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white">
                                        <Wrench size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider">MAINTENANCE</h3>
                                        <p className="text-[10px] font-bold text-blue-100">Help Desk</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-lg">
                                    <Phone size={18} />
                                </div>
                            </button>
                        </div>

                        {/* Frequent Contacts */}
                        <div className="mt-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Frequent Contacts</p>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>
                                ) : filteredResidents.slice(0, 5).map(r => (
                                    <div key={r._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:scale-[1.01]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                                                <img 
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r._id}`} 
                                                    alt="avatar" 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">{r.flatNo || 'N/A'}</h3>
                                                <p className="text-xs font-bold text-slate-400 truncate w-32">{r.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => initiateCall(r)}
                                                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                                title="Call"
                                            >
                                                <Phone size={16} />
                                            </button>
                                            <button 
                                                className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                                title="Message"
                                            >
                                                <MessageSquare size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'directory' || activeTab === 'recent') && (
                    <div className="space-y-3">
                        {loading ? (
                           <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
                        ) : (
                            filteredResidents.map(r => (
                                <div key={r._id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                            <UserIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">{r.flatNo}</h3>
                                            <p className="text-xs font-bold text-slate-400">{r.name}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => initiateCall(r)}
                                        className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                                    >
                                        <Phone size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Sticky Mock Navigation (As seen in the image) */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 py-3 px-8 flex justify-between items-center z-10">
                <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Home size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">Home</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Users size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">Visitors</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Activity size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">Activity</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-400">
                    <CreditCard size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">Payments</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-indigo-600">
                    <Phone size={20} />
                    <span className="text-[9px] font-bold uppercase tracking-tight">Call</span>
                </div>
            </div>
        </div>
    );
};

export default IntercomCallTab;
