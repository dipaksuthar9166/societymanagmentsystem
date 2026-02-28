import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, ShieldCheck, Smartphone,
    ArrowRight, Play, CheckCircle2, Building2, ChevronLeft,
    BarChart3, MessageSquare, CreditCard, Bell, Lock, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

const DemoCard = ({ role, title, desc, icon: Icon, features, onEnter, color }) => (
    <motion.div
        whileHover={{ y: -8 }}
        className="group relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl -translate-y-12 translate-x-12 opacity-0 group-hover:opacity-100 transition-opacity`}></div>

        <div className={`w-16 h-16 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-600 dark:text-${color}-400 mb-8 group-hover:scale-110 transition-transform`}>
            <Icon size={32} />
        </div>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 font-medium mb-8 leading-relaxed">{desc}</p>

        <ul className="space-y-4 mb-10">
            {features.map((f, i) => (
                <li key={i} className="flex gap-3 items-center text-sm text-slate-700 dark:text-slate-300 font-bold italic uppercase tracking-wider">
                    <CheckCircle2 size={16} className={`text-${color}-500`} /> {f}
                </li>
            ))}
        </ul>

        <button
            onClick={() => onEnter(role)}
            className={`w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:bg-${color}-600 dark:hover:bg-${color}-50 dark:hover:text-${color}-600 transition-all shadow-xl flex items-center justify-center gap-2 group/btn`}
        >
            EXPLORE {role.toUpperCase()} <Play size={16} className="fill-current group-hover/btn:translate-x-1 transition-transform" />
        </button>
    </motion.div>
);

const DemoPortal = () => {
    const navigate = useNavigate();
    const { mockLogin } = useAuth();
    const [scrolled, setScrolled] = useState(true);

    const handleDemoEnter = (role) => {
        // We'll use the mockLogin if we want to enter the REAL dashboard
        // But for today, we'll just show a "Coming Soon" or a "Mock View" if it's too complex
        // Let's try mockLogin!
        mockLogin(role);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <Navbar scrolled={true} />

            <main className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-widest mb-6"
                        >
                            <Zap size={14} className="animate-pulse" /> Interactive Project Tour
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-tight">
                            Experience the <span className="text-orange-600">Full Power</span> <br /> of SocietyPro.
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-xl max-w-3xl mx-auto font-medium">
                            Choose a role below to enter a live, sandbox environment. Explore every dashboard and feature of the residential ecosystem.
                        </p>
                    </div>

                    {/* Roles Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <DemoCard
                            role="admin"
                            title="Society Admin"
                            desc="The main command center for chairmen and treasurers. Manage data, revenue, and decisions."
                            icon={BarChart3}
                            color="orange"
                            features={["Revenue Analytics", "Member Directory", "Society Setup", "Financial Reports"]}
                            onEnter={handleDemoEnter}
                        />
                        <DemoCard
                            role="user"
                            title="Resident App"
                            desc="The modern gateway for homeowners. Pay bills, chat with neighbors, and book facilities."
                            icon={Smartphone}
                            color="purple"
                            features={["Payment Interface", "Notice Board", "Helpdesk Support", "Amenity Booking"]}
                            onEnter={handleDemoEnter}
                        />
                        <DemoCard
                            role="guard"
                            title="Security Gate"
                            desc="The heartbeat of society safety. Digital visitor logs and instant OTP verifications."
                            icon={ShieldCheck}
                            color="emerald"
                            features={["Visitor Check-in", "Guest Passes", "Parcel Tracking", "SOS Alerts"]}
                            onEnter={handleDemoEnter}
                        />
                    </div>

                    {/* Meta Info */}
                    <div className="mt-24 p-12 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 text-center">
                        <div className="flex justify-center gap-12 mb-8">
                            <div className="text-center">
                                <span className="block text-4xl font-black text-slate-900 dark:text-white mb-2">100%</span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Functional Demo</span>
                            </div>
                            <div className="w-px h-16 bg-slate-200 dark:bg-white/10"></div>
                            <div className="text-center">
                                <span className="block text-4xl font-black text-slate-900 dark:text-white mb-2">No-Code</span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Setup Needed</span>
                            </div>
                        </div>
                        <p className="text-slate-500 font-medium italic">
                            * Note: This is a sandbox environment. Any changes made in demo mode are not saved permanently.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DemoPortal;
