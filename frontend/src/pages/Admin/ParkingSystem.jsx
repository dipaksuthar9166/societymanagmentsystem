import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { BatteryCharging, Car, Clock, Calendar, Search, Map, Wrench } from 'lucide-react';
import { useToast } from '../../components/ToastProvider';

const ParkingSystem = ({ token }) => {
    const [slots, setSlots] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/features/parking/slots`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setSlots(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRelease = async (slotId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/features/parking/slots/${slotId}/toggle`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                showSuccess('Slot Updated', 'Slot status changed successfully.');
                fetchSlots(); // Refresh grid
            } else {
                showError('Error', 'Failed to update slot status');
            }
        } catch (error) {
            console.error(error);
            showError('Server Error', 'Could not reach server');
        }
    };

    const handleManageRates = () => {
        showSuccess('Coming Soon', 'Rate management will be available in the next update.');
    };

    const filteredSlots = slots.filter(s => s.slotNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Smart Parking Management</h2>
                    <p className="text-slate-500 font-medium">Monitor occupancy & manage EV slots.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        placeholder="Search Slot (e.g. V-10)"
                        className="pl-10 p-2.5 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Panel */}
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Map size={18} /> Overview</h3>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                        <div>
                            <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Available</p>
                            <p className="text-2xl font-black text-green-800">{slots.filter(s => !s.isOccupied).length}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-sm"><Car className="text-green-500" size={24} /></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Occupied</p>
                            <p className="text-2xl font-black text-slate-800">{slots.filter(s => s.isOccupied).length}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl shadow-sm"><Lock className="text-slate-400" size={24} /></div>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-indigo-500 uppercase">EV Usage</span>
                            <span className="text-xs font-black text-indigo-700">{slots.filter(s => s.type === 'EV' && s.isOccupied).length}/{slots.filter(s => s.type === 'EV').length}</span>
                        </div>
                        <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(slots.filter(s => s.type === 'EV' && s.isOccupied).length / slots.filter(s => s.type === 'EV').length) * 100}%` }}></div>
                        </div>
                    </div>

                    <button
                        onClick={handleManageRates}
                        className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 flex items-center justify-center gap-2"
                    >
                        <Wrench size={18} /> Manage Rates
                    </button>
                </div>

                {/* Grid View */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
                    <div className="relative z-10 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                        {loading ? <div className="col-span-full text-center py-10 text-slate-400">Loading Grid...</div> : filteredSlots.map(slot => (
                            <div
                                key={slot._id}
                                className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative group cursor-pointer transition-all ${slot.isOccupied
                                    ? 'bg-red-50 border-red-200 text-red-400 hover:bg-red-100'
                                    : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500'
                                    }`}
                                title={slot.isOccupied ? "Occupied" : "Free"}
                            >
                                <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${slot.isOccupied ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                {slot.type === 'EV' ? <BatteryCharging size={20} /> : <Car size={20} />}
                                <span className="text-xs font-black mt-1">{slot.slotNumber}</span>

                                {/* Popover for Actions */}
                                {slot.isOccupied && (
                                    <div className="absolute inset-0 bg-red-500/90 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                        <p className="text-[8px] text-white font-bold uppercase tracking-wider mb-1">Booked By</p>
                                        <p className="text-[10px] text-white font-bold truncate w-full text-center">User 1</p>
                                        <button onClick={(e) => { e.stopPropagation(); handleRelease(slot._id); }} className="mt-1 px-2 py-0.5 bg-white text-red-600 rounded text-[8px] font-bold uppercase hover:bg-red-50">Force Clear</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Start Icon for Lock (Missing import fix)
const Lock = ({ className, size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);

export default ParkingSystem;
