import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const PricingCard = ({ plan, price, desc, features, recommended }) => (
    <div className={`p-10 rounded-[2.5rem] ${recommended ? 'bg-white dark:bg-orange-950/30 border-2 border-orange-500 shadow-2xl shadow-orange-500/10 scale-105 z-10' : 'bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 shadow-sm'} relative transition-all group lg:hover:y-[-8px]`}>
        {recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-orange-500/20">Recommended</div>}
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{plan}</h3>
        <p className="text-slate-500 text-sm mb-8 font-medium">{desc}</p>
        <div className="flex items-baseline gap-1 mb-10 text-slate-900 dark:text-white">
            <span className="text-5xl font-black">{price === "Custom" ? "" : "₹"}{price}</span>
            {price !== "Custom" && <span className="text-slate-500 font-bold text-sm tracking-tight opacity-70">/society/mo</span>}
        </div>
        <ul className="space-y-4 mb-10">
            {features.map((f, i) => (
                <li key={i} className="flex gap-3 items-center text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <Check className="text-orange-500" size={16} /> {f}
                </li>
            ))}
        </ul>
        <button className={`w-full py-4 rounded-xl font-black transition-all active:scale-95 shadow-lg ${recommended ? 'bg-orange-600 text-white hover:bg-orange-500 shadow-orange-600/20' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-orange-600 dark:hover:bg-orange-50 dark:hover:text-orange-600 shadow-slate-900/10 dark:shadow-white/10'}`}>
            CHOOSE PLAN
        </button>
    </div>
);

const PricingPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <Navbar scrolled={true} />
            <div className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-orange-600 dark:text-orange-400 font-bold tracking-[0.2em] uppercase text-xs mb-4"
                        >
                            Pricing Plans
                        </motion.p>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight">Simple, Fair Pricing.</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                            Whether you're a small standalone building or a mega-township, we have a plan that fits your needs perfectly.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12 lg:gap-8 mb-32 items-center">
                        <PricingCard
                            plan="Starter"
                            price="1,499"
                            desc="Perfect for small buildings or individual society wings."
                            features={["Up to 50 residents", "Automated Billing", "WhatsApp Notices", "Basic Reports"]}
                        />
                        <PricingCard
                            plan="Professional"
                            price="2,999"
                            desc="Our most popular plan for established housing societies."
                            features={["Up to 200 residents", "Smart Gatekeeper", "Facility Booking", "Advanced Analytics", "24/7 Support"]}
                            recommended={true}
                        />
                        <PricingCard
                            plan="Enterprise"
                            price="Custom"
                            desc="For large townships and multi-society complexes."
                            features={["Unlimited residents", "Multi-gate management", "Custom integrations", "Dedicated Manager"]}
                        />
                    </div>

                    {/* FAQ Style CTA */}
                    <div className="max-w-4xl mx-auto p-12 rounded-[3rem] bg-orange-600 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px]"></div>
                        <div className="relative z-10 text-white">
                            <h2 className="text-3xl font-black mb-6 italic">Need a custom quote for a Mega-Township?</h2>
                            <p className="opacity-80 mb-10 max-w-xl mx-auto font-medium">Talk to our enterprise sales team for customized SLAs and volume-based discounts tailored to your society's scale.</p>
                            <button className="px-10 py-4 bg-white text-orange-700 font-black rounded-xl hover:shadow-xl transition-all flex items-center gap-2 mx-auto uppercase tracking-widest text-sm shadow-xl shadow-black/20">
                                Contact Sales <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PricingPage;
