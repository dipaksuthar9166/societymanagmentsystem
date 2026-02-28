import React, { useState, useEffect } from 'react';
import { Video, Maximize2, RefreshCw, ShieldCheck, VideoOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../config';
import { useAuth } from '../../../context/AuthContext';

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
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-900/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Video size={20} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-sm">Society Live Cams</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Public Area Monitoring</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-full border border-slate-100 dark:border-slate-600 shadow-sm">
                    <ShieldCheck className="text-emerald-500" size={14} />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">Secure Feed</span>
                </div>
            </div>

            <div className="p-4 md:p-6 space-y-6">
                {/* Main Player */}
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group border-4 border-slate-100 dark:border-slate-700">
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center transition-all duration-700">
                        {loading ? (
                            <div className="flex flex-col items-center gap-3 text-slate-600">
                                <RefreshCw className="animate-spin" size={32} />
                                <span className="text-xs font-bold uppercase tracking-widest">Initializing Feed...</span>
                            </div>
                        ) : selected ? (
                            <div className="relative w-full h-full">
                                <video
                                    src={selected.streamUrl}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Live Feed</span>
                                </div>
                                <div className="absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
                                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">{selected.name}</span>
                                </div>
                                {/* Scanline Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-slate-600">
                                <VideoOff size={48} />
                                <span className="text-xs font-bold uppercase tracking-widest">No Public Feeds Available</span>
                            </div>
                        )}
                    </div>

                    {selected && (
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/80 to-transparent flex justify-between z-10">
                            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md border border-white/10 text-white transition-colors">
                                <Maximize2 size={18} />
                            </button>
                            <button onClick={fetchPublicCameras} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md border border-white/10 text-white transition-colors">
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Camera Selector */}
                {cameras.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Available Public CAMERAS</p>
                        <div className="flex flex-wrap gap-2">
                            {cameras.map(cam => (
                                <button
                                    key={cam._id}
                                    onClick={() => setSelected(cam)}
                                    className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border flex items-center gap-3 ${selected?._id === cam._id
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20'
                                            : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-lg ${selected?._id === cam._id ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-600'}`}>
                                        <Video size={14} />
                                    </div>
                                    {cam.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Privacy Restricted: Domestic areas not visible</p>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">System Stable</span>
                </div>
            </div>
        </div>
    );
};

export default ResidentCCTV;
