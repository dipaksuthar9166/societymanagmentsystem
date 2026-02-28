import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, User, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const GuardsTab = ({ token, refresh, flats }) => {
    const [subTab, setSubTab] = useState('staff'); // staff | visitors | blacklist

    // --- STAFF/GUARDS LOGIC ---
    const [guards, setGuards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [guardForm, setGuardForm] = useState({ name: '', email: '', password: '123', mobile: '', role: 'guard', flatNo: 'Main Gate' });

    // --- VISITORS LOGIC ---
    const [visitors, setVisitors] = useState([]);
    const [visitorForm, setVisitorForm] = useState({ name: '', mobile: '', visitorType: 'Guest', vehicleNo: '', flatId: '', purpose: '', photo: '' });
    const [isEntryMode, setIsEntryMode] = useState(false);

    // --- BLACKLIST LOGIC ---
    const [blacklist, setBlacklist] = useState([]);
    const [blacklistForm, setBlacklistForm] = useState({ name: '', mobile: '', reason: '' });

    useEffect(() => {
        if (subTab === 'staff') fetchGuards();
        if (subTab === 'visitors') fetchVisitors();
        if (subTab === 'blacklist') fetchBlacklist();
    }, [subTab]);

    // --- FETCH FUNCTIONS ---
    const fetchGuards = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/customers`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setGuards(data.filter(u => u.role === 'guard'));
            setLoading(false);
        } catch (e) { console.error(e); }
    };

    const fetchVisitors = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/visitors`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setVisitors(data);
        } catch (e) { console.error(e); }
    };

    const fetchBlacklist = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/visitors/blacklist`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setBlacklist(data);
        } catch (e) { console.error(e); }
    };

    // --- HANDLERS ---
    const handleAddGuard = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/admin/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(guardForm)
            });
            if (res.ok) { alert('Guard Added'); setShowAdd(false); setGuardForm({ name: '', email: '', password: '123', mobile: '', role: 'guard', flatNo: 'Main Gate' }); fetchGuards(); }
        } catch (e) { console.error(e); }
    };

    const handleVisitorEntry = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/visitors/entry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(visitorForm)
            });
            if (res.ok) {
                alert('Visitor Logged');
                setIsEntryMode(false);
                setVisitorForm({ name: '', mobile: '', visitorType: 'Guest', vehicleNo: '', flatId: '', purpose: '', photo: '' });
                fetchVisitors();
            } else {
                const err = await res.json();
                alert(err.message);
            }
        } catch (e) { console.error(e); }
    };

    const handleExit = async (id) => {
        if (!confirm("Mark exited?")) return;
        try {
            await fetch(`${API_BASE_URL}/visitors/${id}/exit`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVisitors();
        } catch (e) { console.error(e); }
    };

    const handleAddToBlacklist = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/visitors/blacklist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(blacklistForm)
            });
            if (res.ok) { alert("Blacklisted"); fetchBlacklist(); setBlacklistForm({ name: '', mobile: '', reason: '' }); }
            else { const err = await res.json(); alert(err.message); }
        } catch (e) { console.error(e); }
    };

    const handleRemoveBlacklist = async (id) => {
        if (!confirm("Remove from blacklist?")) return;
        try {
            await fetch(`${API_BASE_URL}/visitors/blacklist/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBlacklist();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Shield className="text-blue-600 dark:text-blue-400" /> Security & Gate
                </h2>
                <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                    <button onClick={() => setSubTab('staff')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${subTab === 'staff' ? 'bg-slate-900 dark:bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Staff</button>
                    <button onClick={() => setSubTab('visitors')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${subTab === 'visitors' ? 'bg-slate-900 dark:bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Visitor Logs</button>
                    <button onClick={() => setSubTab('blacklist')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${subTab === 'blacklist' ? 'bg-slate-900 dark:bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Blacklist</button>
                </div>
            </div>

            {/* STAFF TAB */}
            {subTab === 'staff' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button onClick={() => setShowAdd(!showAdd)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition">
                            <UserPlus size={18} /> {showAdd ? 'Cancel' : 'Add Guard'}
                        </button>
                    </div>
                    {showAdd && (
                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                            <h3 className="font-bold text-slate-700 dark:text-white mb-4">Onboard New Security Guard</h3>
                            <form onSubmit={handleAddGuard} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="p-3 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="Full Name" required value={guardForm.name} onChange={e => setGuardForm({ ...guardForm, name: e.target.value })} />
                                <input className="p-3 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="Email (Login ID)" required type="email" value={guardForm.email} onChange={e => setGuardForm({ ...guardForm, email: e.target.value })} />
                                <input className="p-3 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="Mobile Number" required value={guardForm.mobile} onChange={e => setGuardForm({ ...guardForm, mobile: e.target.value })} />
                                <input className="p-3 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="Password" value={guardForm.password} onChange={e => setGuardForm({ ...guardForm, password: e.target.value })} />
                                <button className="col-span-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Create Guard Account</button>
                            </form>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {guards.map(guard => (
                            <div key={guard._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center relative group transition-colors">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold mb-4">{guard.name[0]}</div>
                                <h3 className="font-bold text-slate-800 dark:text-white">{guard.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{guard.mobile}</p>
                                <p className="font-mono text-xs bg-slate-50 dark:bg-slate-900 dark:text-slate-300 px-2 py-1 rounded">{guard.email}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VISITORS TAB */}
            {subTab === 'visitors' && (
                <div className="space-y-6">
                    <button onClick={() => setIsEntryMode(!isEntryMode)} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition flex justify-center items-center gap-2">
                        {isEntryMode ? 'Close Entry Form' : '+ New Visitor Entry'}
                    </button>

                    {isEntryMode && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow border border-slate-200 dark:border-slate-700 transition-colors">
                            <form onSubmit={handleVisitorEntry} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="Visitor Name" required value={visitorForm.name} onChange={e => setVisitorForm({ ...visitorForm, name: e.target.value })} />
                                <input className="p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="Mobile No" required value={visitorForm.mobile} onChange={e => setVisitorForm({ ...visitorForm, mobile: e.target.value })} />
                                <select className="p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" value={visitorForm.visitorType} onChange={e => setVisitorForm({ ...visitorForm, visitorType: e.target.value })}>
                                    <option>Guest</option>
                                    <option>Delivery</option>
                                    <option>Cab</option>
                                    <option>Service</option>
                                </select>
                                <input className="p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="Vehicle No (Optional)" value={visitorForm.vehicleNo} onChange={e => setVisitorForm({ ...visitorForm, vehicleNo: e.target.value })} />
                                <select className="p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" value={visitorForm.flatId} onChange={e => setVisitorForm({ ...visitorForm, flatId: e.target.value })}>
                                    <option value="">Select Flat to Visit</option>
                                    {flats && flats.map(f => (
                                        <option key={f._id} value={f._id}>{f.flatNo} - {f.tenantName || 'Owner'}</option>
                                    ))}
                                </select>
                                <input className="p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="Purpose" value={visitorForm.purpose} onChange={e => setVisitorForm({ ...visitorForm, purpose: e.target.value })} />
                                <button className="col-span-full py-2 bg-slate-900 dark:bg-emerald-600 text-white font-bold rounded hover:bg-slate-800 dark:hover:bg-emerald-700">Confirm Entry</button>
                            </form>
                        </div>
                    )}

                    <div className="space-y-3">
                        {visitors.map(v => (
                            <div key={v._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm transition-colors">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-800 dark:text-white">{v.name}</h4>
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">{v.visitorType}</span>
                                        {v.status === 'In' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 animate-pulse">ACTIVE</span>}
                                        {v.status === 'Out' && <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-500">EXITED</span>}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{v.mobile} • Visiting: Flat {v.hostFlatId?.flatNo || 'N/A'}</p>
                                    <p className="text-xs text-slate-400">In: {new Date(v.checkInTime).toLocaleTimeString()} {v.checkOutTime && `• Out: ${new Date(v.checkOutTime).toLocaleTimeString()}`}</p>
                                </div>
                                {v.status === 'In' && (
                                    <button onClick={() => handleExit(v._id)} className="px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30">Exit</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BLACKLIST TAB */}
            {subTab === 'blacklist' && (
                <div className="space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 transition-colors">
                        <h3 className="font-bold text-red-800 dark:text-red-300 mb-2">Block Entry</h3>
                        <div className="flex gap-2">
                            <input className="flex-1 p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors" placeholder="Name" value={blacklistForm.name} onChange={e => setBlacklistForm({ ...blacklistForm, name: e.target.value })} />
                            <input className="flex-1 p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors" placeholder="Mobile" value={blacklistForm.mobile} onChange={e => setBlacklistForm({ ...blacklistForm, mobile: e.target.value })} />
                            <input className="flex-1 p-2 border rounded bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors" placeholder="Reason" value={blacklistForm.reason} onChange={e => setBlacklistForm({ ...blacklistForm, reason: e.target.value })} />
                            <button onClick={handleAddToBlacklist} className="px-6 bg-red-600 text-white font-bold rounded hover:bg-red-700">Block</button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {blacklist.map(b => (
                            <div key={b._id} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center transition-colors">
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">{b.name} <span className="text-red-500 dark:text-red-400 text-sm">({b.mobile})</span></h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Reason: {b.reason}</p>
                                </div>
                                <button onClick={() => handleRemoveBlacklist(b._id)} className="text-slate-400 hover:text-green-600 dark:hover:text-green-400 font-bold text-sm">Unblock</button>
                            </div>
                        ))}
                        {blacklist.length === 0 && <p className="text-center text-slate-400 py-10">No blacklisted visitors.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuardsTab;
