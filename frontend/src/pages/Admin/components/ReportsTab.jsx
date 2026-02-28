import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';

const ReportsTab = ({ token }) => {
    return (
        <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Reports & Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow dark:shadow-none dark:border dark:border-slate-700 transition-colors">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">Financial Overview</h3>
                    <p className="text-slate-500 dark:text-slate-400">Coming Soon</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow dark:shadow-none dark:border dark:border-slate-700 transition-colors">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">Defaulter Report</h3>
                    <p className="text-slate-500 dark:text-slate-400">Coming Soon</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow dark:shadow-none dark:border dark:border-slate-700 transition-colors">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">Audit Logs</h3>
                    <p className="text-slate-500 dark:text-slate-400">Coming Soon</p>
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;
