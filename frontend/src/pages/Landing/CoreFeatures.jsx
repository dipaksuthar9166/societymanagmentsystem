import React from 'react';
import { CreditCard, ShieldCheck, PieChart, Users, PhoneCall, History } from 'lucide-react';
import { motion } from 'framer-motion';

const CoreFeatures = () => {
    const highlights = [
        {
            title: "Automated Maintenance Billing",
            desc: "Setup billing cycles and let the system handle invoice generation and WhatsApp delivery.",
            icon: CreditCard
        },
        {
            title: "Visitor & Gate Management",
            desc: "Resident-approved visitor entry. Real-time notifications for every person entering the gate.",
            icon: ShieldCheck
        },
        {
            title: "Accounting & Audit",
            desc: "Complete financial transparency with audit-ready reports and automated expense tracking.",
            icon: PieChart
        },
        {
            title: "Resident Engagement App",
            desc: "A powerful mobile app for residents to pay bills, book facilities, and raise complaints.",
            icon: Users
        },
        {
            title: "E-Intercom System",
            desc: "Connect with the security gate from anywhere in the world using our digital intercom.",
            icon: PhoneCall
        },
        {
            title: "Audit & Logs History",
            desc: "Keep track of every change. Maintain 10 years of logs for all society activities.",
            icon: History
        }
    ];

    return (
        <section className="py-24 bg-[#FCFCFD] font-['Outfit']">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                    <div className="max-w-xl">
                        <h2 className="text-3xl md:text-5xl font-black text-[#464646] mb-6 leading-tight">
                            The Only App Your <br /> <span className="text-[#FD3752]">Society Needs.</span>
                        </h2>
                    </div>
                    <p className="text-lg text-slate-500 font-medium max-w-sm text-right">
                        Say goodbye to manual registers and scattered WhatsApp groups.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {highlights.map((h, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                        >
                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-[#FD3752] mb-8 group-hover:bg-[#FD3752] group-hover:text-white transition-colors">
                                <h.icon size={28} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-[#464646] mb-4">{h.title}</h3>
                            <p className="text-[#464646] font-medium leading-relaxed">
                                {h.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CoreFeatures;
