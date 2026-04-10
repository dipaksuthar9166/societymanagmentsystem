import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { BatteryCharging, Car, Clock, Calendar, CheckCircle, ChevronRight, RefreshCw } from 'lucide-react';

const EVParking = () => {
    const { user } = useAuth();
    const [slots, setSlots] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingDetails, setBookingDetails] = useState({ vehicleNumber: '', duration: 2 }); // Duration in hours

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const sRes = await fetch(`${API_BASE_URL}/features/parking/slots`, { headers: { Authorization: `Bearer ${user.token}` } });
            const bRes = await fetch(`${API_BASE_URL}/features/parking/my-bookings`, { headers: { Authorization: `Bearer ${user.token}` } });

            if (sRes.ok) setSlots(await sRes.json());
            if (bRes.ok) setBookings(await bRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (e) => {
        e.preventDefault();
        if (!selectedSlot) return;

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + bookingDetails.duration * 60 * 60 * 1000);

        try {
            const res = await fetch(`${API_BASE_URL}/features/parking/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({
                    slotId: selectedSlot._id,
                    vehicleNumber: bookingDetails.vehicleNumber,
                    startTime,
                    endTime
                })
            });

            if (res.ok) {
                alert('Slot booked successfully!');
                setSelectedSlot(null);
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight italic">Smart Parking</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Live Inventory & Reservation</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2 shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Live Sentinel</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Floor Layout */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <BatteryCharging size={120} />
                        </div>
                        
                        <div className="flex items-center justify-between mb-8 relative z-10">
                             <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] italic">Facility Map</h3>
                             <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">A-Block Underground</span>
                             </div>
                        </div>

                        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 relative z-10">
                            {loading ? (
                                <div className="col-span-full py-20 text-center">
                                    <div className="animate-spin text-blue-600 mb-4 inline-block"><RefreshCw size={40} /></div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Mapping Hardware...</p>
                                </div>
                            ) : slots.map(slot => (
                                <button
                                    key={slot._id}
                                    disabled={slot.isOccupied}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`aspect-[3/4] rounded-[22px] border-4 flex flex-col items-center justify-center gap-2 transition-all relative group ${slot.isOccupied
                                            ? 'bg-slate-50 border-slate-50 text-slate-200'
                                            : selectedSlot?._id === slot._id
                                                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-105 z-10'
                                                : 'bg-white border-slate-50 hover:border-blue-400 text-slate-800 shadow-sm active:scale-95'
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl ${selectedSlot?._id === slot._id ? 'bg-white/10' : slot.isOccupied ? 'bg-slate-100' : 'bg-blue-50'}`}>
                                        {slot.type === 'EV' ? <BatteryCharging size={20} className={selectedSlot?._id === slot._id ? 'text-white' : 'text-blue-600'} /> : <Car size={20} className={selectedSlot?._id === slot._id ? 'text-white' : 'text-slate-400'} />}
                                    </div>
                                    <span className="font-black text-xs tracking-tighter">{slot.slotNumber}</span>
                                    {slot.isOccupied && <div className="absolute bottom-2 w-1 h-1 bg-red-400 rounded-full"></div>}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-8 mt-10 justify-center border-t border-slate-50 pt-8">
                            {[
                                { label: 'Available', color: 'bg-blue-50' },
                                { label: 'Occupied', color: 'bg-slate-50' },
                                { label: 'Selected', color: 'bg-slate-900' }
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Reservation & History */}
                <div className="flex flex-col gap-6">
                    {/* Reservation Panel */}
                    {selectedSlot ? (
                        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-200 animate-in slide-in-from-right duration-500">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[25px] flex items-center justify-center border border-white/20">
                                    <BatteryCharging size={32} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] italic mb-1">Reservation Info</p>
                                    <h3 className="text-2xl font-black tracking-tighter italic truncate">Port {selectedSlot.slotNumber}</h3>
                                </div>
                            </div>

                            <form onSubmit={handleBook} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] pl-2">Vehicle Signature</label>
                                    <input
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-black text-white outline-none focus:border-blue-500 transition-all placeholder:text-white/20 uppercase"
                                        placeholder="AA 01 BB 1234"
                                        value={bookingDetails.vehicleNumber}
                                        onChange={e => setBookingDetails({ ...bookingDetails, vehicleNumber: e.target.value })}
                                    />
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-2">
                                        <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Sustenance Period</label>
                                        <span className="text-xs font-black text-blue-400 uppercase">{bookingDetails.duration} HRS</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="24" step="1"
                                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                        value={bookingDetails.duration}
                                        onChange={e => setBookingDetails({ ...bookingDetails, duration: Number(e.target.value) })}
                                    />
                                </div>

                                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-1 italic">Service Charge</p>
                                        <p className="text-3xl font-black italic">₹{(bookingDetails.duration * (selectedSlot.hourlyRate || 50)).toLocaleString()}</p>
                                    </div>
                                    <button type="submit" className="w-14 h-14 bg-blue-600 rounded-2xl shadow-xl shadow-blue-900/40 flex items-center justify-center hover:bg-blue-500 transition-all active:scale-95">
                                        <ChevronRight size={28} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white p-10 rounded-[40px] border-4 border-dashed border-slate-50 text-center flex flex-col items-center justify-center gap-6 group hover:border-slate-100 transition-all">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                                <Car size={40} />
                            </div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] max-w-[150px] italic">Awaiting Asset Selection</p>
                        </div>
                    )}

                    {/* Active Sessions */}
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between mb-8 px-2">
                             <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] italic">Active Grid</h3>
                             <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">Synchronized</div>
                        </div>
                        
                        <div className="space-y-4">
                            {bookings.filter(b => b.status === 'Active').length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-[35px] border border-dashed border-slate-100">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] italic">No active streams</p>
                                </div>
                            ) : bookings.filter(b => b.status === 'Active').map(booking => (
                                <div key={booking._id} className="p-5 bg-white border border-slate-50 rounded-[25px] flex items-center justify-between shadow-sm group hover:border-indigo-100 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg font-black text-xs">
                                            {booking.slot?.slotNumber}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 tracking-tighter leading-none mb-1 text-sm uppercase italic">{booking.vehicleNumber}</p>
                                            <p className="text-[9px] font-black text-slate-400 tracking-widest italic">{new Date(booking.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} EXPIRE</p>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EVParking;
