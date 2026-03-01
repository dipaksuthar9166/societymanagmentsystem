import React, { useState, useEffect } from 'react';
import {
    Video,
    VideoOff,
    Maximize2,
    Settings,
    RefreshCw,
    Play,
    Square,
    Camera as CameraIcon,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    Plus,
    Minus,
    Search,
    AlertCircle,
    Activity,
    Shield,
    Trash2,
    Save,
    X,
    Eye,
    EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../config';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/ToastProvider';
import { BACKEND_URL } from '../../../config';

const CameraPlayer = ({ cam }) => {
    const canvasRef = React.useRef(null);
    const videoRef = React.useRef(null);
    const playerRef = React.useRef(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const isRTSP = cam.streamUrl.startsWith('rtsp://');

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

    const isRTSP = cam.streamUrl.startsWith('rtsp://');

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

const CCTVTab = () => {
    const { user } = useAuth();
    const { showSuccess, showWarning, showError } = useToast();
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [layout, setLayout] = useState('grid');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        streamUrl: '',
        location: '',
        type: 'Static',
        resolution: '1080p',
        isPublic: false
    });

    const fetchCameras = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/cameras`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCameras(data);
                if (data.length > 0 && !selectedCamera) {
                    setSelectedCamera(data[0]);
                }
            }
        } catch (error) {
            showError('Failed to fetch cameras');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCameras();
    }, []);

    const handleAddCamera = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/cameras`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                showSuccess('Camera added successfully');
                setIsAddModalOpen(false);
                setFormData({ name: '', streamUrl: '', location: '', type: 'Static', resolution: '1080p', isPublic: false });
                fetchCameras();
            } else {
                const err = await res.json();
                showError(err.message || 'Failed to add camera');
            }
        } catch (error) {
            showError('Network error');
        }
    };

    const handleDeleteCamera = async (id) => {
        if (!window.confirm('Are you sure you want to remove this camera?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/cameras/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                showSuccess('Camera removed');
                if (selectedCamera?._id === id) setSelectedCamera(null);
                fetchCameras();
            }
        } catch (error) {
            showError('Failed to delete');
        }
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        if (!isRecording) showSuccess('Manual recording started');
        else showWarning('Recording saved to server');
    };

    const filteredCameras = cameras.filter(cam =>
        cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            {/* Header */}
            <div className="bg-slate-800 p-6 border-b border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <Video className="text-indigo-400" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">CCTV Command Center</h2>
                    </div>
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                        <span className={`w-2 h-2 ${cameras.filter(c => c.status === 'Online').length > 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`}></span>
                        {cameras.filter(c => c.status === 'Online').length}/{cameras.length} Cameras Online
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={fetchCameras}
                        className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors border border-slate-600 shadow-sm"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={() => setLayout(layout === 'grid' ? 'focus' : 'grid')}
                        className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors border border-slate-600 shadow-sm"
                    >
                        <Maximize2 size={18} />
                    </button>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Add Real Camera</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Main View Area */}
                <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-black">
                    {filteredCameras.length > 0 ? (
                        <div className={`grid gap-4 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                            {filteredCameras.map((cam) => (
                                <motion.div
                                    key={cam._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${selectedCamera?._id === cam._id
                                        ? 'border-indigo-500 ring-4 ring-indigo-500/20'
                                        : 'border-slate-800 hover:border-slate-600'
                                        } bg-slate-900 aspect-video`}
                                    onClick={() => setSelectedCamera(cam)}
                                >
                                    {/* Video Stream */}
                                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                        {cam.status === 'Offline' ? (
                                            <div className="flex flex-col items-center gap-3 text-slate-600">
                                                <VideoOff size={48} />
                                                <span className="font-bold uppercase tracking-wider text-xs">Signal Lost</span>
                                            </div>
                                        ) : (
                                            <div className="relative w-full h-full">
                                                {/* Actual Video Tag or Canvas */}
                                                <CameraPlayer cam={cam} />
                                                {/* Scanline & Overlay Effect */}
                                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30"></div>

                                                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-10">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Live</span>
                                                </div>
                                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 z-10">
                                                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">{cam.name}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Overlay Icons on Hover */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/80 to-transparent z-20">
                                        <div className="flex justify-between items-center text-white">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCamera(cam._id); }}
                                                    className="p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg backdrop-blur-md border border-red-500/30 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md border border-white/10 transition-colors">
                                                    <Maximize2 size={16} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {cam.isPublic ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} className="text-slate-400" />}
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500 rounded uppercase">{cam.resolution}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4">
                            <VideoOff size={64} />
                            <div className="text-center">
                                <p className="text-xl font-bold text-slate-400">No Cameras Registered</p>
                                <p className="text-sm">Add a real IP Camera stream (HLS/MP4) to start monitoring.</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
                            >
                                <Plus size={20} /> Add First Camera
                            </button>
                        </div>
                    )}
                </div>

                {/* Controls Sidebar */}
                <div className="w-full lg:w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Shield className="text-indigo-400" size={20} />
                            Active Stream Node
                        </h3>

                        {selectedCamera ? (
                            <div className="space-y-6">
                                {/* Camera Details */}
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Selected Node</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${selectedCamera.isPublic ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                                            {selectedCamera.isPublic ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-bold text-white truncate">{selectedCamera.name}</h4>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Location</span>
                                            <span className="text-sm font-bold text-white truncate">{selectedCamera.location}</span>
                                        </div>
                                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Status</span>
                                            <span className={`text-sm font-bold ${selectedCamera.status === 'Online' ? 'text-green-500' : 'text-red-500'}`}>{selectedCamera.status}</span>
                                        </div>
                                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Protocol</span>
                                            <span className="text-sm font-bold text-white uppercase">{selectedCamera.streamUrl.split('.').pop() || 'WEB'}</span>
                                        </div>
                                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Firmware</span>
                                            <span className="text-sm font-bold text-white">v2.4.1</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Movement Controls */}
                                {selectedCamera.type === 'PTZ' && (
                                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700 flex flex-col items-center">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Real-Time PTZ Control</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div />
                                            <button className="w-12 h-12 bg-slate-700 hover:bg-indigo-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 group">
                                                <ChevronUp size={24} className="group-hover:translate-y-[-2px] transition-transform" />
                                            </button>
                                            <div />
                                            <button className="w-12 h-12 bg-slate-700 hover:bg-indigo-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 group">
                                                <ChevronLeft size={24} className="group-hover:translate-x-[-2px] transition-transform" />
                                            </button>
                                            <button className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-indigo-500/20 shadow-xl">
                                                <Activity size={20} />
                                            </button>
                                            <button className="w-12 h-12 bg-slate-700 hover:bg-indigo-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 group">
                                                <ChevronRight size={24} className="group-hover:translate-x-[2px] transition-transform" />
                                            </button>
                                            <div />
                                            <button className="w-12 h-12 bg-slate-700 hover:bg-indigo-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 group">
                                                <ChevronDown size={24} className="group-hover:translate-y-[2px] transition-transform" />
                                            </button>
                                            <div />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={toggleRecording}
                                        className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-3 transition-all ${isRecording
                                            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20'
                                            : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 shadow-sm'
                                            }`}
                                    >
                                        {isRecording ? <Square size={16} /> : <Play size={16} />}
                                        {isRecording ? 'RECORDING LIVE...' : 'START MANUAL RECORD'}
                                    </button>
                                    <button className="w-full bg-slate-700 hover:bg-indigo-600 border border-slate-600 hover:border-indigo-500 text-slate-300 hover:text-white py-4 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-3 transition-all group shadow-sm">
                                        <AlertCircle size={16} className="group-hover:rotate-12 transition-transform" />
                                        REPORT STREAM ANOMALY
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-700 border border-slate-800">
                                    <Video size={40} />
                                </div>
                                <h4 className="text-white font-bold">No Feed Selected</h4>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Camera Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl"
                        >
                            <div className="bg-slate-700 p-6 flex justify-between items-center border-b border-slate-600">
                                <div className="flex items-center gap-3">
                                    <CameraIcon className="text-indigo-400" size={24} />
                                    <h3 className="text-xl font-bold text-white">Add IP Camera Stream</h3>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddCamera} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Camera Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Main Gate Entrance"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Stream URL (HLS/MP4/WebLink)</label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="http://server.com/camera1.m3u8"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.streamUrl}
                                        onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1 italic">* Browser based login only supports HLS or Web accessible streams.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Location</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Block A, Parking, etc."
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Type</label>
                                        <select
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="Static">Static View</option>
                                            <option value="PTZ">PTZ Controller</option>
                                            <option value="360°">360° Panoramic</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${formData.isPublic ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                            {formData.isPublic ? <Eye size={20} /> : <EyeOff size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Public Access</p>
                                            <p className="text-[10px] text-slate-500">Enable this to let residents see this feed.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${formData.isPublic ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isPublic ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                                >
                                    <Save size={20} /> INITIALIZE CAMERA
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CCTVTab;
