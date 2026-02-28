import React, { useState, useEffect } from 'react';
import { Truck, Phone, FileText, Check, Plus, X, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const VendorTab = ({ token }) => {
    const [vendors, setVendors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        name: '',
        serviceType: '',
        contactNumber: '',
        monthlyCost: '',
        status: 'Active'
    });

    const fetchVendors = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/committee/vendors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setVendors(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, [token]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/committee/vendors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchVendors();
                setIsModalOpen(false);
                setFormData({ name: '', serviceType: '', contactNumber: '', monthlyCost: '', status: 'Active' });
                alert('Vendor Added Successfully');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to add vendor (Secretaries only)');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Vendor Management</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={18} /> Add Vendor
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Service Provider</th>
                            <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Category</th>
                            <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Contact</th>
                            <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Monthly Cost</th>
                            <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
                            <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {vendors.map(vendor => (
                            <tr key={vendor._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <Truck size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-white">{vendor.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">{vendor.serviceType}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Phone size={14} /> {vendor.contactNumber}
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-400">₹{vendor.monthlyCost || 0}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${vendor.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                        }`}>
                                        {vendor.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm transition-colors">View Details</button>
                                </td>
                            </tr>
                        ))}
                        {vendors.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-400 dark:text-slate-500">No vendors found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Vendor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Add New Vendor</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Company Name</label>
                                <input
                                    type="text" required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Service Type</label>
                                <input
                                    type="text" required
                                    placeholder="e.g. Security, Plumbing"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                    value={formData.serviceType} onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Contact Number</label>
                                <input
                                    type="text" required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                    value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Monthly Cost</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                        value={formData.monthlyCost} onChange={e => setFormData({ ...formData, monthlyCost: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">Status</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
                                        value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Adding...' : 'Add Vendor'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorTab;
