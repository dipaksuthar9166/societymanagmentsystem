import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';
import { BatteryCharging, Car, ShieldCheck, RefreshCw } from 'lucide-react';
import { useToast } from '../../../components/ToastProvider';

const GuardParking = ({ user }) => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError } = useToast();

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/features/parking/slots`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSlots(data);
            }
        } catch (error) {
            showError('Failed to fetch parking status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [user]);

    const handleToggle = async (slotId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/features/parking/slots/${slotId}/toggle`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const updatedSlot = await res.json();
                setSlots(prev => prev.map(s => s._id === slotId ? updatedSlot : s));
                showSuccess(`Slot ${updatedSlot.slotNumber} updated to ${updatedSlot.isOccupied ? 'Occupied' : 'Available'}`);
            }
        } catch (error) {
            showError('Failed to update slot status');
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Parking Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold flex items-center gap-2">
                        <ShieldCheck size={16} className="text-indigo-500" />
                        Gate Security Access Control
                    </p>
                </div>
                <button
                    onClick={fetchSlots}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                {loading && slots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">Syncing with Society Database...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Click slot to toggle status</p>
                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">
                                {slots.filter(s => !s.isOccupied).length} Slots Free
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 relative z-10">
                            {slots.map(slot => (
                                <button
                                    key={slot._id}
                                    onClick={() => handleToggle(slot._id)}
                                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative border-2 transition-all duration-300 group hover:scale-[1.05] active:scale-95 ${slot.isOccupied
                                        ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-500 dark:text-red-400'
                                        : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20'
                                        }`}
                                >
                                    {slot.type === 'EV' ? <BatteryCharging size={24} className="mb-1" /> : <Car size={24} className="mb-1" />}
                                    <span className="text-[10px] font-black uppercase tracking-wider">{slot.slotNumber}</span>

                                    <div className="absolute top-2 right-2 flex gap-1">
                                        {slot.isOccupied && (
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                                        )}
                                        {slot.type === 'EV' && (
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                        )}
                                    </div>

                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                        {slot.isOccupied ? 'Occupied - Click to Release' : 'Available - Click to Fill'}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 sm:flex flex-wrap gap-4 mt-10 justify-center border-t border-slate-100 dark:border-slate-700 pt-6">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                <div className="w-4 h-4 rounded-lg bg-emerald-500"></div> Available
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                <div className="w-4 h-4 rounded-lg bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div> Occupied
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                <div className="w-4 h-4 rounded-lg bg-indigo-500"></div> EV Station
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="bg-indigo-600 rounded-3xl p-6 text-white flex items-center justify-between shadow-xl shadow-indigo-200 dark:shadow-none">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Car size={32} />
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-wider text-sm">Quick Guard Tip</h4>
                        <p className="text-white/80 text-xs">Tap on any slot above when a vehicle enters or leaves the society.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuardParking;
