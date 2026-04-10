import React from 'react';
import { Plus, FileText, Download } from 'lucide-react';

const VaultCard = ({ name, date }) => (
    <div className="p-6 bg-white rounded-[35px] border border-slate-100 flex items-center justify-between hover:border-indigo-200 active:scale-[0.98] transition-all shadow-xl shadow-slate-200/50 group cursor-pointer">
        <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <FileText size={28} />
            </div>
            <div>
                <h4 className="font-black text-slate-800 text-sm tracking-tight leading-none mb-1">{name}</h4>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{date}</p>
            </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
            <Download size={18} />
        </div>
    </div>
);

const VaultTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
        <div className="flex justify-between items-center px-2">
            <div>
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.3em] mb-1 italic">Personal Archives</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">Security Vault</h3>
            </div>
            <button className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all">
                <Plus size={24} />
            </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[40px] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group mb-4">
                <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-125 transition-all duration-700"><FileText size={200} /></div>
                <div className="relative z-10">
                    <h4 className="font-black text-lg tracking-tight mb-2 uppercase italic">Verified Resident Pass</h4>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Digital ID / QR Certified</p>
                    <div className="flex justify-between items-end">
                        <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">#### #### #### 9012</div>
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest">Verified</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-4">Managed Records</p>
               <VaultCard name="Rent Agreement v2.1" date="Expires 12 May 2025" />
               <VaultCard name="Identity Proof / Aadhaar" date="Verified System 1" />
               <VaultCard name="NOC - Unit Maintenance" date="Issued Dec 2023" />
            </div>
        </div>
    </div>
);

export default VaultTab;
