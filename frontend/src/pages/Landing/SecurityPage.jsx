import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Server, Check } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const SecurityCard = ({ icon: Icon, title, desc, features }) => (
    <div className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 hover:bg-white dark:hover:bg-slate-900 transition-all flex flex-col gap-6 shadow-sm hover:shadow-xl group">
        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
            <Icon size={28} />
        </div>
        <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 font-medium">{desc}</p>
        </div>
        <ul className="mt-auto space-y-4">
            {features.map((f, i) => (
                <li key={i} className="flex gap-3 items-center text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest italic">
                    <Check className="text-emerald-500" size={14} /> {f}
                </li>
            ))}
        </ul>
    </div>
);

const SecurityPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <Navbar scrolled={true} />
            <div className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest mb-6"
                        >
                            <ShieldCheck size={14} /> Bank-Level Trust
                        </motion.div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">Your Data, Safe & Private.</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                            Security is not a feature; it's our foundation. We use industry-leading encryption and protocols to keep your community safe.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 mb-32">
                        <SecurityCard
                            icon={Lock}
                            title="Data Encryption"
                            desc="All data stored in our systems is encrypted at rest and in transit. No one including our developers can access your private records."
                            features={["AES-256 Encryption", "SSL/TLS in transit", "Encrypted Backups"]}
                        />
                        <SecurityCard
                            icon={Eye}
                            title="Access Controls"
                            desc="Granular role-based access ensures that sensitive financial data is only visible to authorized personnel like the Treasurer."
                            features={["MFA Support", "Session Logging", "Role Based Auth"]}
                        />
                        <SecurityCard
                            icon={Server}
                            title="Cloud Infrastructure"
                            desc="Hosted on enterprise-grade cloud servers with automatic failovers and 99.9% uptime guarantees."
                            features={["Daily Backups", "DDoS Protection", "99.9% Uptime SLA"]}
                        />
                    </div>

                    <div className="bg-gradient-to-r from-orange-600 to-orange-900 dark:from-orange-900/20 dark:to-orange-600/20 rounded-[3rem] p-12 md:p-20 text-center border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 text-white">
                            <h2 className="text-3xl font-black mb-4">Zero Knowledge Architecture</h2>
                            <p className="opacity-80 max-w-2xl mx-auto font-medium">
                                We believe you should own your data. Our systems are designed so that the keys to sensitive resident information stay within your society's virtual vault.
                            </p>
                            <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/60 font-black uppercase tracking-[0.2em] text-[10px] italic">
                                <span>ISO 27001 Ready</span>
                                <span>GDPR Compliant</span>
                                <span>SOC2 Certified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SecurityPage;
