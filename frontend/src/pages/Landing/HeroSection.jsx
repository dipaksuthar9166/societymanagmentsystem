import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Building, ShieldCheck, CreditCard, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const HeroSection = () => {
    const [activeTab, setActiveTab] = useState('Manage');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedCity, setSelectedCity] = useState('Bangalore');
    const [propertyType, setPropertyType] = useState('Residential');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const tabs = [
        { id: 'Manage', icon: Building, label: 'Manage' },
        { id: 'Pay', icon: CreditCard, label: 'Pay Maintenance' },
        { id: 'Security', icon: ShieldCheck, label: 'Security' },
    ];

    // REAL-TIME BACKEND SEARCH
    useEffect(() => {
        const fetchSocieties = async () => {
            if (searchQuery.trim().length > 1) {
                setLoading(true);
                try {
                    const res = await axios.get(`http://localhost:5000/api/public/search?q=${searchQuery}`);
                    setSuggestions(res.data);
                } catch (err) {
                    console.error("Search API Error:", err);
                }
                setLoading(false);
            } else {
                setSuggestions([]);
            }
        };

        const timer = setTimeout(fetchSocieties, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelect = (society) => {
        setSearchQuery(society.name);
        setSuggestions([]);
        // Direct navigate based on tab
        if (activeTab === 'Pay') {
            navigate(`/payment?societyId=${society._id}`);
        } else if (activeTab === 'Security') {
            navigate(`/gatekeeper?societyId=${society._id}`);
        } else {
            navigate(`/society/${society._id}`);
        }
    };

    return (
        <section className="relative pt-24 pb-20 md:pt-40 md:pb-32 bg-[#F8F9FA] font-['Outfit'] overflow-visible">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-3xl md:text-5xl font-black text-[#464646] mb-12">
                    India's Most Trusted <span className="text-[#FD3752]">Society App</span>
                </h1>

                {/* Tabs */}
                <div className="flex justify-center gap-10 md:gap-16 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 text-lg font-bold transition-all relative ${activeTab === tab.id ? 'text-[#464646]' : 'text-slate-400'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#FD3752] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Search Engine */}
                <div className="max-w-4xl mx-auto relative z-[100]">
                    <div className="bg-white rounded-xl shadow-2xl p-1 flex flex-col md:flex-row items-center border border-slate-100">
                        {/* City */}
                        <div className="px-6 py-4 flex items-center gap-2 border-b md:border-b-0 md:border-r border-slate-100 w-full md:w-56 cursor-pointer">
                            <span className="font-bold text-[#464646]">{selectedCity}</span>
                            <ChevronDown size={16} className="text-slate-400" />
                        </div>

                        {/* Input */}
                        <div className="flex-1 w-full relative">
                            <input
                                type="text"
                                placeholder={`Search for your Society or Apartment Name...`}
                                className="w-full px-6 py-5 text-lg font-medium outline-none text-[#464646]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            {/* BACKEND SUGGESTIONS DROPDOWN */}
                            {suggestions.length > 0 && (
                                <div className="absolute top-[105%] left-0 right-0 bg-white shadow-2xl rounded-2xl border border-slate-100 overflow-hidden text-left z-[200]">
                                    <div className="bg-slate-50 px-4 py-2 text-[10px] uppercase font-black text-slate-400 tracking-widest">Available Societies</div>
                                    {suggestions.map((s) => (
                                        <div 
                                            key={s._id}
                                            onClick={() => handleSelect(s)}
                                            className="px-6 py-4 hover:bg-red-50 cursor-pointer flex items-center justify-between group transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[#FD3752]"><Building size={20}/></div>
                                                <div>
                                                    <div className="font-bold text-[#464646] group-hover:text-[#FD3752]">{s.name}</div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10}/>{s.address || 'Verified Premium Society'}</div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-1 rounded-md uppercase">Active</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Search Button */}
                        <button className="bg-[#FD3752] text-white px-10 py-5 rounded-lg m-1 font-black shadow-lg shadow-red-200 active:scale-95 transition-all flex items-center gap-2">
                            <Search size={20} strokeWidth={3} /> Search
                        </button>
                    </div>

                    {/* Filter Checkboxes */}
                    <div className="flex justify-center gap-8 mt-8">
                        {['Residential', 'Commercial', 'PG/Hostel'].map((t) => (
                            <label key={t} className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${propertyType === t ? 'border-[#009688] bg-[#009688]' : 'border-slate-300'}`}>
                                    {propertyType === t && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <input type="radio" className="hidden" name="ptype" value={t} checked={propertyType === t} onChange={() => setPropertyType(t)} />
                                <span className={`font-bold text-sm ${propertyType === t ? 'text-[#009688]' : 'text-slate-500'}`}>{t}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
