import React, { useState } from 'react';
import { API_BASE_URL } from '../../../config';
import { useAlert } from '../../../context/AlertContext'; // Import AlertContext
import { User, Car, Home, FileText, Calendar, LogOut, UserPlus, Link as LinkIcon, Mail, Ban, Filter, LayoutGrid, Wrench, Clock, Box, Brush, AlertTriangle, Trash2, Key, Search } from 'lucide-react';

const RoomsTab = ({ flats, refresh, token, complaints }) => {
    const { showAlert, showConfirm } = useAlert(); // Hook
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFlat, setSelectedFlat] = useState(null);
    const [modalTab, setModalTab] = useState('details');

    // Form State
    const [formData, setFormData] = useState({});

    // Asset Add State
    const [newAsset, setNewAsset] = useState({ name: '', condition: 'Good', serialNo: '' });

    // Toggle for User Assignment Mode
    const [assignMode, setAssignMode] = useState('link');
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });

    const openEditModal = (flat) => {
        setSelectedFlat(flat);
        setModalTab('details');
        setFormData({
            ...flat,
            residencyType: flat.residencyType || 'Rented',
            maintenanceAmount: flat.maintenanceAmount || 0,
            parkingSlot: flat.parkingSlot || '',
            possessionDate: flat.possessionDate ? flat.possessionDate.split('T')[0] : '',
            tenantId: flat.tenantId || '',
            familyMembers: flat.familyMembers || 0,
            vehicleDetails: flat.vehicleDetails || '',
            assets: flat.assets || [],
            renovationStatus: flat.renovationStatus || 'None',
            floorPlan: flat.floorPlan || '',
            renovationDetails: flat.renovationDetails || '',
            legalDetails: flat.legalDetails || {
                index2: { regNo: '', marketValue: '' },
                propertyCard: { surveyNo: '', tpNo: '', fpNo: '', citySurveyNo: '' },
                amc: { tenementNo: '', propertyTaxId: '' }
            }
        });
        setAssignMode('link');
        setNewUser({ name: '', email: '', password: '' });
    };

    const handleUpdate = async () => {
        if (!selectedFlat) return;
        try {
            const payload = { ...formData };
            if (assignMode === 'create' && !selectedFlat.tenantId) {
                if (!newUser.name || !newUser.email || !newUser.password) {
                    await showAlert('Missing Fields', 'Please fill all New User fields', 'error');
                    return;
                }
                payload.newUser = newUser;
                delete payload.tenantId;
            } else {
                if (payload.tenantId === '') delete payload.tenantId;
            }

            const res = await fetch(`${API_BASE_URL}/flats/${selectedFlat._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                await showAlert('Success', 'Flat updated successfully', 'success');
                setSelectedFlat(null);
                refresh();
            }
            else {
                await showAlert('Update Failed', data.message || 'Unknown error', 'error');
            }
        } catch (error) { console.error(error); }
    };

    const handleDeallot = async (force = false) => {
        const confirmed = await showConfirm(
            force ? 'Force De-allocation?' : 'Confirm Vacate?',
            force ? 'This will forcibly remove the resident despite pending dues. Are you sure?' : 'Are you sure you want to vacate this flat? This action removes resident access.'
        );

        if (!confirmed) return;

        try {
            const res = await fetch(`${API_BASE_URL}/flats/${selectedFlat._id}/deallot`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ force })
            });
            const data = await res.json();
            if (res.ok) {
                await showAlert('Vacated', data.message, 'success');
                setSelectedFlat(null);
                refresh();
            }
            else if (data.code === 'PENDING_DUES') {
                const forceConfirm = await showConfirm(
                    'Pending Dues Detected',
                    `${data.message}\n\nDo you want to FORCE vacate anyway?`,
                    'Force Vacate',
                    'Cancel'
                );
                if (forceConfirm) handleDeallot(true);
            } else {
                await showAlert('Error', data.message, 'error');
            }
        } catch (error) { console.error(error); }
    }

    const addAsset = () => {
        if (!newAsset.name) return;
        setFormData({ ...formData, assets: [...(formData.assets || []), newAsset] });
        setNewAsset({ name: '', condition: 'Good', serialNo: '' });
    };

    const removeAsset = (idx) => {
        const updated = [...formData.assets];
        updated.splice(idx, 1);
        setFormData({ ...formData, assets: updated });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Occupied': return 'bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500 border-y border-r border-slate-200 dark:border-slate-700';
            case 'Vacant': return 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 opacity-70';
            case 'Maintenance': return 'bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30';
            case 'Defaulter': return 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30';
            default: return 'bg-white border-slate-200';
        }
    };

    const filteredFlats = flats.filter(f => {
        const matchesFilter = filter === 'All' ? true : f.status === filter;
        const matchesSearch = f.flatNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.ownerName && f.ownerName.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const isOccupied = !!selectedFlat?.tenantId;
    const flatComplaints = complaints ? complaints.filter(c => c.flatId?._id === selectedFlat?._id || c.flatId === selectedFlat?._id) : [];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col h-[calc(100vh-120px)] overflow-hidden shadow-sm">

            {/* Header - Compact */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-900 z-10 shadow-sm shrink-0">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <LayoutGrid size={18} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800 dark:text-white leading-tight">Flat Management</h2>
                        <p className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-slate-500 font-semibold w-fit">{filteredFlats.length} Units</p>
                    </div>
                </div>

                <div className="flex flex-1 items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Search - Compact */}
                    <div className="relative group w-full sm:w-48">
                        <Search size={14} className="absolute left-2.5 top-2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-none rounded-md focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                            placeholder="Search Flat..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter - Tabs */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md shrink-0">
                        {['All', 'Occupied', 'Vacant'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-all ${filter === f
                                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid - High Density */}
            <div className="p-4 overflow-y-auto bg-slate-50/50 dark:bg-black/20 flex-1">
                <div className="grid grid-cols-2 min-[450px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
                    {filteredFlats.map((flat) => (
                        <div
                            key={flat._id}
                            onClick={() => openEditModal(flat)}
                            className={`
                                relative p-3 rounded-lg cursor-pointer group hover:shadow-md transition-all duration-200
                                ${getStatusColor(flat.status || 'Vacant')}
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold uppercase ${flat.status === 'Occupied' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                    {flat.block}-{flat.floor}
                                </span>
                                {flat.status === 'Occupied' ? (
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                )}
                            </div>

                            <div className="text-center py-1">
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform origin-center">{flat.flatNo}</h3>
                                <p className="text-[9px] text-slate-500 font-medium truncate max-w-full">
                                    {flat.residencyType === 'Owner' ? (flat.ownerName || 'Owner') : 'Rented'}
                                </p>
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-mono text-slate-400">{flat.flatType || '2BHK'}</span>
                                {flat.vehicleDetails && <Car size={10} className="text-slate-400" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal - Compact Popup Style */}
            {selectedFlat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] overflow-hidden ring-1 ring-black/5">

                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    Unit {selectedFlat.flatNo}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${isOccupied ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {isOccupied ? 'Occupied' : 'Vacant'}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500">{formData.block} Block • {formData.floor}th Floor • {formData.flatType}</p>
                            </div>
                            <button onClick={() => setSelectedFlat(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <LogOut size={18} className="text-slate-400 rotate-180" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
                            {['details', 'ownership', 'assets', 'history'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setModalTab(tab)}
                                    className={`py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${modalTab === tab ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">

                            {/* TAB: DETAILS */}
                            {modalTab === 'details' && (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 block mb-1">Type</label>
                                                <select className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none" value={formData.flatType} onChange={e => setFormData({ ...formData, flatType: e.target.value })}>
                                                    <option value="1BHK">1 BHK</option><option value="2BHK">2 BHK</option><option value="3BHK">3 BHK</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 block mb-1">Maint. (₹)</label>
                                                <input type="number" className="w-full text-xs p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-bold" value={formData.maintenanceAmount} onChange={e => setFormData({ ...formData, maintenanceAmount: Number(e.target.value) })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Parking Slot</label>
                                        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-lg">
                                            <Car size={14} className="text-slate-400" />
                                            <input className="w-full bg-transparent text-xs font-bold outline-none" placeholder="Not Assigned" value={formData.parkingSlot} onChange={e => setFormData({ ...formData, parkingSlot: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: OWNERSHIP */}
                            {modalTab === 'ownership' && (
                                <div className="space-y-6">
                                    {/* Owner */}
                                    <div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Owner Details</h4>
                                        <div className="space-y-2">
                                            <input className="w-full text-sm font-semibold p-2 border-b border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:border-indigo-500 transition-colors" placeholder="Owner Name" value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input className="text-xs p-2 border-b border-slate-200 dark:border-slate-700 bg-transparent outline-none" placeholder="Phone" value={formData.ownerPhone} onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })} />
                                                <input className="text-xs p-2 border-b border-slate-200 dark:border-slate-700 bg-transparent outline-none" placeholder="Email" value={formData.ownerEmail} onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tenant / Resident */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Resident Access</h4>
                                            {!isOccupied && (
                                                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded text-[10px]">
                                                    <button onClick={() => setAssignMode('link')} className={`px-2 py-1 rounded ${assignMode === 'link' ? 'bg-white shadow text-black' : 'text-slate-500'}`}>Link</button>
                                                    <button onClick={() => setAssignMode('create')} className={`px-2 py-1 rounded ${assignMode === 'create' ? 'bg-white shadow text-black' : 'text-slate-500'}`}>New</button>
                                                </div>
                                            )}
                                        </div>

                                        {isOccupied ? (
                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                                        {String(formData.ownerName || 'U').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Active Resident</p>
                                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 opacity-80">ID: ...{String(selectedFlat.tenantId).slice(-4)}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeallot(false)} className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-white px-2 py-1 rounded border border-red-100 shadow-sm">Vacate</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                {assignMode === 'link' ? (
                                                    <input className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 ring-indigo-500" placeholder="Paste User ID or Email to Link..." value={formData.tenantId} onChange={e => setFormData({ ...formData, tenantId: e.target.value })} />
                                                ) : (
                                                    <>
                                                        <input className="w-full p-2 bg-slate-50 border rounded text-xs outline-none" placeholder="New User Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                                                        <input className="w-full p-2 bg-slate-50 border rounded text-xs outline-none" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                                                        <input className="w-full p-2 bg-slate-50 border rounded text-xs outline-none" type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB: ASSETS */}
                            {modalTab === 'assets' && (
                                <div>
                                    <div className="flex gap-2 mb-3">
                                        <input className="flex-1 p-2 text-xs border rounded bg-slate-50" placeholder="Item Name" value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} />
                                        <button onClick={addAsset} className="p-2 bg-slate-900 text-white rounded text-xs font-bold">Add</button>
                                    </div>
                                    {formData.assets?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 border-b border-slate-100 text-xs text-slate-600">
                                            <span>{item.name}</span>
                                            <button onClick={() => removeAsset(idx)} className="text-red-500">Remove</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* TAB: HISTORY */}
                            {modalTab === 'history' && (
                                <div className="space-y-3">
                                    {flatComplaints.length === 0 ? <p className="text-xs text-slate-400 text-center py-4">No recent history.</p> : flatComplaints.map(c => (
                                        <div key={c._id} className="text-xs p-3 bg-slate-50 rounded border border-slate-100">
                                            <div className="flex justify-between font-bold mb-1">
                                                <span>{c.category}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
                                            </div>
                                            <p className="text-slate-500">{c.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>

                        {/* Panel Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky bottom-0">
                            <button onClick={handleUpdate} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
                                {isOccupied ? 'Update Unit' : 'Save & Allocate'}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomsTab;
