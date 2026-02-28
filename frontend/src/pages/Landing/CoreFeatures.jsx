import React from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, ShieldCheck, Smartphone, Users,
    BarChart3, Globe, Lock, Bell, MessageSquare,
    Zap, CircleCheck, CheckCircle2
} from 'lucide-react';

const FeatureBlock = ({ title, subtitle, description, points, icon: Icon, imageSide = 'right', color = 'indigo' }) => {
    return (
        <div className={`py-24 flex flex-col lg:flex-row items-center gap-16 ${imageSide === 'left' ? 'lg:flex-row-reverse' : ''}`}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2 space-y-8"
            >
                <div className={`w-16 h-16 rounded-[2rem] bg-${color}-500/10 flex items-center justify-center text-${color}-600 dark:text-${color}-400`}>
                    <Icon size={32} />
                </div>

                <div className="space-y-4">
                    <span className={`text-${color}-500 font-black uppercase tracking-[0.3em] text-[10px]`}>{subtitle}</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                        {title}
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                        {description}
                    </p>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {points.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 group">
                            <div className={`mt-1 text-${color}-500`}>
                                <CheckCircle2 size={18} />
                            </div>
                            <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight group-hover:text-orange-500 transition-colors">
                                {point}
                            </span>
                        </li>
                    ))}
                </ul>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2"
            >
                <div className="relative aspect-video bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>

                    {/* Abstract Visual representation of the feature */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 via-transparent to-transparent flex items-center justify-center`}>
                        <div className="w-4/5 h-3/5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner flex flex-col p-6 gap-4 transform group-hover:-translate-y-2 transition-transform duration-500">
                            {/* Animated Skeleton UI */}
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 animate-pulse`}></div>
                                <div className="space-y-2 flex-1 pt-2">
                                    <div className="h-2 w-1/3 bg-white/20 rounded-full"></div>
                                    <div className="h-2 w-1/2 bg-white/10 rounded-full"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-2">
                                        <div className={`w-4 h-4 rounded-full bg-${color}-500/30`}></div>
                                        <div className="h-1.5 w-10 bg-white/10 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-end gap-2">
                                <div className="h-1.5 w-full bg-white/10 rounded-full animate-pulse"></div>
                                <div className="h-1.5 w-3/4 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const CoreFeatures = () => {
    return (
        <section id="features" className="py-20 bg-white dark:bg-black overflow-hidden px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                    <span className="text-orange-500 font-black uppercase tracking-[0.4em] text-xs">Standardized Excellence</span>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white">The Nexus <span className="text-slate-400">Suites.</span></h2>
                </div>

                <FeatureBlock
                    title="Financial Intelligence & ERP"
                    subtitle="Accounting & Billing"
                    description="Automate M&R cycles with a GST-ready accounting engine. Eliminate physical cheque handling and provide 100% financial clarity to every resident."
                    color="orange"
                    icon={CreditCard}
                    points={[
                        "Auto-generated Invoices",
                        "Online Payment Gateway",
                        "GST-Ready Balance Sheets",
                        "Automated Fine Triggers",
                        "Real-time Spending Ledger",
                        "Digital Audit Trail"
                    ]}
                />

                <FeatureBlock
                    title="Next-Gen Security Protocols"
                    subtitle="Gate Management 2.0"
                    description="Replace outdated registers with a unified gate system. Biometric facial recognition for staff, QR-based visitor entry, and instant resident approval loops."
                    color="emerald"
                    icon={ShieldCheck}
                    imageSide="left"
                    points={[
                        "QR-Visitor Pre-Entry",
                        "Staff Attendance (Biometric)",
                        "Vehicle LPR Integration",
                        "E-Parcels Tracker",
                        "Crisis SOS Network",
                        "Daily Worker Profiles"
                    ]}
                />

                <FeatureBlock
                    title="Community & Living Logic"
                    subtitle="Collaboration"
                    description="Fostering community through digital consensus. Polling modules, digital notice boards, and a specialized marketplace for your society."
                    color="fuchsia"
                    icon={Users}
                    points={[
                        "Consensus Polling",
                        "Digital Notice Boards",
                        "Resident Directory",
                        "Asset & Facility Booking",
                        "Classifieds Marketplace",
                        "Discussion Forums"
                    ]}
                />
            </div>
        </section>
    );
};

export default CoreFeatures;
