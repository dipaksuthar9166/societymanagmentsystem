import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, Search, User as UserIcon, X, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../../config';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../../../config';
import { useToast } from '../../../components/ToastProvider';

const IntercomCallTab = ({ user }) => {
    const { showError, showSuccess } = useToast();
    const [residents, setResidents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    
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
        
        // Listeners for outgoing call states
        socketRef.current.on('call-accepted', (data) => {
            console.log("Call accepted!", data);
            showSuccess('Call Connected', 'Resident has accepted the call.');
            setCallingStatus('in-call');
            startJitsiCall(data.roomName);
        });

        socketRef.current.on('call-rejected', () => {
            showError('Call Rejected', 'The resident declined the call.');
            endCall();
        });

        // CHECK FOR PENDING INCOMING CALL FROM MODAL
        if (window.pendingIncomingCall) {
            const call = window.pendingIncomingCall;
            window.pendingIncomingCall = null;
            
            console.log("Auto-accepting pending call:", call);
            setCallingStatus('in-call');
            setRoomName(call.roomName);
            setCurrentCall({ name: call.from, _id: call.fromId });

            // Notify caller that we accepted IMMEDIATELY
            socketRef.current.emit('call-accepted', {
                to: call.fromId,
                roomName: call.roomName
            });

            // Start meeting with minimal delay
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
                // Filter out self and format
                setResidents(data.filter(r => r._id !== user._id && r._id !== user.id).map(r => ({
                    ...r,
                    sortFlat: parseInt((r.flatNo || '').replace(/\D/g, '') || 0)
                })).sort((a,b) => a.sortFlat - b.sortFlat));
            }
        } catch (error) {
            console.error("Failed to fetch residents", error);
        } finally {
            setLoading(false);
        }
    };

    const initiateCall = (resident) => {
        const uniqueRoom = `Society_Call_${resident._id}_${Date.now()}`;
        setCurrentCall(resident);
        setRoomName(uniqueRoom);
        setCallingStatus('calling');
        
        console.log(`Calling ${resident.name} at ${resident.flatNo}`);

        // Emit call signal
        socketRef.current.emit('initiate-call', {
            from: user.name || 'Main Gate',
            fromId: user._id || user.id,
            to: resident._id,
            toName: resident.name,
            roomName: uniqueRoom,
            type: 'video'
        });
    };

    const startJitsiCall = (room) => {
        if (!window.JitsiMeetExternalAPI) {
            showError("API Missing", "Unable to load Jitsi API for video calling.");
            endCall();
            return;
        }

        const domain = 'meet.jit.si';
        const options = {
            roomName: room,
            width: '100%',
            height: 600,
            parentNode: jitsiContainerRef.current,
            userInfo: {
                displayName: user.name || 'Gate Security',
            },
            configOverwrite: { 
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                disableDeepLinking: true // This prevents the "Download App" popup on mobile
            },
        };
        
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current.addListener('videoConferenceLeft', endCall);
    };

    const endCall = () => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
        }
        setCallingStatus(null);
        setCurrentCall(null);
        setRoomName('');
    };

    const filteredResidents = residents.filter(r => 
        (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (r.flatNo || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Intercom Directory</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Call residents directly without phone numbers.</p>
                </div>
                
                {!callingStatus && (
                    <div className="relative w-full md:w-72">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Flat or Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                )}
            </div>

            {callingStatus ? (
                 <div className="bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                     {/* Calling Header */}
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                        <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                {callingStatus === 'calling' ? <Phone className="animate-bounce" /> : <Video />} 
                                {callingStatus === 'calling' ? `Calling ${currentCall?.flatNo}...` : `Live Intercom with ${currentCall?.flatNo}`}
                            </h3>
                            <p className="text-indigo-200 text-sm">{currentCall?.name}</p>
                        </div>
                        <button onClick={endCall} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors">
                            <X size={18} /> End Call
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="relative w-full h-[600px] bg-slate-900 flex items-center justify-center">
                        {callingStatus === 'calling' ? (
                            <div className="text-center text-white flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 animate-pulse">
                                    <Phone size={40} className="text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Ringing {currentCall?.flatNo}</h3>
                                <p className="text-slate-400">Waiting for {currentCall?.name} to accept the call...</p>
                                <div className="mt-8 flex gap-2">
                                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        ) : (
                            <div ref={jitsiContainerRef} className="w-full h-full bg-black">
                                {/* Jitsi Video UI Will Render Here */}
                            </div>
                        )}
                    </div>
                 </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="py-4 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Flat No</th>
                                    <th className="py-4 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Resident</th>
                                    <th className="py-4 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                                    <th className="py-4 px-6 font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-slate-500">
                                            <Loader2 size={32} className="animate-spin mx-auto text-indigo-500 mb-2" />
                                            Loading Directory...
                                        </td>
                                    </tr>
                                ) : filteredResidents.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-slate-500">No residents found.</td>
                                    </tr>
                                ) : (
                                    filteredResidents.map(resident => (
                                        <tr key={resident._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-3 px-6">
                                                <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-black text-sm px-3 py-1 rounded-lg">
                                                    {resident.flatNo || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="font-bold text-slate-800 dark:text-white">{resident.name}</div>
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${resident.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${resident.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    {resident.status === 'active' ? 'Registered' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <button 
                                                    onClick={() => initiateCall(resident)}
                                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-sm shadow-indigo-200 dark:shadow-none active:scale-95"
                                                >
                                                    <Phone size={14} /> Call
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntercomCallTab;
