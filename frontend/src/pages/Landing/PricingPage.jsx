import React from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Building } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const PricingPage = () => {
    const plans = [
        {
            name: "Starter",
            icon: Zap,
            price: "₹1,500",
            period: "/month",
            desc: "Ideal for small societies up to 50 flats.",
            features: [
                "Automated Maintenance Billing",
                "UPI Payment Collection",
                "Resident App",
                "Digital Notice Board",
                "Basic Accounting Reports"
            ],
            color: "text-blue-600",
            btnColor: "bg-blue-600 hover:bg-blue-700"
        },
        {
            name: "Professional",
            icon: Shield,
            price: "₹3,500",
            period: "/month",
            desc: "Best for mid-sized gated communities.",
            popular: true,
            features: [
                "Everything in Starter",
                "Gatekeeper System",
                "Visitor SOS Alerts",
                "Inventory & Asset Management",
                "Advanced Financial Audit Reports",
                "Complaint Helpdesk (SLA Tracking)"
            ],
            color: "text-[#FD3752]",
            btnColor: "bg-[#FD3752] hover:bg-[#e02d45]"
        },
        {
            name: "Enterprise",
            icon: Building,
            price: "Custom",
            period: "",
            desc: "For large apartment complexes & builders.",
            features: [
                "Everything in Professional",
                "Multiple Tower Management",
                "Custom Branding",
                "API Integrations",
                "Dedicated Account Manager",
                "Physical Hardware Setup"
            ],
            color: "text-slate-800",
            btnColor: "bg-slate-800 hover:bg-slate-900"
        }
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-['Outfit']">
            <Navbar scrolled={true} />
            <main className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h1 className="text-4xl md:text-5xl font-black text-[#464646] mb-6">Scalable <span className="text-[#FD3752]">Pricing</span></h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Transparent pricing designed to fit your society's size and specific needs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {plans.map((plan, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative bg-white rounded-3xl p-8 border ${plan.popular ? 'border-[#FD3752] shadow-2xl scale-105 z-10' : 'border-slate-200 shadow-xl'}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FD3752] text-white px-6 py-1 rounded-full text-xs font-bold tracking-widest uppercase">Popular</div>
                                )}
                                <plan.icon className={`w-12 h-12 ${plan.color} mb-6`} />
                                <h3 className="text-2xl font-bold text-[#464646] mb-2">{plan.name}</h3>
                                <p className="text-sm text-slate-500 font-medium mb-8">{plan.desc}</p>
                                <div className="mb-8">
                                    <span className="text-4xl font-black text-[#464646]">{plan.price}</span>
                                    <span className="text-slate-500 font-medium">{plan.period}</span>
                                </div>
                                <ul className="space-y-4 mb-10">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                                            <Check size={16} className="text-emerald-500 mt-0.5" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-4 rounded-xl text-white font-bold transition-all ${plan.btnColor}`}>Select Plan</button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PricingPage;
