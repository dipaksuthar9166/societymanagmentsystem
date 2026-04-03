import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneCall, PhoneOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../config';
import { io } from 'socket.io-client';

const JitsiCallHandler = () => {
    const { user } = useAuth();
    const [incomingCall, setIncomingCall] = useState(null);
    const [inCall, setInCall] = useState(false);
    const [roomName, setRoomName] = useState('');
    const socketRef = useRef(null);
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        socketRef.current = io(BACKEND_URL, { transports: ['websocket'] });
        socketRef.current.emit('join_room', user.id || user._id);

        socketRef.current.on('incoming-call', (data) => {
            // Check if not already in a call
            if (!inCall) {
                setIncomingCall(data);
                // Can play ringtone here using Audio API
            }
        });

        socketRef.current.on('call-rejected', () => {
            if (inCall) endCall();
        });

        return () => {
            if (jitsiApiRef.current) {
               jitsiApiRef.current.dispose();
               jitsiApiRef.current = null;
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user, inCall]);

    const acceptCall = () => {
        if (incomingCall) {
            setRoomName(incomingCall.roomName);
            setInCall(true);
            socketRef.current.emit('call-accepted', { from: user.name, to: incomingCall.fromId, roomName: incomingCall.roomName });
            setIncomingCall(null);
        }
    };

    const rejectCall = () => {
        if (incomingCall) {
            socketRef.current.emit('call-rejected', { from: user.name, to: incomingCall.fromId });
            setIncomingCall(null);
        }
    };

    useEffect(() => {
        // Initialize Jitsi when roomName is set
        if (inCall && roomName && window.JitsiMeetExternalAPI) {
            const domain = 'meet.jit.si';
            const options = {
                roomName: roomName,
                width: '100%',
                height: 500,
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: user?.name || "Resident",
                    email: user?.email
                },
                configOverwrite: { 
                    startWithAudioMuted: false,
                    startWithVideoMuted: true 
                },
            };
            jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
            jitsiApiRef.current.addListener('videoConferenceLeft', endCall);
        } else if (inCall && !window.JitsiMeetExternalAPI) {
            console.error("Jitsi API not loaded!");
            endCall();
        }
    }, [inCall, roomName]);

    const endCall = () => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
        }
        setInCall(false);
        setRoomName('');
    };

    return (
        <>
            {/* Incoming Call Popup */}
            {incomingCall && !inCall && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-slate-200 dark:border-slate-700">
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center animate-pulse mb-4">
                            <PhoneCall size={36} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Incoming Call</h2>
                        <p className="text-slate-500 font-medium mb-8">From: {incomingCall.from}</p>
                        
                        <div className="flex gap-4 w-full">
                            <button onClick={rejectCall} className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 hover:bg-red-200 font-bold py-3 rounded-xl transition-colors">
                                <PhoneOff size={20} /> Reject
                            </button>
                            <button onClick={acceptCall} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600 font-bold py-3 rounded-xl transition-colors shadow-lg shadow-green-200 active:scale-95">
                                <Phone size={20} /> Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* In-Call Interface */}
            {inCall && (
                <div className="fixed sm:bottom-6 sm:right-6 bottom-0 right-0 sm:w-[400px] w-full z-[9999] bg-white dark:bg-slate-800 sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-5">
                    <div className="bg-indigo-600 p-3 flex justify-between items-center text-white">
                        <span className="font-bold flex items-center gap-2"><Phone size={16} /> Intercom Call in Progress</span>
                        <button onClick={endCall} className="text-white/80 hover:text-white bg-white/10 hover:bg-red-500 p-1.5 rounded-lg transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div ref={jitsiContainerRef} className="w-full h-[400px] bg-slate-900"></div>
                </div>
            )}
        </>
    );
};

export default JitsiCallHandler;
