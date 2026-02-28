import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { Check, X, Search, Star, User } from 'lucide-react';
import { useToast } from '../../components/ToastProvider';

const SkillAdmin = ({ token }) => {
    const [pendingSkills, setPendingSkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]); // Optional: to view Approved lists too
    const [loading, setLoading] = useState(true);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            // Fetch Pending
            const pRes = await fetch(`${API_BASE_URL}/features/skills/admin/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Fetch All (Public endpoint reused or filtered)
            const aRes = await fetch(`${API_BASE_URL}/features/skills`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (pRes.ok) setPendingSkills(await pRes.json());
            if (aRes.ok) setAllSkills(await aRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const res = await fetch(`${API_BASE_URL}/features/skills/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                showSuccess('Status Updated', `Skill marked as ${status}`);
                fetchSkills();
            }
        } catch (error) {
            showError('Update Failed', 'Could not update status');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Pending Approvals Section */}
            <div>
                <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-600 p-2 rounded-lg"><Star size={24} /></span>
                    Pending Approvals
                </h2>

                {loading ? <div className="text-slate-400">Loading...</div> : pendingSkills.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
                        No pending skill listings.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingSkills.map(skill => (
                            <div key={skill._id} className="bg-white border border-amber-100 shadow-sm rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                            {skill.user?.name?.[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{skill.user?.name}</h4>
                                            <p className="text-xs text-slate-500">{skill.user?.flatNo}</p>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{skill.title}</h3>
                                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded mb-3">{skill.category}</span>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-3 italic">"{skill.description}"</p>

                                    <div className="flex items-center justify-between text-sm font-bold text-slate-700 mb-6 bg-slate-50 p-3 rounded-xl">
                                        <span>Rate: ₹{skill.hourlyRate}/hr</span>
                                        <span>{skill.availability}</span>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleStatusUpdate(skill._id, 'Rejected')}
                                            className="flex-1 py-2 rounded-lg border border-red-100 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X size={16} /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(skill._id, 'Approved')}
                                            className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                                        >
                                            <Check size={16} /> Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Directory Section */}
            <div className="pt-8 border-t border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 text-slate-400">Active Directory ({allSkills.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-75 hover:opacity-100 transition-opacity">
                    {allSkills.map(skill => (
                        <div key={skill._id} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Check size={16} /></div>
                            <div className="overflow-hidden">
                                <h4 className="font-bold text-sm truncate">{skill.title}</h4>
                                <p className="text-xs text-slate-500 truncate">{skill.user?.name}</p>
                            </div>
                            <button
                                onClick={() => handleStatusUpdate(skill._id, 'Rejected')}
                                className="ml-auto text-slate-300 hover:text-red-500" title="Remove"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SkillAdmin;
