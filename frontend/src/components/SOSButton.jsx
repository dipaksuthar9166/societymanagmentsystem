import React, { useState } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Flame, Stethoscope, ShieldAlert } from 'lucide-react';

import { API_BASE_URL } from '../config';

// Derive Socket URL from API URL (remove /api)
const socketUrl = API_BASE_URL.replace('/api', '');
const socket = io(socketUrl);

const SOSButton = () => {
    const { user } = useAuth();
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [selectedType, setSelectedType] = useState(null);

    const emergencyTypes = [
        { id: 'Medical', label: 'Medical Emergency', icon: Stethoscope, color: 'bg-blue-500' },
        { id: 'Fire', label: 'Fire Warning', icon: Flame, color: 'bg-orange-500' },
        { id: 'Theft', label: 'Theft / Intruder', icon: ShieldAlert, color: 'bg-stone-800' },
        { id: 'Other', label: 'General Panic', icon: AlertTriangle, color: 'bg-red-600' }
    ];

    const handleInitialClick = () => {
        setShowTypeSelector(true);
    };

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setShowTypeSelector(false);
        startCountdown(type);
    };

    const startCountdown = (type) => {
        setIsActive(true);
        let count = 5;
        setCountdown(5);

        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(timer);
                triggerEmergency(type);
            }
        }, 1000);

        window.sosTimer = timer;
    };

    const cancelSOS = () => {
        clearInterval(window.sosTimer);
        setIsActive(false);
        setCountdown(5);
        setSelectedType(null);
    };

    const fetchIPLocation = async () => {
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            if (data.latitude && data.longitude) {
                return { lat: data.latitude, lng: data.longitude };
            }
        } catch (error) {
            console.error("IP Loc Error", error);
        }
        return { lat: 0, lng: 0 };
    };

    const triggerEmergency = (type) => {
        // Fallback for missing flatNo
        const flatInfo = user?.flatNo ? user.flatNo : 'N/A';
        const userName = user && user.name ? `${user.name} (${flatInfo})` : 'Unknown Resident';

        const payload = {
            user: userName,
            userId: user?._id,
            societyId: user?.company || user?.societyId,
            type: type.id,
            time: new Date(),
            location: { lat: 0, lng: 0 }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                socket.emit('send_sos', {
                    ...payload,
                    location: { lat: latitude, lng: longitude }
                });
                alert(`🚨 SOS SENT: ${type.label} Alert has been broadcasted!`);
                setIsActive(false);
            }, async (error) => {
                console.error("Loc Error", error);
                // Fallback to IP Location
                const ipLoc = await fetchIPLocation();
                socket.emit('send_sos', {
                    ...payload,
                    location: ipLoc
                });

                const locMsg = ipLoc.lat !== 0 ? "Approximate Location Sent" : "Location Unavailable";
                alert(`SOS SENT (${locMsg})!`);
                setIsActive(false);
            });
        } else {
            // Fallback to IP Location immediately if geo not supported
            fetchIPLocation().then(ipLoc => {
                socket.emit('send_sos', { ...payload, location: ipLoc });
                const locMsg = ipLoc.lat !== 0 ? "Approximate Location Sent" : "Location Unavailable";
                alert(`SOS SENT (GPS Not Supported - ${locMsg})!`);
                setIsActive(false);
            });
        }
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInitialClick}
                className="fixed bottom-6 right-6 z-50 bg-red-600 text-white font-bold p-4 rounded-full shadow-2xl flex items-center gap-2 border-4 border-red-200 animate-pulse hover:animate-none"
            >
                <span className="text-xl">🆘</span> SOS
            </motion.button>

            {/* Step 1: Type Selector */}
            <AnimatePresence>
                {showTypeSelector && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">What is the Emergency?</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {emergencyTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => handleTypeSelect(type)}
                                        className={`${type.color} text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:opacity-90 transition transform hover:scale-105 shadow-md`}
                                    >
                                        <type.icon size={32} />
                                        <span className="font-bold">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowTypeSelector(false)}
                                className="mt-6 w-full py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step 2: Countdown Overlay */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-red-600/90 z-[70] flex items-center justify-center flex-col backdrop-blur-sm"
                    >
                        <div className="w-64 h-64 rounded-full border-8 border-white flex items-center justify-center relative bg-white shadow-2xl">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="text-8xl font-black text-red-600"
                            >
                                {countdown}
                            </motion.div>
                        </div>

                        <div className="text-center mt-8 text-white">
                            <h2 className="text-4xl font-bold mb-2">SENDING ALERT</h2>
                            <p className="text-xl opacity-90">{selectedType?.label}</p>
                            <p className="mt-2 text-sm opacity-75">Broadcasting location to Security & Admin...</p>
                        </div>

                        <button
                            onClick={cancelSOS}
                            className="mt-12 px-12 py-4 bg-white text-red-600 rounded-full text-xl font-black tracking-wider hover:bg-gray-100 shadow-xl"
                        >
                            CANCEL ALERT
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SOSButton;
