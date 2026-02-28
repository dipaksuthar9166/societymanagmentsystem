import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [message, setMessage] = useState('');

    const token = JSON.parse(localStorage.getItem('user'))?.token;

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/superadmin/admins`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setAdmins(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing
            ? `${API_BASE_URL}/superadmin/admins/${currentId}`
            : `${API_BASE_URL}/superadmin/admins`;

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(isEditing ? 'Admin updated!' : 'Admin created!');
                setFormData({ name: '', email: '', password: '' });
                setIsEditing(false);
                setCurrentId(null);
                fetchAdmins();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(data.message || 'Error occurred');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this admin?')) {
            try {
                await fetch(`${API_BASE_URL}/superadmin/admins/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchAdmins();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleEdit = (admin) => {
        setFormData({ name: admin.name, email: admin.email, password: '' });
        setIsEditing(true);
        setCurrentId(admin._id);
    };

    const toggleStatus = async (admin) => {
        const newStatus = admin.status === 'inactive' ? 'active' : 'inactive';
        if (window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this admin?`)) {
            try {
                const res = await fetch(`${API_BASE_URL}/superadmin/admins/${admin._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                });

                if (res.ok) {
                    setMessage(`Admin ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
                    fetchAdmins();
                    setTimeout(() => setMessage(''), 3000);
                } else {
                    setMessage('Failed to update status');
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">Admin Management</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Control access and permissions for administrative staff.</p>
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 font-bold ${message.includes('Error') || message.includes('Failed') ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
                        {message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="mb-10 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Full Name"
                            required
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Email Address"
                            required
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                            placeholder={isEditing ? 'Leave blank to keep current' : 'Required'}
                            required={!isEditing}
                        />
                    </div>
                    <div className="col-span-1">
                        <button type="submit" className="w-full p-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                            {isEditing ? 'Update Admin' : 'Add Admin'}
                        </button>
                    </div>
                </form>

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                            {admins.map((admin) => (
                                <tr key={admin._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 dark:text-white">{admin.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{admin.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                            Admin
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wide ${admin.status === 'inactive' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
                                            {admin.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium space-x-3">
                                        <button onClick={() => handleEdit(admin)} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-bold transition-colors">Edit</button>
                                        <button onClick={() => toggleStatus(admin)} className={`font-bold transition-colors ${admin.status === 'inactive' ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-900' : 'text-amber-600 dark:text-amber-400 hover:text-amber-900'}`}>
                                            {admin.status === 'inactive' ? 'Activate' : 'Deactivate'}
                                        </button>
                                        <button onClick={() => handleDelete(admin._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-bold transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {admins.length === 0 && <div className="p-10 text-center text-slate-400 dark:text-slate-500 font-bold">No admins found.</div>}
                </div>
            </div>
        </div>
    );
};

export default ManageAdmins;
