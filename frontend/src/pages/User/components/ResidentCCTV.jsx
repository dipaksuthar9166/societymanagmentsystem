import React, { useState, useEffect } from 'react';
import { Video, Maximize2, RefreshCw, ShieldCheck, VideoOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../config';
import { useAuth } from '../../../context/AuthContext';
import { BACKEND_URL } from '../../../config';

const CameraPlayer = ({ cam }) => {
    const canvasRef = React.useRef(null);
    const videoRef = React.useRef(null);
    const playerRef = React.useRef(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const isRTSP = cam.streamUrl?.startsWith('rtsp://');

        if (isRTSP && window.JSMpeg) {
            // Deduce WS URL based on BACKEND_URL
            const wsUrl = BACKEND_URL.replace(/^http/, 'ws') + `/api/stream/${cam._id}`;

            playerRef.current = new window.JSMpeg.Player(wsUrl, {
                canvas: canvasRef.current,
                autoplay: true,
                audio: false,
                onVideoDecode: () => setHasError(false), // successful frame render
            });

            return () => {
                if (playerRef.current) playerRef.current.destroy();
            };
        }
    }, [cam._id, cam.streamUrl]);

    if (hasError) {
        return (
            <div className="flex flex-col items-center justify-center text-slate-500 w-full h-full">
                <VideoOff size={48} className="mb-2" />
                <span className="text-xs uppercase tracking-wider font-bold">Stream Failed</span>
            </div>
        );
    }

    const isRTSP = cam.streamUrl?.startsWith('rtsp://');

    return (
        <div className="w-full h-full">
            {isRTSP ? (
                <canvas
                    ref={canvasRef}
                    className="w-full h-full object-cover"
                />
            ) : (
                <video
                    ref={videoRef}
                    src={cam.streamUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    onError={() => setHasError(true)}
                />
            )}
        </div>
    );
};

const ResidentCCTV = () => {
    const { user } = useAuth();
    const [cameras, setCameras] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPublicCameras = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/cameras/public`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCameras(data);
                if (data.length > 0) setSelected(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch public cameras');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicCameras();
    }, []);

    return (
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom duration-700">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-slate-50/50 to-white">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-slate-200">
                        <Video size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 uppercase tracking-tighter text-lg leading-none mb-1">Live Sentinel</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Live Surveillance Network</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50 shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Main Player */}
                <div className="relative aspect-video bg-black rounded-[35px] overflow-hidden shadow-2xl group border-[6px] border-slate-50">
                    <div className="absolute inset-0 bg-slate-950 flex items-center justify-center transition-all duration-700">
                        {loading ? (
                            <div className="flex flex-col items-center gap-4 text-slate-700">
                                <RefreshCw className="animate-spin text-blue-500" size={40} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Synchronizing...</span>
                            </div>
                        ) : selected ? (
                            <div className="relative w-full h-full group">
                                <CameraPlayer cam={selected} />
                                
                                {/* High-tech HUD Overlay */}
                                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 w-fit">
                                                <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">REC // LIVE</span>
                                            </div>
                                            <span className="text-[8px] font-mono text-white/50 pl-1">{new Date().toISOString()}</span>
                                        </div>
                                        <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{selected.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-mono text-emerald-500/80">SIGNAL: EXCELLENT (98%)</span>
                                            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">ID: {selected._id?.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                                            <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                                            <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* Scanline & Flicker Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px] pointer-events-none opacity-10 animate-pulse"></div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-slate-800">
                                <VideoOff size={60} className="mb-2 text-slate-800" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Network Feeds</span>
                            </div>
                        )}
                    </div>

                    {selected && (
                        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-all duration-300 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex justify-between z-20">
                            <button className="p-3 bg-white/20 hover:bg-white/40 rounded-[15px] backdrop-blur-xl border border-white/20 text-white transition-all active:scale-95 shadow-lg">
                                <Maximize2 size={24} />
                            </button>
                            <button onClick={fetchPublicCameras} className="p-3 bg-white/20 hover:bg-white/40 rounded-[15px] backdrop-blur-xl border border-white/20 text-white transition-all active:scale-95 shadow-lg">
                                <RefreshCw size={24} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Camera Selector */}
                {cameras.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-2 italic">Select Monitoring Channel</p>
                        <div className="flex flex-wrap gap-3">
                            {cameras.map(cam => (
                                <button
                                    key={cam._id}
                                    onClick={() => setSelected(cam)}
                                    className={`px-6 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 flex items-center gap-4 ${selected?._id === cam._id
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105'
                                        : 'bg-white text-slate-500 border-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl ${selected?._id === cam._id ? 'bg-white/20' : 'bg-slate-50'}`}>
                                        <Video size={16} />
                                    </div>
                                    {cam.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                <span>Restricted Monitoring Area</span>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span>Signal Static</span>
                </div>
            </div>
        </div>
    );
};

export default ResidentCCTV;
