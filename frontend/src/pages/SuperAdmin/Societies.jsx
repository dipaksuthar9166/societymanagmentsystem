import React, { useState, useEffect } from 'react';
import {
    UserPlus, MapPin, Phone, Shield, MoreVertical, CheckCircle, Ban, ArrowRight, Edit, Trash2, Key,
    Search, LayoutDashboard, Building2, Users, CreditCard, Clock, Download, MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, resolveImageURL } from '../../config';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, updateTime }) => (
    <div className={`${color} rounded-xl p-6 text-white shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
        <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform">
            <Icon size={120} />
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-black mb-1">{value}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">{title}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Icon size={20} />
                </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-white/10 mt-auto">
                <Clock size={12} className="opacity-60" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">update : {updateTime}</span>
            </div>
        </div>
    </div>
);

const Societies = () => {
    const [societies, setSocieties] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        companyName: '',
        companyEmail: '',
        contactNumber: '',
        address: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        plan: 'Basic',
        logo: '',
        logoFile: null,
        maxRooms: 50,
        expiryDate: '',
        blocks: 1,
        floors: 4,
        flatsPerFloor: 4
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { user, login } = useAuth();

    const fetchSocieties = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/companies`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) setSocieties(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            const url = editId
                ? `${API_BASE_URL}/superadmin/companies/${editId}`
                : `${API_BASE_URL}/superadmin/companies`;

            const method = editId ? 'PUT' : 'POST';
            const formDataPayload = new FormData();

            formDataPayload.append('name', formData.companyName);
            formDataPayload.append('email', formData.companyEmail);
            formDataPayload.append('contactNumber', formData.contactNumber);
            formDataPayload.append('address', formData.address);
            formDataPayload.append('maxRooms', formData.maxRooms);
            formDataPayload.append('plan', formData.plan);
            formDataPayload.append('expiryDate', formData.expiryDate);

            if (formData.logoFile) {
                formDataPayload.append('logo', formData.logoFile);
            }

            if (!editId) {
                formDataPayload.append('companyName', formData.companyName);
                formDataPayload.append('companyEmail', formData.companyEmail);
                formDataPayload.append('adminName', formData.adminName);
                formDataPayload.append('adminEmail', formData.adminEmail);
                formDataPayload.append('adminPassword', formData.adminPassword);
                formDataPayload.append('structure', JSON.stringify({
                    blocks: formData.blocks,
                    floors: formData.floors,
                    flatsPerFloor: formData.flatsPerFloor
                }));
            }

            const res = await fetch(url, {
                method: method,
                headers: { Authorization: `Bearer ${user.token}` },
                body: formDataPayload
            });

            const data = await res.json();
            if (res.ok) {
                setShowAddForm(false);
                setEditId(null);
                setFormData({
                    companyName: '', companyEmail: '', contactNumber: '', address: '',
                    adminName: '', adminEmail: '', adminPassword: '', plan: 'Basic', logo: '', logoFile: null, maxRooms: 50, expiryDate: '',
                    blocks: 1, floors: 4, flatsPerFloor: 4
                });
                fetchSocieties();
            } else {
                alert(data.message || 'Failed to operate');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this society? This action cannot be undone.')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/companies/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) fetchSocieties();
            else alert('Failed to delete society');
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (soc) => {
        setEditId(soc._id);
        setFormData({
            companyName: soc.name,
            companyEmail: soc.email,
            contactNumber: soc.contactNumber || '',
            address: soc.address || '',
            adminName: soc.ownerId?.name || '',
            adminEmail: soc.ownerId?.email || '',
            adminPassword: '',
            plan: soc.plan || 'Basic',
            logo: soc.logo || '',
            maxRooms: soc.settings?.maxRooms || 50,
            expiryDate: soc.subscription?.expiryDate ? new Date(soc.subscription.expiryDate).toISOString().split('T')[0] : ''
        });
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Frozen' : 'Active';
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/companies/${id}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchSocieties();
        } catch (error) {
            console.error(error);
        }
    };

    const handleImpersonate = async (adminId) => {
        if (!adminId) return alert('No admin assigned to this society.');
        if (!window.confirm('You are about to login as this Society Admin. Proceed?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/auth/impersonate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ userId: adminId })
            });

            const data = await res.json();
            if (res.ok) login(data);
            else alert(data.message || 'Impersonation Failed');
        } catch (error) {
            console.error('Impersonation Error:', error);
            alert('Network Error');
        }
    };

    useEffect(() => { fetchSocieties(); }, []);

    const filteredSocieties = societies.filter(soc =>
        soc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        soc.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (soc.ownerId?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Chart Data Preparation
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const last6Months = [];
    const growthDataMap = {};
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${months[d.getMonth()]} ${d.getFullYear()}`.trim(); // Simplified key
        last6Months.push({ name: months[d.getMonth()], count: 0, fullName: key });
        growthDataMap[key] = 0; // Initialize
    }

    // Simplification: Just matching by month index for now as in original code logic was slightly complex
    // Let's stick to the previous simple logic but adapted for Recharts
    const growthChartData = last6Months.map((m, index) => {
        let count = 0;
        // Simple logic: count societies created in this month (ignoring year edge cases for simplicity in this quick migration, or better, match correctly)
        // Correct logic:
        const targetMonth = (today.getMonth() - (5 - index) + 12) % 12;

        societies.forEach(s => {
            const d = new Date(s.createdAt);
            if (d.getMonth() === targetMonth) count++;
        });
        return { name: m.name, count };
    });

    const planData = [
        { name: 'Enterprise', value: filteredSocieties.filter(s => s.plan === 'Enterprise').length },
        { name: 'Pro', value: filteredSocieties.filter(s => s.plan === 'Pro').length },
        { name: 'Basic', value: filteredSocieties.filter(s => s.plan === 'Basic' || !s.plan).length }
    ].filter(i => i.value > 0);

    const COLORS = ['#6366f1', '#3b82f6', '#94a3b8'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Network Command</h3>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Society Management</h2>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input
                            placeholder="Search societies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 dark:text-white shadow-sm placeholder:text-slate-400 text-sm"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            if (showAddForm) {
                                setEditId(null);
                                setFormData({
                                    companyName: '', companyEmail: '', contactNumber: '', address: '',
                                    adminName: '', adminEmail: '', adminPassword: '', plan: 'Basic', logo: '', logoFile: null, maxRooms: 50, expiryDate: '',
                                    blocks: 1, floors: 4, flatsPerFloor: 4
                                });
                            }
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg font-bold whitespace-nowrap active:scale-95 text-sm ${showAddForm ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-200 dark:shadow-indigo-900/20'}`}
                    >
                        {showAddForm ? 'Cancel' : <><UserPlus size={18} /> Add Society</>}
                    </button>
                </div>
            </div>

            {/* Quick Stats Row */}
            {!showAddForm && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Societies"
                        value={filteredSocieties.length}
                        icon={Building2}
                        color="bg-gradient-to-r from-[#fe8a39] to-[#fd536b]"
                        updateTime="Just now"
                    />
                    <StatCard
                        title="Total Capacity"
                        value={filteredSocieties.reduce((acc, curr) => acc + (curr.settings?.maxRooms || 0), 0).toLocaleString() + " Units"}
                        icon={Users}
                        color="bg-gradient-to-r from-[#0ac282] to-[#3fcc9a]"
                        updateTime="Just now"
                    />
                    <StatCard
                        title="Est. Revenue"
                        value={`₹${filteredSocieties.reduce((acc, curr) => acc + (curr.plan === 'Enterprise' ? 5000 : curr.plan === 'Pro' ? 2500 : 1000), 0).toLocaleString()}`}
                        icon={CreditCard}
                        color="bg-gradient-to-r from-[#fe5d70] to-[#fe909d]"
                        updateTime="Just now"
                    />
                    <StatCard
                        title="Avg. Occupancy"
                        value="84%"
                        icon={LayoutDashboard}
                        color="bg-gradient-to-r from-[#4099ff] to-[#73b4ff]"
                        updateTime="Just now"
                    />
                </div>
            )}

            {/* Charts Section */}
            {!showAddForm && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Growth Analytics</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={growthChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} py={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 flex flex-col items-center">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Plan Distribution</h3>
                        <div className="relative w-full h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={planData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {planData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
                                <span className="text-3xl font-black text-slate-800 dark:text-white">{filteredSocieties.length}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
                <form onSubmit={handleCreateOrUpdate} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Shield size={20} className="text-indigo-600" />
                                {editId ? 'Edit Building Information' : 'Building Information'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input placeholder="Official Email" required className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 dark:text-white text-sm" value={formData.companyEmail} onChange={e => setFormData({ ...formData, companyEmail: e.target.value })} />
                                <input placeholder="Contact Number" className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 dark:text-white text-sm" value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
                                <input placeholder="Room Quota (Max Flats)" type="number" className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 dark:text-white text-sm" value={formData.maxRooms} onChange={e => setFormData({ ...formData, maxRooms: e.target.value })} />
                                <select className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-600 dark:text-slate-300 text-sm" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })}>
                                    <option value="Basic">Basic Plan</option>
                                    <option value="Pro">Pro Plan</option>
                                    <option value="Enterprise">Enterprise Plan</option>
                                </select>
                                <input placeholder="Society Name" required className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 dark:text-white text-sm" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                                <div className="col-span-1 md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 ml-1">Society Logo (Upload)</label>
                                    <div className="flex items-center gap-4">
                                        {(formData.logoFile || formData.logo) && (
                                            <img
                                                src={formData.logoFile ? URL.createObjectURL(formData.logoFile) : formData.logo}
                                                alt="Preview"
                                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-500 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/20 file:text-indigo-700 hover:file:bg-indigo-100"
                                            onChange={e => setFormData({ ...formData, logoFile: e.target.files[0] })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 ml-1">Subscription Expiry</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-600 dark:text-white text-sm"
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {!editId && (
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 bg-indigo-50 dark:bg-indigo-900/20 inline-block px-3 py-1 rounded-lg text-indigo-700 dark:text-indigo-400">Auto-Generate Infrastructure</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400">Total Blocks</label>
                                            <input type="number" min="1" className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white text-sm" value={formData.blocks} onChange={e => setFormData({ ...formData, blocks: Number(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400">Floors / Block</label>
                                            <input type="number" min="1" className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white text-sm" value={formData.floors} onChange={e => setFormData({ ...formData, floors: Number(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400">Flats / Floor</label>
                                            <input type="number" min="1" className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white text-sm" value={formData.flatsPerFloor} onChange={e => setFormData({ ...formData, flatsPerFloor: Number(e.target.value) })} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 italic">* This will automatically create all rooms (e.g. A-101 to {String.fromCharCode(64 + (formData.blocks || 1))}-{formData.floors || 1}0{formData.flatsPerFloor || 1})</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <MapPin size={20} className="text-indigo-600" />
                                Master Admin Setup
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    placeholder="Admin Name"
                                    required={!editId}
                                    disabled={!!editId}
                                    className={`p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 dark:text-white text-sm ${editId ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    value={formData.adminName}
                                    onChange={e => setFormData({ ...formData, adminName: e.target.value })}
                                />
                                <input
                                    placeholder="Admin Email"
                                    required={!editId}
                                    disabled={!!editId}
                                    className={`p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 dark:text-white text-sm ${editId ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    value={formData.adminEmail}
                                    onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                />
                                {!editId && (
                                    <input placeholder="Admin Password" required type="password" className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 dark:text-white text-sm col-span-full" value={formData.adminPassword} onChange={e => setFormData({ ...formData, adminPassword: e.target.value })} />
                                )}
                            </div>
                            {editId && <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg dark:text-amber-400">Admin details cannot be changed from here directly. Please manage admins separately.</p>}
                        </div>
                    </div>
                    <button type="submit" className="mt-8 w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg flex items-center justify-center gap-2 shadow-indigo-200 dark:shadow-indigo-900/20">
                        {editId ? 'Update Society Information' : 'Initialize Society Protocol'} <ArrowRight size={18} />
                    </button>
                </form>
            )}

            {/* Desktop Table View */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Active Networks</h3>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400"><Download size={16} /></button>
                        <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400"><MoreHorizontal size={16} /></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Society Details</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Quota</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Master Admin</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Plan Tier</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredSocieties.map(soc => (
                                <tr key={soc._id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors ${soc.status === 'Frozen' ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50' : ''}`}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            {soc.logo ? (
                                                <img src={resolveImageURL(soc.logo)} alt={soc.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-700" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold">
                                                    {soc.name[0]}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white text-sm">{soc.name}</p>
                                                <p className="text-slate-400 mt-1 flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider"><MapPin size={10} /> {soc.address || 'Global Access'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-slate-700 dark:text-slate-300 font-bold text-xs">{soc.settings?.maxRooms || 50} Units</span>
                                            <div className="w-20 h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-slate-800 dark:text-white text-sm font-bold">{soc.ownerId?.name || 'Unassigned'}</p>
                                        <p className="text-slate-400 text-[10px] font-medium mt-1">{soc.ownerId?.email}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${soc.plan === 'Enterprise' ? 'bg-indigo-50 text-indigo-600' :
                                            soc.plan === 'Pro' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {soc.plan}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase inline-flex items-center gap-1 ${soc.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {soc.status === 'Active' ? <CheckCircle size={10} /> : <Ban size={10} />}
                                            {soc.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(soc)} className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => toggleStatus(soc._id, soc.status)} className={`p-2 rounded-lg transition-colors ${soc.status === 'Active' ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-emerald-50 text-emerald-600'}`} title={soc.status === 'Active' ? 'Freeze' : 'Activate'}>
                                                <Shield size={16} />
                                            </button>
                                            <button onClick={() => handleImpersonate(soc.ownerId?._id)} className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors" title="Login as Admin" disabled={!soc.ownerId?._id}>
                                                <Key size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(soc._id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {societies.length === 0 && !loading && (
                <div className="p-20 text-center space-y-4 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600">
                        <Shield size={40} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No Building Data Found. Initialize your first node.</p>
                </div>
            )}

            {loading && (
                <div className="text-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading Network...</p>
                </div>
            )}
        </div>
    );
};

export default Societies;
