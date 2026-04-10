import React, { useState } from 'react';
import { Users, Star, Clock, CreditCard, ChevronRight, CheckCircle, MessageSquare } from 'lucide-react';

const DailyHelpTab = () => {
    const [staffList, setStaffList] = useState([
        { id: 1, name: 'Anita Devi', role: 'Maid/Housekeeping', rating: 4.8, status: 'Checked In', time: '08:15 AM', salary: 4500, paid: false },
        { id: 2, name: 'Ramesh Kumar', role: 'Driver', rating: 4.5, status: 'Away', time: 'Yesterday', salary: 12000, paid: true },
        { id: 3, name: 'Sunita', role: 'Cook', rating: 4.9, status: 'Checked In', time: '07:30 AM', salary: 5000, paid: false },
    ]);

    const handlePayment = (id) => {
        setStaffList(prev => prev.map(s => s.id === id ? { ...s, paid: true } : s));
        alert('Digital Payment Successful!');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500 pb-20">
            {/* Header Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter">My Daily Help</h2>
                <p className="text-white/80 font-bold text-sm tracking-wide">Manage your household staff and payments</p>
                
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Currently Inside</p>
                        <p className="text-2xl font-black">{staffList.filter(s => s.status === 'Checked In').length} Staff</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Monthly Payout</p>
                        <p className="text-2xl font-black">₹{staffList.reduce((acc, s) => acc + s.salary, 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Staff List */}
            <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-800 dark:text-white px-2 tracking-tight">Active Household Staff</h3>
                {staffList.map((staff) => (
                    <div key={staff.id} className="bg-white dark:bg-slate-800 rounded-[30px] p-6 shadow-sm border border-slate-100 dark:border-slate-700 group hover:shadow-xl transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-xl uppercase italic">
                                        {staff.name[0]}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 ${staff.status === 'Checked In' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-slate-800 dark:text-white leading-none mb-1">{staff.name}</h4>
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{staff.role}</p>
                                    <div className="flex items-center gap-1 mt-1.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={10} className={s <= Math.floor(staff.rating) ? "fill-orange-400 text-orange-400" : "text-slate-200 dark:text-slate-700"} />
                                        ))}
                                        <span className="text-[10px] font-black text-slate-400 ml-1">{staff.rating}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${staff.status === 'Checked In' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {staff.status}
                                </span>
                                <p className="text-[9px] font-bold text-slate-400 mt-1 flex items-center justify-end gap-1">
                                    <Clock size={8} /> {staff.time}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50 dark:border-slate-700">
                            <button className="flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs font-black text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors uppercase tracking-widest">
                                <MessageSquare size={14} /> Review
                            </button>
                            {staff.paid ? (
                                <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle size={14} /> Salary Paid
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handlePayment(staff.id)}
                                    className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                                >
                                    <CreditCard size={14} /> Pay Salary
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Tips */}
            <div className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-[30px] border border-orange-100 dark:border-orange-900/20">
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-orange-200 dark:bg-orange-900/30 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                        <Users size={20} />
                    </div>
                    <div>
                        <h4 className="font-black text-orange-800 dark:text-orange-400 text-sm italic uppercase">Safety Tip</h4>
                        <p className="text-xs text-orange-600/80 font-bold leading-relaxed">Always check the rating and feedback of daily help before hiring. Verified staff will have a blue badge.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyHelpTab;
