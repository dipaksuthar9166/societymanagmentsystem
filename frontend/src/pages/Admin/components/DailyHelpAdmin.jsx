import React, { useState, useEffect } from 'react';
import { Users, Search, Star, MessageSquare, ShieldCheck, ShieldAlert, Trash2, Filter, UserCheck, CreditCard, Clock } from 'lucide-react';
import { API_BASE_URL } from '../../../config';

const DailyHelpAdmin = ({ token }) => {
    const [staff, setStaff] = useState([
        { id: 1, name: 'Anita Devi', role: 'Maid/Housekeeping', rating: 4.8, status: 'Checked In', flatCount: 8, mobile: '9876543210', verified: true },
        { id: 2, name: 'Ramesh Kumar', role: 'Driver', rating: 4.5, status: 'Away', flatCount: 2, mobile: '9876543211', verified: true },
        { id: 3, name: 'Sunita', role: 'Cook', rating: 4.9, status: 'Checked In', flatCount: 5, mobile: '9876543212', verified: false },
        { id: 4, name: 'Rajesh', role: 'Driver', rating: 4.2, status: 'Away', flatCount: 1, mobile: '9876543213', verified: true },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    const toggleVerification = (id) => {
        setStaff(prev => prev.map(s => s.id === id ? { ...s, verified: !s.verified } : s));
    };

    const filteredStaff = staff.filter(s => 
        (filter === 'All' || s.role.includes(filter)) &&
        (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.mobile.includes(searchTerm))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Daily Help Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">Monitor and verify household staff across the society</p>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold border border-emerald-100 dark:border-emerald-900/30">
                        {staff.filter(s => s.status === 'Checked In').length} Staff Inside
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search by name or mobile..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 self-start md:self-center overflow-x-auto pb-1 w-full md:w-auto">
                    {['All', 'Maid', 'Driver', 'Cook'].map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((person) => (
                    <div key={person.id} className="bg-white dark:bg-slate-800 rounded-[30px] p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                        
                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl italic">
                                        {person.name[0]}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 ${person.status === 'Checked In' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 dark:text-white leading-tight flex items-center gap-2">
                                        {person.name}
                                        {person.verified && <ShieldCheck size={14} className="text-emerald-500" />}
                                    </h4>
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{person.role}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star size={10} className="fill-orange-400 text-orange-400" />
                                        <span className="text-[10px] font-black text-slate-400">{person.rating} / 5</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 relative z-10">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-slate-400 uppercase tracking-widest">Mobile</span>
                                <span className="text-slate-800 dark:text-slate-200">{person.mobile}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-slate-400 uppercase tracking-widest">Works in</span>
                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">{person.flatCount} Flats</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-slate-400 uppercase tracking-widest">Status</span>
                                <span className={`${person.status === 'Checked In' ? 'text-emerald-500' : 'text-slate-400'} flex items-center gap-1`}>
                                    <Clock size={12} /> {person.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-slate-50 dark:border-slate-700 relative z-10">
                            <button 
                                onClick={() => toggleVerification(person.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${person.verified ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {person.verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                {person.verified ? 'Verified' : 'Unverified'}
                            </button>
                            <button className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Verification Request Banner */}
            <div className="bg-gradient-to-r from-orange-400 to-rose-500 rounded-[30px] p-6 text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12"><UserCheck size={80} /></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter italic">Pending Verifications</h3>
                        <p className="text-sm font-bold opacity-90">3 new staff members are waiting for background check approval.</p>
                    </div>
                    <button className="px-8 py-3 bg-white text-orange-500 font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">Review Now</button>
                </div>
            </div>
        </div>
    );
};

export default DailyHelpAdmin;
