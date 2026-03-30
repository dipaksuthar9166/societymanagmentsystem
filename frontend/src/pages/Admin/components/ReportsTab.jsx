import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';
import { FileText, Download, TrendingUp, AlertTriangle, Users, DollarSign, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const ReportsTab = ({ token }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/analytics/overview`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const ReportCard = ({ title, desc, icon: Icon, color, onDownload }) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                <button 
                    onClick={onDownload}
                    className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    <Download size={20} />
                </button>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{desc}</p>
            <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">PDF • Excel • CSV</span>
                <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Generate Now</button>
            </div>
        </div>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Preparing Reports...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Reports Central</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Export your society's financial and activity data in multiple formats.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">Schedule Report</button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Bulk Export</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard 
                    title="Financial Statement" 
                    desc="Detailed overview of income, pending dues, and society expenses." 
                    icon={DollarSign} 
                    color="green" 
                />
                <ReportCard 
                    title="Defaulter Registry" 
                    desc="List of residents with overdue maintenance payments and arrears." 
                    icon={AlertTriangle} 
                    color="red" 
                />
                <ReportCard 
                    title="Resident Registry" 
                    desc="Complete database of all residents, flat owners, and tenants." 
                    icon={Users} 
                    color="blue" 
                />
                <ReportCard 
                    title="Maintainance Activity" 
                    desc="Log of all asset repairs, vendor services, and maintenance costs." 
                    icon={TrendingUp} 
                    color="purple" 
                />
                <ReportCard 
                    title="Audit History" 
                    desc="System logs of admin actions, login attempts, and broadcast history." 
                    icon={FileText} 
                    color="slate" 
                />
                <ReportCard 
                    title="Event Ledger" 
                    desc="Financial records for festivals, community events, and donations." 
                    icon={Calendar} 
                    color="amber" 
                />
            </div>
        </div>
    );
};

export default ReportsTab;
