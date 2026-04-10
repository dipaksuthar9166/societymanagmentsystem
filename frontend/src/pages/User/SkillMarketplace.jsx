import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Search, MapPin, UserCheck, Star, Clock, Filter, Plus, MessageSquare } from 'lucide-react';

const SkillMarketplace = () => {
    const { user } = useAuth();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSkill, setNewSkill] = useState({
        title: '', description: '', category: 'Household Service', hourlyRate: 0, availability: ''
    });

    const categories = ['All', 'Education', 'Food & Catering', 'Wellness & Fitness', 'Household Service', 'Tech Support', 'Arts & Craft'];

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/features/skills`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) setSkills(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/features/skills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify(newSkill)
            });
            if (res.ok) {
                alert('Skill listed successfully! Pending Admin Approval.');
                setShowAddModal(false);
                fetchSkills(); // Refresh or wait for approval
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredSkills = skills.filter(skill =>
        (selectedCategory === 'All' || skill.category === selectedCategory) &&
        (skill.title.toLowerCase().includes(searchTerm.toLowerCase()) || skill.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Community Skills</h2>
                    <p className="text-slate-500 font-medium">Discover talents within your society neighbors.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                    <Plus size={18} /> List My Skill
                </button>
            </div>

            {/* Search & Filter Strip */}
            <div className="space-y-4">
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 text-indigo-600 rounded-xl transition-colors group-focus-within:bg-indigo-600 group-focus-within:text-white">
                        <Search size={18} />
                    </div>
                    <input
                        className="w-full pl-16 p-5 bg-white border border-slate-100 rounded-[25px] font-bold text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm placeholder:text-slate-300"
                        placeholder="Search talents, tutors, chefs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none px-1">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)} 
                            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="p-20 text-center text-slate-400">Loading Community talents...</div>
            ) : filteredSkills.length === 0 ? (
                <div className="p-20 text-center text-slate-400 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                    No skills found. Be the first to list one!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {filteredSkills.map(skill => (
                        <div key={skill._id} className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl group hover:border-indigo-200 active:scale-[0.98] transition-all duration-300">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white">
                                            {skill.user?.name?.[0]}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 tracking-tight leading-none mb-1">{skill.user?.name}</h4>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg w-fit">
                                            <MapPin size={10} className="text-slate-400" />
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Flat {skill.user?.flatNo}</p>
                                        </div>
                                    </div>
                                </div>
                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{skill.category}</span>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-black text-xl text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tighter italic">{skill.title}</h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-3 bg-slate-50/50 p-4 rounded-[20px]">{skill.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50 px-2 mt-4">
                                <div className="flex items-center gap-1.5 text-amber-500">
                                    <Star size={16} fill="currentColor" /> 
                                    <span className="text-sm font-black italic">{skill.averageRating || '4.9'}</span>
                                    <span className="text-[9px] text-slate-300 font-bold">(12 Reviews)</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{skill.hourlyRate}<span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">/hr</span></p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('startChat', { detail: skill.user }));
                                }}
                                className="w-full mt-6 py-4.5 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-all hover:scale-[1.02]"
                            >
                                <MessageSquare size={16} /> Contact Neighbor
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-black text-slate-800 mb-4">List Your Service</h3>
                        <form onSubmit={handleAddSkill} className="space-y-4">
                            <input
                                required placeholder="Skill Title (e.g. Math Tutor)"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                value={newSkill.title} onChange={e => setNewSkill({ ...newSkill, title: e.target.value })}
                            />
                            <select
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                value={newSkill.category} onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}
                            >
                                {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <textarea
                                required placeholder="Describe your experience..." rows="3"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                value={newSkill.description} onChange={e => setNewSkill({ ...newSkill, description: e.target.value })}
                            ></textarea>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number" required placeholder="Rate (₹)"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    value={newSkill.hourlyRate} onChange={e => setNewSkill({ ...newSkill, hourlyRate: e.target.value })}
                                />
                                <input
                                    placeholder="Availability (e.g. 6PM-8PM)"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    value={newSkill.availability} onChange={e => setNewSkill({ ...newSkill, availability: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Submit Listing</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillMarketplace;
