import React from 'react';
import { Info } from 'lucide-react';

const NoticesTab = ({ notices }) => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="px-2 flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Society Board</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">{notices.length} Notices</span>
        </div>
        
        {notices.map(notice => (
            <div key={notice._id} className="bg-white p-6 rounded-[35px] shadow-xl border border-slate-100 flex flex-col gap-6 active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                            <Info size={24} />
                        </div>
                        <div>
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-2 py-0.5 rounded">Resident Notice</span>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none mt-1">{notice.title}</h4>
                        </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="bg-slate-50/80 p-5 rounded-[25px] border border-slate-50 relative">
                    <div className="absolute top-4 right-4 text-slate-200 opacity-20"><Info size={40} /></div>
                    <p className="text-slate-600 font-medium text-sm leading-relaxed relative z-10">{notice.content}</p>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500`}>U</div>
                        ))}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seen by 12 residents</span>
                </div>
            </div>
        ))}
        {notices.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[50px] border-4 border-dashed border-slate-50">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Info size={48} className="text-slate-200" />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Informational Board is Clear</p>
            </div>
        )}
    </div>
);

export default NoticesTab;
