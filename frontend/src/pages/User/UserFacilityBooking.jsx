import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

const UserFacilityBooking = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [facility, setFacility] = useState('Community Hall');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [amount, setAmount] = useState(500); // Mock dynamic pricing

    const fetchMyBookings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/facilities?bookedBy=${user._id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMyBookings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/facilities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    facilityName: facility,
                    date,
                    startTime,
                    endTime,
                    bookedBy: user._id,
                    societyId: user.companyId || user.societyId, // Use companyId as per Auth Controller
                    amount
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Booking Request Sent Successfully!');
                fetchMyBookings();
                // Reset form
                setDate('');
                setStartTime('');
                setEndTime('');
            } else {
                alert(data.message || 'Booking Failed');
            }
        } catch (error) {
            alert('Request Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Facility Booking</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Form */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                        <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
                        New Request
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Facility</label>
                            <select
                                value={facility}
                                onChange={(e) => setFacility(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option>Community Hall</option>
                                <option>Clubhouse</option>
                                <option>Tennis Court</option>
                                <option>Guest Room</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    required
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Time</label>
                                <input
                                    type="time"
                                    required
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-slate-900 p-4 rounded-xl flex justify-between items-center transition-colors">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Estimated Cost</span>
                            <span className="text-xl font-bold text-blue-700 dark:text-blue-400">₹{amount}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 dark:bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50"
                        >
                            {loading ? 'Sending Request...' : 'Send Booking Request'}
                        </button>
                    </form>
                </div>

                {/* My Requests List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="font-bold text-lg text-slate-800 dark:text-white">My Booking History</h2>
                    {bookings.length > 0 ? (
                        bookings.map(book => (
                            <div key={book._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800 dark:text-white">{book.facilityName}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${book.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            book.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                            {book.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(book.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {book.startTime} - {book.endTime}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="font-bold text-slate-800 dark:text-white">₹{book.amount}</p>
                                    {book.status === 'Approved' && (
                                        <button className="mt-2 text-xs bg-green-600 dark:bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors">
                                            Pay Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 transition-colors">
                            <p className="text-slate-400">No booking requests found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserFacilityBooking;
