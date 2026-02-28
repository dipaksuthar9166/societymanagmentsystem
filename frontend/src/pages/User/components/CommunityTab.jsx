import React from 'react';
import { Vote, Users } from 'lucide-react';

const WorkerItem = ({ name, role, status }) => (
    <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700 pb-5 last:border-0 last:pb-0 transition-colors">
        <div>
            <div className="text-base font-black text-slate-800 dark:text-white italic">{name}</div>
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">{role}</div>
        </div>
        <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border-2 transition-colors ${status === 'On Post' || status === 'Active' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/50 shadow-sm shadow-green-100 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700'}`}>
            {status}
        </span>
    </div>
);

const CommunityTab = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
        <div className="bg-slate-900 dark:bg-black p-12 rounded-[4rem] text-white relative overflow-hidden group shadow-2xl dark:shadow-none border border-transparent dark:border-slate-800 transition-colors">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
            <div className="relative z-10 max-w-xl">
                <h3 className="text-4xl font-black italic tracking-tighter mb-6 flex items-center gap-4">
                    <Vote size={40} className="text-blue-500" />
                    Resident Voice
                </h3>
                <p className="text-slate-400 text-base font-medium mb-10 leading-relaxed italic pr-12">
                    "Decide on the new recreational zone layout. Your contribution defines the community standard."
                </p>
                <div className="flex gap-6">
                    <button className="bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/40 dark:shadow-none hover:scale-105 transition-all">CAST BALLOT</button>
                    <button className="bg-white/5 text-slate-300 px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] border border-white/10 hover:bg-white/10 transition-all italic">Status Log</button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden transition-colors">
                <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.4em] mb-10 pl-2">Staff Operation Logs</h4>
                <div className="space-y-6">
                    <WorkerItem name="Ravi Kumar" role="Patrol Guard" status="On Post" />
                    <WorkerItem name="Sunita Devi" role="Sanitary Engineer" status="Active" />
                    <WorkerItem name="Pankaj M." role="Resident Electrician" status="Break" />
                </div>
            </div>
            <div className="bg-blue-600 dark:bg-blue-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-200 dark:shadow-none transition-colors">
                <h4 className="text-[10px] font-black uppercase text-blue-100 tracking-[0.4em] mb-6">Security Clearance</h4>
                <p className="text-blue-50/70 text-sm font-medium mb-10 leading-relaxed">Instantly authorize temporary digital clearance for visitors to ensure unhindered main-gate access.</p>
                <button className="w-full bg-white text-blue-600 dark:text-blue-700 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl dark:shadow-none hover:scale-105 transition-all">GENERATE PASS</button>
            </div>
        </div>
    </div>
);

export default CommunityTab;
