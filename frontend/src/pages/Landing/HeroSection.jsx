import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Home, Wallet, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = ({ stats }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('manage'); // manage, marketplace, security

    return (
        <section className="relative bg-slate-50 dark:bg-slate-950 pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden font-['Outfit']">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="h-px w-8 bg-orange-500"></span>
                                <span className="text-orange-500 font-bold uppercase tracking-widest text-sm">Nexus OS Platform</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1]">
                                Manage Your <br />
                                <span className="text-orange-600 dark:text-orange-500">Society Smarter</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg leading-relaxed font-medium">
                                The ultimate operating system for modern communities. Digitizing everything from financial billing to gate security and facility booking.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="bg-slate-900 dark:bg-orange-500 text-white px-10 py-4 rounded-none font-bold text-sm tracking-uppercase hover:bg-slate-800 dark:hover:bg-orange-600 transition-all shadow-xl shadow-orange-200 dark:shadow-none flex items-center gap-2"
                        >
                            Explore More
                        </button>

                        <div className="flex items-center gap-8 pt-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                        <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    {(stats?.residents / 1000).toFixed(1) || '12'}k+ Happy Residents
                                </p>
                                <div className="flex text-orange-500 text-sm">
                                    {'★'.repeat(5)}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-orange-900/20 relative z-10">
                            {/* Placeholder for Building Image - Using a gradient/styled div since we don't have the asset */}
                            <img
                                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop"
                                alt="Modern Building"
                                className="w-full h-full object-cover"
                            />

                            {/* Floating Badge */}
                            <div className="absolute top-8 right-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trusted By</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <CheckCircle2 className="text-orange-500" size={20} />
                                    <span className="font-black text-slate-900 dark:text-white">250+ Societies</span>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Circle */}
                        <div className="absolute -bottom-10 -left-10 w-full h-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[3rem] -z-0"></div>
                    </motion.div>

                </div>
            </div>

            {/* Overlapping Search Section */}
            <div className="max-w-6xl mx-auto px-6 mt-16 lg:-mt-24 relative z-20">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-t-3xl lg:rounded-3xl shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-white/5"
                >
                    <div className="flex gap-8 mb-8 border-b border-slate-100 dark:border-slate-800 pb-1 flex-wrap">
                        {['Manage', 'Marketplace', 'Security'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest bg-transparent border-b-2 transition-all ${activeTab === tab.toLowerCase()
                                    ? 'border-orange-500 text-orange-500'
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {activeTab === 'manage' ? 'Society Name' : activeTab === 'marketplace' ? 'Location' : 'Society ID'}
                            </label>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <MapPin size={20} className="text-orange-500" />
                                <input
                                    type="text"
                                    placeholder={activeTab === 'manage' ? 'Search Society...' : activeTab === 'marketplace' ? 'Enter City...' : 'Enter ID...'}
                                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {activeTab === 'manage' ? 'Access Type' : activeTab === 'marketplace' ? 'Unit Type' : 'Entry Type'}
                            </label>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <Home size={20} className="text-orange-500" />
                                <select className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {activeTab === 'manage' && (
                                        <>
                                            <option>Member Portal</option>
                                            <option>Admin Dashboard</option>
                                            <option>Staff Access</option>
                                        </>
                                    )}
                                    {activeTab === 'marketplace' && (
                                        <>
                                            <option>Apartment</option>
                                            <option>Villa</option>
                                            <option>Penthouse</option>
                                        </>
                                    )}
                                    {activeTab === 'security' && (
                                        <>
                                            <option>Visitor</option>
                                            <option>Delivery</option>
                                            <option>Guest</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {activeTab === 'manage' ? 'Member Code' : activeTab === 'marketplace' ? 'Budget' : 'Mobile No.'}
                            </label>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <Wallet size={20} className="text-orange-500" />
                                <input
                                    type="text"
                                    placeholder={activeTab === 'manage' ? 'XXXX-XXXX' : activeTab === 'marketplace' ? '₹ Range' : '91XXXXXXXX'}
                                    className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button className="w-full py-4 bg-slate-900 dark:bg-orange-500 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-2">
                                <Search size={18} />
                                Search
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
