import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import { useToast } from '../../components/ToastProvider';
import ConfirmationModal from '../../components/ConfirmationModal';
import { CheckCircle, XCircle, Clock, Calendar as CalIcon, User, Trash2 } from 'lucide-react';

const FacilityBooking = () => {
    const { user } = useAuth();
    const { showSuccess, showError, showWarning } = useToast();

    // Modal States
    const [confirmAction, setConfirmAction] = useState(null); // { type, id, status, label }
    const [deletingFacility, setDeletingFacility] = useState(null);
    const [activeTab, setActiveTab] = useState('requests'); // requests | calendar | amenities
    const [requests, setRequests] = useState([]);
    const [approvedBookings, setApprovedBookings] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);

    // New Facility Form
    const [newFacility, setNewFacility] = useState({
        name: '',
        chargePerSlot: 0,
        slotDurationHours: 1,
        capacity: 1
    });

    // Calendar State
    const [date, setDate] = useState(new Date());

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch Facilities
            const facRes = await fetch(`${API_BASE_URL}/facilities/list`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const facData = await facRes.json();
            if (facRes.ok) setFacilities(facData);

            // Fetch Bookings
            const bookRes = await fetch(`${API_BASE_URL}/facilities?societyId=${user.companyId || user._id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const bookData = await bookRes.json();

            if (bookRes.ok) {
                const pending = bookData.filter(b => b.status === 'Requested');
                const approved = bookData.filter(b => b.status === 'Approved');
                setRequests(pending);
                setApprovedBookings(approved);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleAddFacility = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/facilities/list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(newFacility)
            });
            if (res.ok) {
                alert('Facility Added');
                setNewFacility({ name: '', chargePerSlot: 0, slotDurationHours: 1, capacity: 1 });
                fetchAllData();
            } else {
                alert('Failed to add facility');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteFacility = async (id) => {
        if (!confirm('Delete this facility?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/facilities/list/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) fetchAllData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this booking?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/facilities/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                alert(`Booking ${status}`);
                fetchAllData();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Filter approved bookings for selected date in Calendar view
    const getBookingsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return approvedBookings.filter(b => b.date.startsWith(dateStr));
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Facility Management</h1>
                <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        Requests ({requests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        Calendar
                    </button>
                    <button
                        onClick={() => setActiveTab('amenities')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'amenities' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        Amenities
                    </button>
                </div>
            </div>

            <AnimatePresence mode='wait'>
                {activeTab === 'requests' && (
                    <motion.div
                        key="requests"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {requests.length > 0 ? (
                            requests.map(req => (
                                <div key={req._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                            <CalIcon size={24} />
                                        </div>
                                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs px-2 py-1 rounded-full font-bold">
                                            {req.status}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{req.facilityName}</h3>
                                    <div className="space-y-2 mb-6">
                                        <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                                            <User size={16} /> {req.bookedBy?.name || 'Unknown Resident'} ({req.bookedBy?.flatNo || 'N/A'})
                                        </p>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                                            <CalIcon size={16} /> {new Date(req.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                                            <Clock size={16} /> {req.startTime} - {req.endTime}
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <button
                                            onClick={() => handleStatusUpdate(req._id, 'Approved')}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                                        >
                                            <CheckCircle size={18} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-900/20 transition"
                                        >
                                            <XCircle size={18} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                No Pending Requests
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'calendar' && (
                    <motion.div
                        key="calendar"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {/* Calendar Side */}
                        <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <Calendar
                                onChange={setDate}
                                value={date}
                                className="w-full border-none react-calendar-dark"
                                tileContent={({ date, view }) => {
                                    if (view === 'month') {
                                        const count = approvedBookings.filter(b => b.date.startsWith(date.toISOString().split('T')[0])).length;
                                        return count > 0 ? <div className="mx-auto w-2 h-2 bg-blue-500 rounded-full mt-1"></div> : null;
                                    }
                                }}
                            />
                        </div>

                        {/* List Side */}
                        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                                Bookings for <span className="text-blue-600 dark:text-blue-400">{date.toDateString()}</span>
                            </h2>
                            <div className="space-y-4">
                                {getBookingsForDate(date).length > 0 ? (
                                    getBookingsForDate(date).map(book => (
                                        <div key={book._id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white">{book.facilityName}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{book.startTime} - {book.endTime}</p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1">Booked by: {book.bookedBy?.name}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">Approved</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 dark:text-slate-500 italic">No approved bookings for this date.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'amenities' && (
                    <motion.div
                        key="amenities"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Add New Facility</h3>
                                <div className="w-full space-y-3">
                                    <input className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white" placeholder="Name (e.g. Gym)" value={newFacility.name} onChange={e => setNewFacility({ ...newFacility, name: e.target.value })} />
                                    <div className="flex gap-2">
                                        <input type="number" className="w-1/2 p-2 border border-slate-200 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white" placeholder="₹ Charge/Slot" value={newFacility.chargePerSlot} onChange={e => setNewFacility({ ...newFacility, chargePerSlot: Number(e.target.value) })} />
                                        <input type="number" className="w-1/2 p-2 border border-slate-200 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white" placeholder="Hours/Slot" value={newFacility.slotDurationHours} onChange={e => setNewFacility({ ...newFacility, slotDurationHours: Number(e.target.value) })} />
                                    </div>
                                    <button onClick={handleAddFacility} className="w-full py-2 bg-slate-900 dark:bg-slate-700 text-white rounded font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-600">Create Facility</button>
                                </div>
                            </div>

                            {facilities.map(fac => (
                                <div key={fac._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative group">
                                    <button onClick={() => handleDeleteFacility(fac._id)} className="absolute top-4 right-4 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400"><XCircle size={18} /></button>
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4 font-bold text-xl">
                                        {fac.name[0]}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{fac.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{fac.description || 'No description available'}</p>

                                    <div className="mt-4 flex gap-2">
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-600">
                                            ₹{fac.chargePerSlot} / {fac.slotDurationHours}hr
                                        </span>
                                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-600">
                                            Cap: {fac.capacity}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Approval/Rejection Modal */}
            <ConfirmationModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => handleStatusUpdate(confirmAction.id, confirmAction.status)}
                title={`${confirmAction?.label} Booking?`}
                message={`Are you sure you want to ${confirmAction?.status.toLowerCase()} this facility booking request?`}
                type={confirmAction?.status === 'Approved' ? 'primary' : 'danger'}
            />

            {/* Delete Facility Modal */}
            <ConfirmationModal
                isOpen={!!deletingFacility}
                onClose={() => setDeletingFacility(null)}
                onConfirm={() => handleDeleteFacility(deletingFacility)}
                title="Delete Facility?"
                message="Are you sure you want to permanently remove this facility? All associated booking history might be affected."
                type="danger"
            />
        </div>
    );
};

export default FacilityBooking;
