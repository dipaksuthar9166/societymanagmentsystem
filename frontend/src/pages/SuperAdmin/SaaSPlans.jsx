import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Shield, Zap, Crown, UserPlus, Plus, Trash2, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const SaaSPlans = () => {
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        durationDays: 30,
        features: '',
        maxRooms: 50,
        isPopular: false
    });
    const [loading, setLoading] = useState(true);

    const fetchPlans = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/plans`);
            const data = await res.json();
            if (res.ok) setPlans(data);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                durationDays: Number(formData.durationDays),
                maxRooms: Number(formData.maxRooms),
                features: formData.features.split(',').map(f => f.trim())
            };

            const res = await fetch(`${API_BASE_URL}/plans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowForm(false);
                setFormData({ name: '', price: '', durationDays: 30, features: '', maxRooms: 50, isPopular: false });
                fetchPlans();
            } else {
                const errData = await res.json();
                alert('Failed to create plan: ' + (errData.message || res.statusText));
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const getIcon = (name) => {
        if (name.toLowerCase().includes('enterprise')) return Crown;
        if (name.toLowerCase().includes('pro')) return Zap;
        return Shield;
    };

    const getColor = (name) => {
        if (name.toLowerCase().includes('enterprise')) return 'bg-indigo-50 text-indigo-600';
        if (name.toLowerCase().includes('pro')) return 'bg-blue-50 text-blue-600';
        return 'bg-emerald-50 text-emerald-600';
    };

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Master Subscription Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Set global pricing, room quotas, and feature availability.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-blue-500 transition shadow-lg shadow-slate-200 dark:shadow-blue-900/20"
                >
                    <Plus size={20} /> Create New Plan
                </button>
            </div>

            {/* Create Plan Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-300 border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Create Subscription Plan</h3>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreatePlan} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Plan Name" required className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-700 outline-none font-bold text-slate-800 dark:text-white focus:border-blue-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                <input placeholder="Price (₹)" type="number" required className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-700 outline-none font-bold text-slate-800 dark:text-white focus:border-blue-500" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 ml-1">Duration (Days)</label>
                                    <input type="number" required className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-700 outline-none font-bold text-slate-800 dark:text-white focus:border-blue-500" value={formData.durationDays} onChange={e => setFormData({ ...formData, durationDays: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 ml-1">Max Rooms</label>
                                    <input type="number" required className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-700 outline-none font-bold text-slate-800 dark:text-white focus:border-blue-500" value={formData.maxRooms} onChange={e => setFormData({ ...formData, maxRooms: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 ml-1">Features (Comma separated)</label>
                                <textarea placeholder="e.g. 50 Rooms, Email Support, Basic Reports" className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-700 outline-none font-medium text-slate-800 dark:text-white h-24 resize-none focus:border-blue-500" value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })}></textarea>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="popular" checked={formData.isPopular} onChange={e => setFormData({ ...formData, isPopular: e.target.checked })} className="w-5 h-5 accent-blue-600 rounded" />
                                <label htmlFor="popular" className="font-bold text-slate-600 dark:text-slate-300">Mark as Most Popular</label>
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                                Launch Plan
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            {loading ? (
                <div className="text-center py-20 text-slate-400 dark:text-slate-500 animate-pulse font-bold">Loading Plans...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const Icon = getIcon(plan.name);
                        // Local color logic for dark mode support since helper is basic
                        let colorClasses = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
                        if (plan.name.toLowerCase().includes('enterprise')) colorClasses = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400';
                        if (plan.name.toLowerCase().includes('pro')) colorClasses = 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';

                        return (
                            <div key={plan._id} className={`relative bg-white dark:bg-slate-800 rounded-3xl p-8 border transition-all duration-300 hover:shadow-xl ${plan.isPopular ? 'border-blue-200 dark:border-blue-700 ring-4 ring-blue-50 dark:ring-blue-900/20' : 'border-slate-100 dark:border-slate-700'}`}>
                                {plan.isPopular && (
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                                        Most Popular
                                    </span>
                                )}

                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`${colorClasses} p-3 rounded-2xl`}>
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{plan.name}</h3>
                                </div>

                                <div className="mb-8">
                                    <span className="text-4xl font-extrabold text-slate-800 dark:text-white">₹{plan.price}</span>
                                    <span className="text-slate-500 dark:text-slate-400 font-medium ml-1">/ {plan.durationDays} days</span>
                                </div>

                                <ul className="space-y-4 mb-10 min-h-[160px]">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm font-medium">
                                            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400 rounded-full p-1">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.isPopular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/20' : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                    Edit Configuration
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Wallet & Gateway Settings Placeholder */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group border border-transparent dark:border-slate-700">
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 duration-500">
                    <CreditCard size={180} />
                </div>

                <div className="relative z-10 max-w-xl">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-blue-400">
                        <UserPlus />
                        Payment Gateway Integration
                    </h3>
                    <p className="text-slate-400 mb-6 font-medium leading-relaxed">
                        Connect Razorpay or Stripe to automate subscription renewals and society wallet top-ups. Basic plan users pay standard fees, while Enterprise users have negotiable rates.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors w-full sm:w-auto">Configure Gateway</button>
                        <button className="bg-white/10 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors w-full sm:w-auto">View Wallet Logs</button>
                    </div>
                </div>
            </div>

            {/* Invoices */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
                    <button className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="pb-3 pl-4">Invoice ID</th>
                                <th className="pb-3">Society</th>
                                <th className="pb-3">Date</th>
                                <th className="pb-3">Amount</th>
                                <th className="pb-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-slate-600 dark:text-slate-300 divide-y divide-slate-50 dark:divide-slate-700">
                            {/* Placeholder Mock Data - Replace with fetchLogic later */}
                            {[1, 2, 3].map(i => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="py-4 pl-4 font-mono text-slate-400 dark:text-slate-500 text-xs">#INV-2024-00{i}</td>
                                    <td className="py-4 font-bold text-slate-800 dark:text-white">Green Valley Co-op</td>
                                    <td className="py-4 text-slate-500 dark:text-slate-400">Oct 2{i}, 2024</td>
                                    <td className="py-4 font-bold text-slate-800 dark:text-white">₹2,499.00</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${i === 2 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
                                            {i === 2 ? 'Pending' : 'Paid'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SaaSPlans;
