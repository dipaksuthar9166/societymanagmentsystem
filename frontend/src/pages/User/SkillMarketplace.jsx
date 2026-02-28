import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Search, MapPin, UserCheck, Star, Clock, Filter, Plus } from 'lucide-react';

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

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input
                        className="w-full pl-12 p-3 bg-white border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Search for tutors, bakers, plumbers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSkills.map(skill => (
                        <div key={skill._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                        {skill.user?.name?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{skill.user?.name}</h4>
                                        <p className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 w-fit mt-0.5">{skill.user?.flatNo}</p>
                                    </div>
                                </div>
                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold">{skill.category}</span>
                            </div>

                            <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{skill.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{skill.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                    <Star size={14} fill="currentColor" /> {skill.averageRating || 'New'}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-bold uppercase">Starting From</p>
                                    <p className="text-slate-800 font-black">₹{skill.hourlyRate}<span className="text-xs text-slate-400 font-medium">/hr</span></p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('startChat', { detail: skill.user }));
                                }}
                                className="w-full mt-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                            >
                                Contact Provider
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
