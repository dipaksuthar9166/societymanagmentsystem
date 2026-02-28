import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Zap, ShieldCheck, CreditCard, BarChart3, Users, Smartphone,
    ArrowRight, Lock, Bell, Building2, Globe
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import Navbar from './Navbar';
import Footer from './Footer';

const CountUp = ({ end, duration = 2 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const totalMiliseconds = duration * 1000;
        const interval = 50;
        const totalSteps = totalMiliseconds / interval;
        const increment = end / totalSteps;

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, interval);
        return () => clearInterval(timer);
    }, [end, duration]);
    return <span>{count.toLocaleString()}</span>;
};

const FeatureItem = ({ icon: Icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 hover:border-orange-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all group shadow-sm hover:shadow-xl"
    >
        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm font-medium">{desc}</p>
    </motion.div>
);

const FeaturesPage = () => {
    const [stats, setStats] = useState({ societies: 500, residents: 15000 });

    useEffect(() => {
        fetch(`${API_BASE_URL.replace('/api', '')}/api/public/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.log("Stats fetch failed", err));
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <Navbar scrolled={true} />
            <div className="pt-32 pb-20 text-slate-900 dark:text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm"
                        >
                            <Zap size={14} /> Product Ecosystem
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">Built for Modern Living.</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                            A comprehensive suite of tools designed to automate every aspect of your housing society.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-32">
                        <FeatureItem
                            icon={CreditCard}
                            title="Automated Billing"
                            desc="Generate maintenance bills, late fees, and invoices automatically. Residents get instant WhatsApp alerts."
                            delay={0.1}
                        />
                        <FeatureItem
                            icon={ShieldCheck}
                            title="Smart Gatekeeper"
                            desc="Digital visitor management with QR codes and real-time approval requests on resident mobiles."
                            delay={0.2}
                        />
                        <FeatureItem
                            icon={BarChart3}
                            title="Financial Analytics"
                            desc="Deep insights into collection trends, expense tracking, and vendor payments for committees."
                            delay={0.3}
                        />
                        <FeatureItem
                            icon={Lock}
                            title="Military-Grade Security"
                            desc="All your data is encrypted. We follow the highest standards of privacy and data protection."
                            delay={0.4}
                        />
                        <FeatureItem
                            icon={Bell}
                            title="Instant Notices"
                            desc="Broadcasting updates to all residents via App and WhatsApp in seconds. No more physical notices."
                            delay={0.5}
                        />
                        <FeatureItem
                            icon={Building2}
                            title="Facility Booking"
                            desc="Residents can book Clubhouse, Gym, or Pool directly from the app. Automated slots management."
                            delay={0.6}
                        />
                    </div>

                    <div className="bg-gradient-to-br from-orange-600 to-orange-900 dark:from-orange-900/40 dark:to-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            <div className="text-left text-white">
                                <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">Scale without <br /> the stress.</h2>
                                <p className="opacity-80 mb-8 font-medium">Currently streamlining operations for premium societies across India.</p>
                                <button className="px-8 py-3 bg-white text-orange-600 font-black rounded-xl hover:shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs">Get a Custom Proposal</button>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-8 bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10">
                                    <div className="text-4xl font-black text-white mb-2"><CountUp end={stats.societies} />+</div>
                                    <div className="text-[10px] text-white/60 uppercase font-black tracking-widest">Societies Joined</div>
                                </div>
                                <div className="p-8 bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10">
                                    <div className="text-4xl font-black text-white mb-2"><CountUp end={stats.residents} />+</div>
                                    <div className="text-[10px] text-white/60 uppercase font-black tracking-widest">Happy Residents</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default FeaturesPage;
