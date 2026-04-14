import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, Home, Building2, MapPin, Percent, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();
    const [searchTab, setSearchTab] = useState('rent');
    const [propertyType, setPropertyType] = useState('full-house');

    return (
        <section className="relative pt-32 pb-24 font-['Outfit']" style={{ background: 'radial-gradient(ellipse at top, #E8F0F8 0%, #FFFFFF 70%)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
                
                {/* Headlines */}
                <div className="text-center mb-8 w-full">
                    <h1 className="text-[32px] sm:text-[40px] font-bold text-[#464646] mb-4">
                        World's Largest Society Management Platform
                    </h1>
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFF3E0] rounded-full border border-orange-200">
                        <Truck size={16} className="text-orange-500" />
                        <span className="text-sm font-semibold text-[#464646]">Packers And Movers | </span>
                        <span className="text-sm font-semibold text-orange-600 flex items-center">Lowest Prices <Percent size={12} className="ml-0.5" /></span>
                    </div>
                </div>

                {/* Main Search Widget */}
                <div className="w-full max-w-[1000px] mt-2 mb-12">
                    {/* Tabs */}
                    <div className="flex items-center justify-center gap-8 mb-4">
                        {['Buy', 'Rent', 'Commercial'].map((tab) => {
                            const tabKey = tab.toLowerCase();
                            const isActive = searchTab === tabKey;
                            return (
                                <button
                                    key={tabKey}
                                    onClick={() => setSearchTab(tabKey)}
                                    className={`pb-2 px-2 text-lg font-semibold transition-colors relative ${isActive ? 'text-[#FD3752]' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {tab}
                                    {isActive && (
                                        <motion.div 
                                            layoutId="nobroker-tab"
                                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FD3752] rounded-t-sm"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Container */}
                    <div className="bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-200 p-2 sm:p-3">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            {/* City Dropdown */}
                            <button className="flex items-center justify-between w-full sm:w-48 px-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-md text-[#464646] hover:bg-slate-100 transition-colors">
                                <span className="font-semibold text-sm">Bangalore</span>
                                <ChevronDown size={16} className="text-slate-500" />
                            </button>

                            {/* Divider line in desktop */}
                            <div className="hidden sm:block w-px h-10 bg-slate-200 mx-1"></div>

                            {/* Search Input */}
                            <div className="flex-1 w-full relative group">
                                <input 
                                    type="text" 
                                    placeholder="Search upto 3 localities or landmarks"
                                    className="w-full h-full px-4 py-3 sm:py-3.5 text-[15px] text-[#464646] bg-transparent focus:outline-none placeholder-slate-400 font-medium"
                                />
                            </div>

                            {/* Search Button */}
                            <button className="w-full sm:w-auto bg-[#FD3752] hover:bg-[#e02d45] text-white px-8 py-3.5 rounded-md font-bold text-[15px] flex items-center justify-center gap-2 transition-colors shadow-sm">
                                <Search size={18} strokeWidth={2.5} />
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Bottom Options Row */}
                    {searchTab === 'rent' && (
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-5 px-2">
                            <div className="flex items-center gap-6 mb-4 sm:mb-0">
                                {[
                                    { id: 'full-house', label: 'Full House' },
                                    { id: 'pg', label: 'PG/Hostel' },
                                    { id: 'flatmates', label: 'Flatmates' }
                                ].map(option => (
                                    <label key={option.id} className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative flex items-center justify-center w-5 h-5">
                                            <input 
                                                type="radio" 
                                                name="property-type"
                                                checked={propertyType === option.id}
                                                onChange={() => setPropertyType(option.id)}
                                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-[#009688] transition-colors cursor-pointer"
                                            />
                                            <div className="absolute w-2.5 h-2.5 bg-[#009688] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                                        </div>
                                        <span className={`text-[15px] font-medium transition-colors ${propertyType === option.id ? 'text-[#009688]' : 'text-[#464646]'}`}>
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <button className="flex items-center justify-between w-full sm:w-auto min-w-[200px] px-4 py-2 border border-slate-300 bg-white rounded text-[#464646] hover:border-slate-400">
                                <span className="text-sm font-semibold">BHK Type</span>
                                <ChevronDown size={16} className="text-slate-400" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Post Ad CTA Divider */}
                <div className="w-full max-w-[800px] mt-4">
                    <div className="relative flex items-center justify-center py-6">
                        <div className="absolute w-full border-t border-slate-200"></div>
                        <span className="relative bg-white px-4 text-[#464646] font-medium" style={{ background: 'linear-gradient(to bottom, #FAFCFD, #FFFFFF)'}}>
                            Are you a Property Owner?
                        </span>
                    </div>

                    <div className="flex justify-center mt-2">
                        <button className="bg-[#009688] hover:bg-[#00897b] text-white px-8 py-3 rounded text-[15px] font-bold shadow shadow-[#009688]/30 transition-colors uppercase tracking-wide">
                            Post Free Property Ad
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default HeroSection;
