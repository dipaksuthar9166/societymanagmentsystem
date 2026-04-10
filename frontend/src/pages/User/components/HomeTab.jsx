import React from 'react';
import { BadgeIndianRupee, Home, Megaphone, ChevronRight, Phone, MessageCircle, Shield } from 'lucide-react';

const HomeTab = ({ user, invoices, myFlat, notices, committee }) => {
    // Calculate Total Due
    const totalDue = invoices
        .filter(inv => inv.status !== 'Paid')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const latestNotice = notices && notices.length > 0 ? notices[0] : null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. High-Contrast Status Cards */}
            <div className="flex flex-col gap-4">
                {/* Due Balance Card */}
                <div className={`p-8 rounded-[40px] shadow-2xl relative overflow-hidden transition-all ${totalDue > 0 ? 'bg-slate-900' : 'bg-emerald-600'}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <BadgeIndianRupee size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">Financial Summary</span>
                            <div className={`w-2 h-2 rounded-full ${totalDue > 0 ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-white'}`} />
                        </div>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Total Outstanding</p>
                        <h3 className="text-4xl font-black tracking-tighter text-white mb-2 leading-none">
                            ₹{totalDue.toLocaleString()}
                        </h3>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{totalDue > 0 ? 'Immediate action required' : 'Verified • All dues cleared'}</p>
                    </div>
                </div>

                {/* Unit Details Card */}
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Home size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">My Residence</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">
                                {myFlat ? `${myFlat.block} - ${myFlat.flatNo}` : 'Unassigned'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded italic">{myFlat?.floor || '0'} Floor</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.familyMembers || 1} Registered</span>
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="text-slate-200 group-hover:text-blue-600 transition-colors" />
                </div>
            </div>

            {/* 2. Elevated Notice Board */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] italic">Bulletins</h4>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">{notices?.length || 0} New</span>
                </div>

                {latestNotice ? (
                    <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-50 relative overflow-hidden group">
                        <div className="absolute top-4 right-4 text-slate-200 opacity-20 group-hover:rotate-12 transition-transform"><Megaphone size={40} /></div>
                        <div className="relative z-10">
                            <h5 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-2 uppercase italic">{latestNotice.title}</h5>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed pr-8">{latestNotice.content}</p>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Published {new Date(latestNotice.createdAt).toLocaleDateString()}</span>
                                <span className="text-blue-600">Verified Notice</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-[30px] border border-dashed border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Bulletin board idle</p>
                    </div>
                )}
            </div>

            {/* 3. Redesigned Committee Directory */}
            <div className="space-y-6 pb-10">
                <div className="flex items-center justify-between px-4">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] italic">Governance</h4>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Committee Directory</span>
                </div>

                <div className="space-y-4">
                    {committee && committee.length > 0 ? (
                        committee.map(member => (
                            <div key={member._id} className="bg-white p-6 rounded-[35px] border border-slate-100 flex items-center justify-between shadow-xl shadow-slate-200/50 group active:scale-[0.98] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xl border-4 border-white shadow-xl">
                                        {member.name[0]}
                                    </div>
                                    <div>
                                        <h5 className="font-black text-slate-900 tracking-tighter leading-none mb-1">{member.name}</h5>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{member.designation}</p>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-lg w-fit">
                                            <Shield size={10} className="text-slate-400" />
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{member.memberPortfolio || 'Core Committee'}</p>
                                        </div>
                                    </div>
                                </div>
                                {member.contactNumber && (
                                    <div className="flex gap-2">
                                        <a href={`tel:${member.contactNumber}`} className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90">
                                            <Phone size={18} />
                                        </a>
                                        <a href={`https://wa.me/${member.contactNumber}`} target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90">
                                            <MessageCircle size={18} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-[40px] border-4 border-dashed border-white">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Contact management for details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                    <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Coming Soon</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Book Amenities</span>
                </button>
                <button className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                    <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Support</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Emergency Contacts</span>
                </button>
            </div>
        </div>
    );
};

export default HomeTab;
