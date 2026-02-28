import React from 'react';
import { motion } from 'framer-motion';
import {
    Dribbble, Flame, Wind, Music, Coffee,
    Calendar, Key, Wrench, Clock, ShieldCheck
} from 'lucide-react';

const FacilityCard = ({ title, icon: Icon, description, features }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="group p-8 rounded-[3rem] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10"
    >
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-8 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
            <Icon size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-8 leading-relaxed">
            {description}
        </p>
        <ul className="space-y-3 pt-6 border-t border-slate-200 dark:border-white/5">
            {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    {f}
                </li>
            ))}
        </ul>
    </motion.div>
);

const FacilityShowcase = () => {
    return (
        <section className="py-32 bg-slate-50 dark:bg-slate-950/50 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-24">
                    <div className="space-y-6 max-w-2xl">
                        <span className="text-orange-500 font-black uppercase tracking-[0.4em] text-xs">Infrastructure Control</span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                            Manage Every <br /> <span className="text-slate-400">Amenity Dynamically.</span>
                        </h2>
                    </div>
                    <p className="text-lg text-slate-500 font-bold max-w-sm">
                        Optimizing asset lifespan and resident happiness through data-driven facility logistics.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FacilityCard
                        title="Clubhouse & Arenas"
                        icon={Dribbble}
                        description="From booking badminton courts to organizing grand gala events, manage your communal spaces with zero friction."
                        features={["App-based Booking", "Member Access Control", "Event Management"]}
                    />
                    <FacilityCard
                        title="Fitness & Vitality"
                        icon={Flame}
                        description="Manage gym equipment audits, trainer schedules, and swimming pool maintenance logs in real-time."
                        features={["Asset Audit Logs", "Staff Scheduling", "Usage Analytics"]}
                    />
                    <FacilityCard
                        title="Utilities & Power"
                        icon={Wind}
                        description="Automated tracking of DG sets, water levels, and solar grid performance. Predictive maintenance at its core."
                        features={["IoT Monitoring", "Vendor Tracking", "AMCs & Compliance"]}
                    />
                    <FacilityCard
                        title="Service Marketplace"
                        icon={Coffee}
                        description="A unified corridor for on-demand services—electricians, plumbers, and home cleaning—vetted by the society."
                        features={["Vendor Ratings", "Instant Invoicing", "Verified IDs"]}
                    />
                    <FacilityCard
                        title="Asset Repository"
                        icon={Wrench}
                        description="Every lift, fire extinguisher, and water tank registered. Track warranty, AMC, and historical service data."
                        features={["Lifetime tracking", "Document cloud", "Alert triggers"]}
                    />
                    <FacilityCard
                        title="Resource Hub"
                        icon={ShieldCheck}
                        description="Manage housekeeping rosters and security shifts with integrated attendance and payroll logic."
                        features={["Roster Generator", "Daily Logbook", "Instant Payroll"]}
                    />
                </div>
            </div>
        </section>
    );
};

export default FacilityShowcase;
