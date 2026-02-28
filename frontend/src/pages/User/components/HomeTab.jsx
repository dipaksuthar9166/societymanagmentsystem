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
            {/* 1. Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Due Balance Card */}
                <div className={`p-6 rounded-2xl border ${totalDue > 0 ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'} transition-all`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${totalDue > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                            <BadgeIndianRupee size={24} />
                        </div>
                        {totalDue > 0 && <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-[10px] font-bold text-red-500 dark:text-red-400 shadow-sm uppercase">Payment Due</span>}
                    </div>
                    <div>
                        <p className={`text-sm font-medium ${totalDue > 0 ? 'text-red-600/80 dark:text-red-400/80' : 'text-emerald-600/80 dark:text-emerald-400/80'}`}>Total Outstanding</p>
                        <h3 className={`text-3xl font-bold tracking-tight ${totalDue > 0 ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                            ₹{totalDue.toLocaleString()}
                        </h3>
                    </div>
                    {totalDue === 0 && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">You are all caught up!</p>}
                </div>

                {/* Unit Details Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <Home size={24} />
                        </div>
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase">{myFlat?.residencyType || 'Resident'}</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-400 dark:text-slate-400">My Residence</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {myFlat ? `${myFlat.block} - ${myFlat.flatNo}` : 'Unassigned'}
                        </h3>
                        <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>Floor: {myFlat?.floor || '-'}</span>
                            <span>•</span>
                            <span>Members: {user.familyMembers || 1}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Latest Notice Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Megaphone size={18} className="text-amber-500" /> Digital Notice Board
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">{notices?.length || 0} Recent</span>
                </div>

                {latestNotice ? (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-600 shadow-sm transition-colors">{latestNotice.title}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(latestNotice.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{latestNotice.content}</p>
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-300 dark:text-slate-500">
                        <p className="text-sm">No new notices posted.</p>
                    </div>
                )}
            </div>

            {/* 3. Committee Members Section */}
            <div>
                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                    <Shield size={18} className="text-blue-600 dark:text-blue-400" /> Your Committee
                </h4>

                {committee && committee.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {committee.map(member => (
                            <div key={member._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-all">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-600 overflow-hidden">
                                    {member.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-bold text-slate-800 dark:text-white truncate">{member.name}</h5>
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{member.designation}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{member.memberPortfolio || 'Committee Member'}</p>
                                </div>
                                {member.contactNumber && (
                                    <div className="flex gap-2">
                                        <a href={`tel:${member.contactNumber}`} className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                            <Phone size={16} />
                                        </a>
                                        <a href={`https://wa.me/${member.contactNumber}`} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                            <MessageCircle size={16} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-sm">
                        Committee information not available.
                    </div>
                )}
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
