import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Home, Shield, ArrowRight, CheckCircle2, Globe, Zap, Users, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = ({ stats }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('manage');

    const heroVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <section className="relative bg-white dark:bg-[#030712] pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden font-['Outfit']">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] pointer-events-none opacity-40 dark:opacity-20">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-cyan-400/20 rounded-full blur-[100px] delay-700 animate-pulse"></div>
                <div className="absolute -bottom-20 left-[30%] w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[150px] animate-pulse"></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    
                    {/* Left Content: Text & CTA */}
                    <motion.div 
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } }
                        }}
                        className="flex-1 text-center lg:text-left space-y-10"
                    >
                        <motion.div variants={heroVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 rounded-full">
                            <Zap size={14} className="text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Next Gen Society Management</span>
                        </motion.div>

                        <motion.div variants={heroVariants} className="space-y-6">
                            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[0.95] tracking-tight">
                                The Future of <br />
                                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">Urban Living.</span>
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                SocieHub is a comprehensive ecosystem designed to digitize modern communities. From smart gate security to fully automated financial billing.
                            </p>
                        </motion.div>

                        <motion.div variants={heroVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <button 
                                onClick={() => navigate('/login')}
                                className="group relative bg-[#030712] dark:bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Launch Your Society <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                            
                            <button className="px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800">
                                View Demo Portal
                            </button>
                        </motion.div>

                        <motion.div variants={heroVariants} className="flex items-center justify-center lg:justify-start gap-10 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            <div>
                                <h4 className="text-3xl font-black text-slate-900 dark:text-white">
                                    {stats?.societies || '10'}+
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Societies</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-black text-slate-900 dark:text-white">
                                    {((stats?.residents || 1200) / 1000).toFixed(1)}k
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Residents</p>
                            </div>
                            <div className="hidden sm:block">
                                <h4 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                                    {stats?.uptime || '99.9%'}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Uptime</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Content: 3D-like Dashboard Mockup */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, rotateY: -10 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="flex-1 relative perspective-[2000px]"
                    >
                        <div className="relative z-10 transform-style-3d hover:rotate-y-5 transition-transform duration-500">
                            {/* Main Dashboard UI Mockup */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border border-slate-200/50 dark:border-white/10 overflow-hidden ring-8 ring-slate-100 dark:ring-slate-800/50">
                                <img 
                                    src="https://images.unsplash.com/photo-1460472178825-e5240623abe5?q=80&w=2070&auto=format&fit=crop" 
                                    className="w-full h-full object-cover rounded-3xl opacity-90 dark:opacity-70 grayscale-[0.2]" 
                                    alt="Dashboard Visualization"
                                />
                                
                                {/* Floating Overlay Elements */}
                                <motion.div 
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-10 -left-10 bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 hidden md:flex"
                                >
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Status</p>
                                        <p className="text-lg font-black text-slate-800 dark:text-white">Active & Secure</p>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    animate={{ y: [0, 15, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute bottom-10 -right-10 bg-indigo-600 text-white p-6 rounded-[2rem] shadow-2xl flex flex-col gap-2 hidden md:block"
                                >
                                    <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">Visitor Activity</p>
                                    <h4 className="text-2xl font-black">+1,240 <span className="text-xs font-normal opacity-70 ml-1">today</span></h4>
                                    <div className="flex -space-x-3 mt-2">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Background Decoration Circles */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-slate-100 dark:border-slate-800/50 rounded-full pointer-events-none -z-10"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border border-slate-200/50 dark:border-slate-800/40 rounded-full pointer-events-none -z-10"></div>
                    </motion.div>

                </div>
            </div>

            {/* Bento-style Search/Action Section */}
            <div className="max-w-7xl mx-auto px-6 mt-16 relative z-30">
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    <div className="lg:col-span-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white dark:border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                        <div className="flex gap-8 mb-8 border-b border-slate-100 dark:border-slate-800 pb-1">
                            {['Explore Societies', 'Marketplace', 'Smart Security'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-transparent ${
                                        activeTab === tab.toLowerCase() 
                                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' 
                                        : 'text-slate-400 hover:text-slate-600 border-transparent'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Location</label>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 focus-within:border-indigo-500 transition-colors">
                                    <MapPin size={18} className="text-indigo-500" />
                                    <input placeholder="New York, USA" className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-800 dark:text-white" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Society Name</label>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 focus-within:border-indigo-500 transition-colors">
                                    <Building2 size={18} className="text-indigo-500" />
                                    <input placeholder="Ex: Central Heights" className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-800 dark:text-white" />
                                </div>
                            </div>
                            <div className="flex items-end pb-1">
                                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 transition-transform active:scale-95">
                                    <Search size={16} /> Search Now
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white flex flex-col justify-between group overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2">Join the Club</h3>
                            <p className="text-sm opacity-80 leading-relaxed">Experience a smarter way to manage your home and community life.</p>
                        </div>
                        <div className="mt-8 relative z-10">
                            <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-xl">
                                Create Account
                            </button>
                        </div>
                        
                        {/* Abstract Decor */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <Users className="absolute top-1/2 right-4 text-white/5 w-32 h-32 -translate-y-1/2 rotate-12" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
