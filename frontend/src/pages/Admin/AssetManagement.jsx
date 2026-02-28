import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { Wrench, Plus, Trash2, Calendar, FileText, Activity, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AssetManagement = ({ token }) => {
    const [assets, setAssets] = useState([]);
    const [view, setView] = useState('list'); // list | add | edit | details
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Infrastructure',
        location: '',
        purchaseDate: '',
        warrantyExpiry: '',
        amcExpiry: '',
        status: 'Operational'
    });

    // Service Log Form
    const [serviceLog, setServiceLog] = useState({
        description: '',
        cost: '',
        performedBy: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/assets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setAssets(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        try {
            const url = selectedAsset ? `${API_BASE_URL}/assets/${selectedAsset._id}` : `${API_BASE_URL}/assets`;
            const method = selectedAsset ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Asset Saved');
                fetchAssets();
                setView('list');
                setSelectedAsset(null);
                setFormData({ name: '', category: 'Infrastructure', location: '', purchaseDate: '', warrantyExpiry: '', amcExpiry: '', status: 'Operational' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete Asset?")) return;
        try {
            await fetch(`${API_BASE_URL}/assets/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAssets();
        } catch (error) { console.error(error); }
    };

    const handleAddService = async () => {
        if (!serviceLog.description || !serviceLog.cost) return alert("Fill details");
        try {
            const res = await fetch(`${API_BASE_URL}/assets/${selectedAsset._id}/service`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(serviceLog)
            });
            if (res.ok) {
                alert("Service Logged");
                const updated = await res.json();
                setSelectedAsset(updated); // Update local view
                setServiceLog({ description: '', cost: '', performedBy: '', date: new Date().toISOString().split('T')[0] });
                fetchAssets();
            }
        } catch (error) { console.error(error); }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Operational': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Under Maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Broken': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Wrench className="text-indigo-600 dark:text-indigo-400" /> Asset Registry
                </h1>
                {view === 'list' && (
                    <button onClick={() => { setView('add'); setSelectedAsset(null); }} className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-indigo-700 dark:hover:bg-indigo-600 transition">
                        <Plus size={18} /> Add Asset
                    </button>
                )}
                {view !== 'list' && (
                    <button onClick={() => setView('list')} className="text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-white">
                        Back to List
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === 'list' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assets.map(asset => (
                            <div key={asset._id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group" onClick={() => { setSelectedAsset(asset); setView('details'); }}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`px-2 py-1 rounded-lg text-xs font-bold border ${getStatusColor(asset.status).replace('bg-slate-100', 'bg-slate-100 dark:bg-slate-700').replace('text-slate-600', 'text-slate-600 dark:text-slate-300').replace('border-slate-200', 'border-slate-200 dark:border-slate-600')}`}>
                                        {asset.status}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(asset._id); }} className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 rounded"><Trash2 size={16} /></button>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{asset.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">{asset.category} • {asset.location}</p>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1"><Activity size={12} /> Services: {asset.serviceHistory?.length || 0}</div>
                                    {asset.amcExpiry && <div className={`flex items-center gap-1 ${new Date(asset.amcExpiry) < new Date() ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>AMC: {new Date(asset.amcExpiry).toLocaleDateString()}</div>}
                                </div>
                            </div>
                        ))}
                        {assets.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-500">No assets recorded yet.</div>}
                    </motion.div>
                )}

                {(view === 'add' || view === 'edit') && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow border border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">{selectedAsset ? 'Edit Asset' : 'New Asset Registration'}</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Asset Name</label>
                                    <input className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Generator A" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                                    <select className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option>Infrastructure</option>
                                        <option>Electronics</option>
                                        <option>Mechanical</option>
                                        <option>Plumbing</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Location</label>
                                <input className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Block A Terrace" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Purchase Date</label><input type="date" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value={formData.purchaseDate ? formData.purchaseDate.split('T')[0] : ''} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Warranty Exp</label><input type="date" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value={formData.warrantyExpiry ? formData.warrantyExpiry.split('T')[0] : ''} onChange={e => setFormData({ ...formData, warrantyExpiry: e.target.value })} /></div>
                                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">AMC Expiry</label><input type="date" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value={formData.amcExpiry ? formData.amcExpiry.split('T')[0] : ''} onChange={e => setFormData({ ...formData, amcExpiry: e.target.value })} /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
                                <div className="flex gap-2">
                                    {['Operational', 'Under Maintenance', 'Broken', 'Retired'].map(s => (
                                        <button key={s} onClick={() => setFormData({ ...formData, status: s })} className={`px-3 py-1 rounded-lg text-xs font-bold border ${formData.status === s ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{s}</button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleSave} className="w-full py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-xl mt-4 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition">Save Asset Record</button>
                        </div>
                    </motion.div>
                )}

                {view === 'details' && selectedAsset && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Asset Header */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedAsset.name}</h2>
                                        <p className="text-slate-500 dark:text-slate-400">{selectedAsset.category} • {selectedAsset.location}</p>
                                    </div>
                                    <button onClick={() => { setFormData(selectedAsset); setView('edit'); }} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">Edit Details</button>
                                </div>
                                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Status</p>
                                        <p className={`font-bold ${selectedAsset.status === 'Operational' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>{selectedAsset.status}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                        <p className="text-xs text-slate-400 uppercase font-bold">AMC Expiry</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{selectedAsset.amcExpiry ? new Date(selectedAsset.amcExpiry).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Total Spent</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">₹{selectedAsset.serviceHistory?.reduce((acc, curr) => acc + (curr.cost || 0), 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Service History */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><FileText size={18} /> Service History</h3>
                                <div className="space-y-4">
                                    {selectedAsset.serviceHistory?.length > 0 ? selectedAsset.serviceHistory.map((log, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 border-b border-slate-50 dark:border-slate-700 last:border-0">
                                            <div>
                                                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{log.description}</p>
                                                <p className="text-xs text-slate-400">{new Date(log.date).toLocaleDateString()} • by {log.performedBy}</p>
                                            </div>
                                            <span className="font-bold text-slate-800 dark:text-white">₹{log.cost}</span>
                                        </div>
                                    )) : <p className="text-slate-400 text-sm italic">No service history recorded.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Add Service Log Sidebar */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Log Maintenance/Service</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">Issue/Service Description</label>
                                    <textarea className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white" rows="3" value={serviceLog.description} onChange={e => setServiceLog({ ...serviceLog, description: e.target.value })} placeholder="e.g. Oil Change" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">Cost (₹)</label>
                                    <input type="number" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value={serviceLog.cost} onChange={e => setServiceLog({ ...serviceLog, cost: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 block mb-1">Performed By</label>
                                    <input className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value={serviceLog.performedBy} onChange={e => setServiceLog({ ...serviceLog, performedBy: e.target.value })} placeholder="Vendor/Technician Name" />
                                </div>
                                <div className="pt-2">
                                    <button onClick={handleAddService} className="w-full py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg font-bold text-sm hover:bg-slate-900 dark:hover:bg-slate-600">Add Log</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AssetManagement;
