import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, Loader, Plus, History, Building2 } from 'lucide-react';

const UserFacilityBooking = ({ isMobile }) => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('new');

    // Form State
    const [facility, setFacility] = useState('Community Hall');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [amount, setAmount] = useState(500);

    const fetchMyBookings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/facilities?bookedBy=${user._id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setBookings(data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchMyBookings(); }, []);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/facilities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ facilityName: facility, date, startTime, endTime, bookedBy: user._id, societyId: user.companyId || user.societyId, amount })
            });
            if (res.ok) {
                fetchMyBookings();
                setActiveTab('history');
                setDate(''); setStartTime(''); setEndTime('');
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    if (isMobile) {
        return (
            <div className="space-y-6">
                {/* Native Tab Switcher */}
                <div className="flex bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[25px] w-full sticky top-0 z-20 border border-white/50 shadow-sm">
                    <button onClick={() => setActiveTab('new')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'new' ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-slate-400'}`}>
                        <Plus size={16} /> New Request
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-slate-400'}`}>
                        <History size={16} /> My History
                    </button>
                </div>

                {activeTab === 'new' ? (
                    <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-[30px]">
                            <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-100">
                                <Building2 size={28} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none mb-1">Book Amenity</h3>
                                <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em]">Reserve society resources</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Facility Type</label>
                                <select value={facility} onChange={(e) => setFacility(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[25px] p-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all appearance-none cursor-pointer">
                                    <option>Community Hall</option>
                                    <option>Clubhouse</option>
                                    <option>Tennis Court</option>
                                    <option>Guest Room</option>
                                    <option>Swimming Pool (Private)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Reservation Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[25px] p-5 pl-14 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all" min={new Date().toISOString().split('T')[0]} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">Start</label>
                                    <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[25px] p-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4">End</label>
                                    <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[25px] p-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-[30px] border border-slate-100 flex justify-between items-center shadow-inner">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Booking Fee (Locked)</p>
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{amount}</p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-green-500 border border-green-50"><CheckCircle size={28} /></div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs rounded-[25px] shadow-2xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50">
                                {loading ? 'Processing...' : 'Secure Booking'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.length > 0 ? (
                            bookings.map(book => (
                                <div key={book._id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-500">
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-800 leading-tight">{book.facilityName}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(book.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${book.status === 'Approved' ? 'bg-green-50 text-green-600' : book.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {book.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                        <div className="flex items-center gap-1.5"><Clock size={12} /> {book.startTime} - {book.endTime}</div>
                                        <div className="font-black text-slate-800">₹{book.amount}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                                <div className="text-center py-24 bg-white rounded-[50px] border-4 border-dashed border-slate-50">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Calendar size={48} className="text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Booking History Found</p>
                                </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ORIGINAL DESKTOP UI
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
