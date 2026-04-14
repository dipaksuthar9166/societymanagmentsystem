import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Heart, Award, ShieldCheck, Zap } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutUsPage = () => {
    const stats = [
        { label: "Founded", val: "2024" },
        { label: "Societies", val: "500+" },
        { label: "Team Members", val: "50+" },
        { label: "Support", val: "24/7" }
    ];

    return (
        <div className="min-h-screen bg-white font-['Outfit']">
            <Navbar scrolled={true} />
            
            <main className="pt-32 pb-20">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-[#FD3752] rounded-full text-xs font-bold uppercase tracking-widest">
                            <Zap size={14} /> Our Mission
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-[#464646] leading-tight focus-in-expand">
                            Redefining Society <br/> Living with <span className="text-[#FD3752]">Guru Kripa</span>
                        </h1>
                        <p className="text-xl text-slate-600 font-medium leading-relaxed">
                            Guru Kripa is on a mission to bring transparency, security, and digital convenience to every gated community in India. 
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                            {stats.map((s, i) => (
                                <div key={i} className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="text-2xl font-black text-[#FD3752]">{s.val}</div>
                                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-100 rounded-[3rem] aspect-square flex items-center justify-center overflow-hidden border-8 border-white shadow-2xl relative"
                    >
                        <Users size={180} className="text-slate-200" strokeWidth={0.5} />
                        <div className="absolute top-10 right-10 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center"><ShieldCheck size={24}/></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase">Trusted by</p><p className="text-lg font-black text-[#464646]">15,000+ Units</p></div>
                        </div>
                    </motion.div>
                </section>

                {/* Values Section */}
                <section className="bg-[#1b1b1b] py-32 text-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-20 space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black">The Values We Live By</h2>
                            <div className="h-1.5 w-24 bg-[#FD3752] mx-auto rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                { title: "Transparency", desc: "Digital ledgers ensure every penny collected is accounted for.", icon: Target },
                                { title: "Safety First", desc: "No unverified entry. No security loopholes. Ever.", icon: Award },
                                { title: "Innovation", desc: "Solving age-old society problems with modern AI & IoT.", icon: Heart }
                            ].map((v, i) => (
                                <div key={i} className="text-center group">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover:bg-[#FD3752] transition-colors">
                                        <v.icon size={32} className="text-[#FD3752] group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{v.title}</h3>
                                    <p className="text-slate-400 font-medium leading-relaxed">{v.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default AboutUsPage;
