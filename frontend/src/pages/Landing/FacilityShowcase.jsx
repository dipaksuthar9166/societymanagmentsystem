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
import { Palmtree, Dumbbell, Coffee, Car } from 'lucide-react';

const FacilityShowcase = () => {
    const facilities = [
        {
            name: "Clubhouse & Events",
            desc: "Book society halls for birthdays or events directly from the app.",
            icon: Coffee,
            img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000&auto=format&fit=crop"
        },
        {
            name: "Elite Gym & Spa",
            desc: "Track gym occupancy and book personal training sessions.",
            icon: Dumbbell,
            img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000&auto=format&fit=crop"
        },
        {
            name: "Swimming Pool",
            desc: "Check pool timings and status. Automated PH level monitoring logs.",
            icon: Palmtree,
            img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=2000&auto=format&fit=crop"
        },
        {
            name: "Parking Management",
            desc: "Smart parking stickers and real-time empty slot tracking for residents.",
            icon: Car,
            img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2000&auto=format&fit=crop"
        }
    ];

    return (
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
