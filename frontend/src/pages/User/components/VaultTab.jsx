import React from 'react';
import { Plus, FileText, Download } from 'lucide-react';

const VaultCard = ({ name, date }) => (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 group cursor-pointer shadow-sm">
        <div className="flex items-center gap-6">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all shadow-sm">
                <FileText size={28} />
            </div>
            <div>
                <h4 className="font-black text-slate-800 dark:text-white text-base italic uppercase">{name}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1 tracking-widest">{date}</p>
            </div>
        </div>
        <Download size={24} className="text-slate-200 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
    </div>
);

const VaultTab = () => (
    <div className="bg-white dark:bg-slate-800 p-12 rounded-[3.5rem] shadow-sm border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom duration-500 transition-colors">
        <div className="flex justify-between items-center mb-12">
            <div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Digitized Vault</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mt-2 tracking-[0.3em]">Encrypted Cloud Repository</p>
            </div>
            <button className="w-16 h-16 rounded-[1.5rem] bg-blue-600 text-white flex items-center justify-center hover:rotate-90 hover:rounded-full transition-all duration-500 shadow-xl shadow-blue-100 dark:shadow-none">
                <Plus size={32} />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <VaultCard name="Resident Rent Agreement" date="Expires: Jan 2025" />
            <VaultCard name="Permanent Identity Proof" date="Status: Verified" />
            <VaultCard name="Compliance Form #2024" date="Uploaded: Dec 2023" />
        </div>
    </div>
);

export default VaultTab;
