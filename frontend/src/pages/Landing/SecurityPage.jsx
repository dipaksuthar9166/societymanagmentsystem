import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, UserCheck, Smartphone, BellRing, Lock, Eye } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const SecurityPage = () => {
    const securityFeatures = [
        { title: "Visitor Management", desc: "Verify every visitor via resident approval notification.", icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Gatekeeper App", desc: "Simplified interface for guards to record visitor details.", icon: Smartphone, color: "text-[#FD3752]", bg: "bg-red-50" },
        { title: "SOS Alerts", desc: "Raise silent alarms in case of emergencies instantly.", icon: BellRing, color: "text-orange-600", bg: "bg-orange-50" },
        { title: "Staff Tracking", desc: "Track attendance of maids, drivers, and society staff.", icon: Lock, color: "text-emerald-600", bg: "bg-emerald-50" }
    ];

    return (
        <div className="min-h-screen bg-white font-['Outfit']">
            <Navbar scrolled={true} />
            <main className="pt-32 pb-20">
                <section className="max-w-7xl mx-auto px-4 text-center mb-24">
                    <h1 className="text-4xl md:text-6xl font-black text-[#464646] mb-6">Smart <span className="text-[#FD3752]">Security</span></h1>
                    <p className="text-lg text-slate-500 max-w-3xl mx-auto font-medium">3-tier security system with real-time tracking for peace of mind.</p>
                </section>

                <section className="bg-slate-50 py-24">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {securityFeatures.map((f, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100"
                                >
                                    <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center ${f.color} mb-6`}><f.icon size={28} /></div>
                                    <h3 className="text-xl font-bold text-[#464646] mb-3">{f.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default SecurityPage;
