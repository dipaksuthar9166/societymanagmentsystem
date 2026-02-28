import React, { useState, useEffect } from 'react';
import { Trash2, Wallet, Plus, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../../config';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '../../../components/ConfirmationModal';

const ExpensesTab = ({ token }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Others');
    const [deletingId, setDeletingId] = useState(null);

    const fetchExpenses = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/expenses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setExpenses(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleAdd = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ title, amount, category })
            });
            if (res.ok) {
                setTitle('');
                setAmount('');
                fetchExpenses();
            }
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/expenses/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setDeletingId(null);
                fetchExpenses();
            }
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchExpenses(); }, []);

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-8 italic">P&L Expense Tracker</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <input className="w-full bg-slate-50 border-none p-4 rounded-xl text-sm" placeholder="Expense Title (e.g. Guard Salary)" value={title} onChange={e => setTitle(e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                            <input className="w-full bg-slate-50 border-none p-4 rounded-xl text-sm" placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                            <select className="w-full bg-slate-50 border-none p-4 rounded-xl text-sm" value={category} onChange={e => setCategory(e.target.value)}>
                                <option>Cleaning</option>
                                <option>Security</option>
                                <option>Repairs</option>
                                <option>Staff Salary</option>
                                <option>Others</option>
                            </select>
                        </div>
                        <button onClick={handleAdd} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Plus size={18} /> Record Disbursement
                        </button>
                    </div>
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-white border border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                        <div className="text-indigo-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-4 flex items-center gap-2">
                            <Wallet size={12} /> Total Monthly Outflow
                        </div>
                        <div className="text-6xl font-black italic tracking-tighter text-white">₹{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500 mt-6 font-bold uppercase tracking-[0.2em] border border-slate-700 px-4 py-1.5 rounded-full">Audited & Verified</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
                    <div className="text-xs font-bold text-slate-400">{expenses.length} Total Logs</div>
                </div>
                <div className="space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {expenses.map(exp => (
                            <motion.div
                                key={exp._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700/50 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center font-black text-xs border border-red-100 dark:border-red-900/30">
                                        EXE
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{exp.title}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{exp.category} • {new Date(exp.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic">₹{exp.amount.toLocaleString()}</div>
                                    <button onClick={() => setDeletingId(exp._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><Trash2 size={18} /></button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {expenses.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No disbursements recorded this cycle</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={() => handleDelete(deletingId)}
                title="Remove Entry?"
                message="Are you sure you want to delete this expense record? This will affect your monthly outflow calculation."
                type="danger"
            />
        </div>
    );
};

export default ExpensesTab;
