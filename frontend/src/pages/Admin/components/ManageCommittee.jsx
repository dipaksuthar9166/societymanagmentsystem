import React, { useState, useEffect, useRef } from 'react';
import {
    Shield, Plus, Trash2, User, Phone, Clock,
    Briefcase, Search, ChevronDown, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../config';

const ManageCommittee = ({ token, refresh }) => {
    const [committee, setCommittee] = useState([]);
    const [residents, setResidents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [isCreatingNew, setIsCreatingNew] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        userId: '',
        designation: 'Member',
        portfolio: '',
        officeHours: '',
        // New User Fields
        name: '',
        email: '',
        password: '',
        flatNo: '',
        mobile: ''
    });

    // Custom Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch data
    const fetchCommittee = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/committee`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setCommittee(await res.json());
        } catch (error) { console.error(error); }
    };

    const fetchResidents = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/customers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const users = await res.json();
                setResidents(users.map(u => ({
                    _id: u._id,
                    name: u.name,
                    flatNo: u.flatNo || 'N/A',
                    profileImage: u.profileImage,
                    contactNumber: u.contactNumber || u.mobile || 'N/A'
                })));
            }
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchCommittee();
        fetchResidents();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handlers
    const handleAssign = async () => {
        if (!isCreatingNew && !formData.userId) return alert('Please select a resident to assign.');
        if (isCreatingNew && (!formData.name || !formData.email || !formData.password || !formData.flatNo)) {
            return alert('Please fill all new member details.');
        }

        setLoading(true);
        try {
            const endpoint = isCreatingNew ? `${API_BASE_URL}/committee/create` : `${API_BASE_URL}/committee/assign`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                fetchCommittee();
                fetchResidents(); // Refresh resident list if new created
                setIsModalOpen(false);
                setFormData({
                    userId: '', designation: 'Member', portfolio: '', officeHours: '',
                    name: '', email: '', password: '', flatNo: '', mobile: ''
                });
                setIsCreatingNew(false);
                setIsDropdownOpen(false);
            } else {
                alert(data.message || 'Failed to assign role');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userId, name) => {
        if (!window.confirm(`Are you sure you want to remove ${name} from the committee?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/committee/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ userId })
            });

            if (res.ok) {
                fetchCommittee();
            } else {
                alert('Failed to remove member.');
            }
        } catch (error) { console.error(error); }
    };

    const filteredCommittee = committee.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.memberPortfolio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleColor = (role) => {
        switch (role) {
            case 'Chairman': return 'bg-purple-600 text-white';
            case 'Secretary': return 'bg-blue-600 text-white';
            case 'Treasurer': return 'bg-green-600 text-white';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const selectedResident = residents.find(r => r._id === formData.userId);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Management Committee
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Authorized members managing society operations.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all"
                >
                    <Plus className="w-4 h-4" /> Assign New Role
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search members, roles..."
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium dark:text-white transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Committee Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredCommittee.map((member, index) => (
                        <motion.div
                            key={member._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group"
                        >
                            {/* Decorative Background */}
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-opacity-10 z-0 transition-colors ${member.designation === 'Chairman' ? 'bg-purple-500' :
                                member.designation === 'Secretary' ? 'bg-blue-500' :
                                    member.designation === 'Treasurer' ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-500'
                                }`} />

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-14 h-14 rounded-2xl overflow-hidden shadow-sm border-4 border-white dark:border-slate-800 ${member.profileImage ? 'bg-white dark:bg-slate-700' :
                                        member.designation === 'Chairman' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                            member.designation === 'Secretary' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                                member.designation === 'Treasurer' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                        } flex items-center justify-center text-xl font-bold transition-colors`}>
                                        {member.profileImage ? (
                                            <img src={member.profileImage} alt={member.name} className="w-full h-full object-cover" />
                                        ) : (
                                            member.name[0]
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemove(member._id, member.name)}
                                        className="p-2 text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                                        title="Remove from Committee"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="mb-6">
                                    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2 ${getRoleColor(member.designation).replace('bg-slate-100 text-slate-600', 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300')}`}>
                                        {member.designation}
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{member.name}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Flat {member.flatNo}</p>
                                </div>

                                {/* Details */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                                        <Briefcase className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium">{member.memberPortfolio || 'General Member'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium">{member.officeHours || 'By Appointment'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium">{member.contactNumber || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Add New Card (Empty State) */}
                <motion.button
                    onClick={() => setIsModalOpen(true)}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all min-h-[300px] group"
                >
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                        <Plus className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-lg">Add Member</p>
                    <p className="text-xs font-medium mt-1">Assign a new role</p>
                </motion.button>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <div onClick={() => setIsModalOpen(false)} className="absolute inset-0" />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2rem] shadow-2xl relative overflow-hidden transition-colors"
                        >
                            {/* Modal Header */}
                            <div className="bg-slate-900 p-6 text-white text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                                <Shield className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                                <h3 className="text-2xl font-black">Assign Committee Role</h3>
                                <p className="text-white/60 text-sm mt-2">Grant administrative powers to a resident.</p>
                            </div>

                            <div className="p-8 space-y-5">
                                {/* User Selection Mode Toggle */}
                                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-4 transition-colors">
                                    <button
                                        onClick={() => setIsCreatingNew(false)}
                                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${!isCreatingNew ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                    >
                                        Select Existing
                                    </button>
                                    <button
                                        onClick={() => setIsCreatingNew(true)}
                                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all ${isCreatingNew ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                    >
                                        Create New
                                    </button>
                                </div>

                                {isCreatingNew ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Member Details</label>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                            <input
                                                type="password"
                                                placeholder="Set Password"
                                                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="Flat No"
                                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors"
                                                    value={formData.flatNo}
                                                    onChange={e => setFormData({ ...formData, flatNo: e.target.value })}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Mobile No"
                                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors"
                                                    value={formData.mobile}
                                                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Select Resident</label>
                                        <div className="relative" ref={dropdownRef}>
                                            <button
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-all hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                                            >
                                                {selectedResident ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold overflow-hidden">
                                                            {selectedResident.profileImage ? (
                                                                <img src={selectedResident.profileImage} alt="" className="w-full h-full object-cover" />
                                                            ) : selectedResident.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800 dark:text-white">{selectedResident.name}</p>
                                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{selectedResident.contactNumber} • Flat {selectedResident.flatNo}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">-- Choose Resident --</span>
                                                )}
                                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            <AnimatePresence>
                                                {isDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 p-2"
                                                    >
                                                        {residents.map(r => (
                                                            <button
                                                                key={r._id}
                                                                onClick={() => {
                                                                    setFormData({ ...formData, userId: r._id });
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${formData.userId === r._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold overflow-hidden">
                                                                    {r.profileImage ? (
                                                                        <img src={r.profileImage} alt="" className="w-full h-full object-cover" />
                                                                    ) : r.name[0]}
                                                                </div>
                                                                <div className="text-left flex-1">
                                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{r.name}</p>
                                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{r.contactNumber} • Flat {r.flatNo}</p>
                                                                </div>
                                                                {formData.userId === r._id && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Role</label>
                                        <select
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none transition-colors"
                                            value={formData.designation}
                                            onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                        >
                                            <option value="Chairman">Chairman</option>
                                            <option value="Secretary">Secretary</option>
                                            <option value="Treasurer">Treasurer</option>
                                            <option value="Member">Member</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Portfolio</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Security"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                            value={formData.portfolio}
                                            onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1">Availability</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Weekends 10 AM - 12 PM"
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                                        value={formData.officeHours}
                                        onChange={e => setFormData({ ...formData, officeHours: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAssign}
                                        disabled={loading}
                                        className="flex-1 py-4 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-xl shadow-slate-200 dark:shadow-none transition-all disabled:opacity-70"
                                    >
                                        {loading ? 'Processing...' : 'Confirm Assignment'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageCommittee;
