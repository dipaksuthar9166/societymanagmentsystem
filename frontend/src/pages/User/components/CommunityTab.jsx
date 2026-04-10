import React from 'react';
import { Vote, Users } from 'lucide-react';

const WorkerItem = ({ name, role, status }) => (
    <div className="flex items-center justify-between p-5 bg-white rounded-[25px] border border-slate-50 shadow-sm transition-all active:scale-[0.98]">
        <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                {name[0]}
             </div>
             <div>
                <div className="text-sm font-black text-slate-800 leading-none mb-1">{name}</div>
                <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{role}</div>
             </div>
        </div>
        <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-2 transition-colors ${status === 'On Post' || status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            {status}
        </span>
    </div>
);

const CommunityTab = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-slate-900 p-10 rounded-[45px] text-white relative overflow-hidden group shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/30 rounded-full blur-[80px] -mr-32 -mt-32 anim-pulse"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-900/50">
                        <Vote size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 italic">Resident Polling</span>
                </div>
                <h3 className="text-3xl font-black italic tracking-tighter mb-4 leading-none uppercase">
                   Clubhouse
                   <br />
                   Renovation
                </h3>
                <p className="text-slate-400 text-xs font-medium mb-8 leading-relaxed italic max-w-[200px]">
                    "Cast your ballot on the preferred design for the upcoming phase 2 transition."
                </p>
                <div className="flex gap-4">
                    <button className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all">VOICE OPINION</button>
                    <button className="bg-white/10 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 active:scale-95 transition-all">LOGS</button>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] italic">Deployment Status</h4>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-slate-500 uppercase">Live Trace</span>
                </div>
            </div>
            
            <div className="space-y-3">
                <WorkerItem name="Ravi Kumar" role="Field Security" status="On Post" />
                <WorkerItem name="Sunita Devi" role="Operations" status="Active" />
                <WorkerItem name="Pankaj Mehta" role="Technical Crew" status="Standby" />
            </div>
        </div>

        <div className="p-8 bg-indigo-600 rounded-[40px] shadow-2xl shadow-indigo-100 text-white relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-125 transition-all duration-700 font-black text-9xl italic">APP</div>
            <div className="relative z-10">
                <h4 className="text-xl font-black italic tracking-tight mb-2 uppercase">Gate Protocol</h4>
                <p className="text-indigo-100 text-[10px] font-medium mb-6 leading-relaxed opacity-80 uppercase tracking-widest pr-12">Authorized visitor clearance for unhindered main-gate access via encrypted passcodes.</p>
                <button className="w-full bg-slate-900 text-white py-5 rounded-[22px] font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all">GENERATE PASSCODE</button>
            </div>
        </div>
    </div>
);

export default CommunityTab;
