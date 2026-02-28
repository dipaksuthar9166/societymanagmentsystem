import React from 'react';
import { Info } from 'lucide-react';

const NoticesTab = ({ notices }) => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em] mb-8 pl-4 italic">Archived Society Directives</h3>
        {notices.map(notice => (
            <div key={notice._id} className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-700 flex gap-8 group hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-[1.5rem] border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0 shadow-sm shadow-blue-100 dark:shadow-none transition-colors">
                    <Info size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black bg-blue-600 text-white px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-blue-100 dark:shadow-none">Authorized Notice</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">{notice.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-base mt-3 leading-relaxed">{notice.content}</p>
                </div>
            </div>
        ))}
        {notices.length === 0 && <p className="text-center text-slate-400 dark:text-slate-500 italic py-10">Historical board is empty.</p>}
    </div>
);

export default NoticesTab;
