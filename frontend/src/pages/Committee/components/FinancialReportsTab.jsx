import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';

const FinancialReportsTab = ({ invoices = [], expenses = [] }) => {

    // 1. Calculate Quick Stats
    const totalCollection = useMemo(() => {
        return invoices
            .filter(inv => inv.status === 'Paid')
            .reduce((acc, curr) => acc + curr.totalAmount, 0);
    }, [invoices]);

    const totalExpenses = useMemo(() => {
        return expenses.reduce((acc, curr) => acc + curr.amount, 0);
    }, [expenses]);

    const netBalance = totalCollection - totalExpenses;

    // 2. Aggregate Data for Charts
    const monthlyData = useMemo(() => {
        const data = {};
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Initialize last 6 months
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${months[d.getMonth()]}`;
            data[key] = { name: key, income: 0, expense: 0, order: i };
        }

        // Aggregate Income
        invoices.forEach(inv => {
            if (inv.status === 'Paid') {
                const d = new Date(inv.updatedAt || inv.createdAt); // Use payment date if available
                const key = months[d.getMonth()];
                if (data[key]) data[key].income += inv.totalAmount;
            }
        });

        // Aggregate Expenses
        expenses.forEach(exp => {
            const d = new Date(exp.date);
            const key = months[d.getMonth()];
            if (data[key]) data[key].expense += exp.amount;
        });

        return Object.values(data).sort((a, b) => b.order - a.order).reverse(); // Sort properly
    }, [invoices, expenses]);

    const incomeData = [
        { name: 'Maintenance', value: totalCollection * 0.8, color: '#4F46E5' }, // Mock ratio for demo if types not available
        { name: 'Penalty', value: totalCollection * 0.1, color: '#F59E0B' },
        { name: 'Others', value: totalCollection * 0.1, color: '#10B981' },
    ];
    // If invoice had "type", we would aggregate that. For now, simulated categorization.

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Reports</h2>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 transition-colors">
                        <Download size={18} /> Balance Sheet
                    </button>
                    <button className="flex items-center gap-2 bg-white text-slate-600 border px-4 py-2 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 transition-colors">
                        <Download size={18} /> Defaulter List
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-100 dark:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white">₹ {totalCollection.toLocaleString()}</div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total Collection (YTD)</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-100 dark:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white">₹ {totalExpenses.toLocaleString()}</div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total Expenses (YTD)</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-100 dark:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div className={`text-3xl font-bold ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        ₹ {Math.abs(netBalance).toLocaleString()}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Net Balance {netBalance < 0 && '(Deficit)'}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income Distribution */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-100 dark:border-slate-700 transition-colors">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Income vs Expense Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgb(31, 41, 55)', borderColor: 'rgb(55, 65, 81)', color: 'white' }}
                                    itemStyle={{ color: '#e5e7eb' }}
                                />
                                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                                <Bar dataKey="income" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Income" />
                                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Simulated Pie Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-100 dark:border-slate-700 transition-colors">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6">Income Sources</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={incomeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {incomeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgb(31, 41, 55)', borderColor: 'rgb(55, 65, 81)', color: 'white' }}
                                    itemStyle={{ color: '#e5e7eb' }}
                                />
                                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bank Integration Placeholder */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow border border-slate-100 dark:border-slate-700 transition-colors">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Bank Reconciliation</h3>
                    <button className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">Connect Bank Account</button>
                </div>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors">
                    <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 mb-2">Upload your Bank Statement (PDF/CSV) to automatically reconcile transactions.</p>
                    <button className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors">Upload Statement</button>
                </div>
            </div>
        </div>
    );
};

export default FinancialReportsTab;
