import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { BatteryCharging, Car, Clock, Calendar, CheckCircle } from 'lucide-react';

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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Smart Parking</h2>
                    <p className="text-slate-500 font-medium">Reserve EV charging slots & visitor parking.</p>
                </div>
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live Updates
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Map/Slots View */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Parking Layout</h3>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {loading ? <div className="col-span-full text-center text-slate-400">Loading map...</div> : slots.map(slot => (
                            <button
                                key={slot._id}
                                disabled={slot.isOccupied}
                                onClick={() => setSelectedSlot(slot)}
                                className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all relative ${slot.isOccupied
                                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                        : selectedSlot?._id === slot._id
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                                            : 'bg-white border-slate-100 hover:border-blue-400 text-slate-600'
                                    }`}
                            >
                                {slot.type === 'EV' ? <BatteryCharging size={24} /> : <Car size={24} />}
                                <span className="font-bold text-sm">{slot.slotNumber}</span>
                                {slot.isOccupied && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-6 mt-8 justify-center">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <div className="w-3 h-3 rounded full bg-white border-2 border-slate-200"></div> Available
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <div className="w-3 h-3 rounded full bg-slate-100 border-2 border-slate-200"></div> Occupied
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <div className="w-3 h-3 rounded full bg-blue-600"></div> Selected
                        </div>
                    </div>
                </div>

                {/* Booking Panel */}
                <div className="space-y-6">
                    {selectedSlot ? (
                        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xl shadow-blue-50/50 animate-in slide-in-from-right">
                            <h3 className="font-black text-xl text-slate-800 mb-1">Book {selectedSlot.slotNumber}</h3>
                            <p className="text-sm text-slate-500 mb-6">{selectedSlot.type === 'EV' ? 'Electric Charging Station' : 'Standard Visitor Parking'}</p>

                            <form onSubmit={handleBook} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Vehicle Number</label>
                                    <input
                                        required
                                        className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                                        placeholder="MH 02 AB 1234"
                                        value={bookingDetails.vehicleNumber}
                                        onChange={e => setBookingDetails({ ...bookingDetails, vehicleNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Duration (Hours)</label>
                                    <div className="flex items-center gap-4 mt-1">
                                        <input
                                            type="range" min="1" max="24" step="1"
                                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                            value={bookingDetails.duration}
                                            onChange={e => setBookingDetails({ ...bookingDetails, duration: Number(e.target.value) })}
                                        />
                                        <span className="font-black text-slate-800 w-12 text-center">{bookingDetails.duration}h</span>
                                    </div>
                                </div>

                                <div className="py-4 border-t border-dashed border-slate-200 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-500">Total payable</span>
                                        <span className="text-2xl font-black text-slate-800">₹{bookingDetails.duration * selectedSlot.hourlyRate}</span>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition transform hover:-translate-y-1">
                                    Confirm Booking
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center text-slate-400 mb-6">
                            <Car size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-bold">Select a slot to book</p>
                        </div>
                    )}

                    {/* My Active Bookings */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4">My Active Bookings</h3>
                        <div className="space-y-3">
                            {bookings.filter(b => b.status === 'Active').length === 0 ? (
                                <p className="text-sm text-slate-400 text-center py-4">No active bookings.</p>
                            ) : bookings.filter(b => b.status === 'Active').map(booking => (
                                <div key={booking._id} className="p-3 bg-green-50 border border-green-100 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-green-800 text-sm">{booking.slot?.slotNumber}</p>
                                        <p className="text-xs text-green-600 font-medium">Ends: {new Date(booking.endTime).toLocaleTimeString()}</p>
                                    </div>
                                    <span className="bg-white px-2 py-1 rounded text-xs font-bold text-green-600">Active</span>
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
