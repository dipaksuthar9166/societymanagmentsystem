import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, Target, Heart } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const ValueItem = ({ icon: Icon, title, desc }) => (
    <div className="p-8 border-l border-slate-200 dark:border-white/10 hover:border-orange-500 transition-colors">
        <Icon className="text-orange-600 dark:text-orange-400 mb-6" size={32} />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
);

const AboutUsPage = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
            <Navbar scrolled={true} />
            <div className="pt-32 pb-20">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[120px] -z-0"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-slate-900 dark:text-white">
                    <div className="max-w-3xl mb-24">
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-orange-600 dark:text-orange-400 font-bold tracking-[0.2em] uppercase text-xs mb-4"
                        >
                            Our Story
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 leading-tight"
                        >
                            Digitizing the heart of Indian communities.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed font-medium"
                        >
                            Born from a simple observation: society management shouldn't be a part-time burden for residents. It should be a seamless, intelligent service that works in the background.
                        </motion.p>
                    </div>

                    {/* Team / Mission Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border-y border-slate-200 dark:border-white/10 mb-32">
                        <ValueItem
                            icon={Target}
                            title="Our Mission"
                            desc="To empower every housing society with world-class automation and financial transparency."
                        />
                        <ValueItem
                            icon={Globe}
                            title="Pan-India Vision"
                            desc="Scaling to 10,000+ communities across major Indian metros by 2026."
                        />
                        <ValueItem
                            icon={Users}
                            title="Resident First"
                            desc="We don't just build software for admins; we build an experience for families."
                        />
                        <ValueItem
                            icon={Heart}
                            title="Trust & Safety"
                            desc="Protecting community data with the same vigor we protect our own homes."
                        />
                    </div>

                    {/* Meet the Developer Section */}
                    <div className="mt-40 mb-32 border-t border-slate-200 dark:border-white/10 pt-24">
                        <div className="grid lg:grid-cols-3 gap-16 items-start">
                            <div className="lg:col-span-1 space-y-6">
                                <span className="text-orange-500 font-bold uppercase tracking-widest text-sm">Meet the Architect</span>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">Driving the <span className="text-orange-500 italic">Vision</span> Forward</h2>
                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                    A solo developer's journey to modernize the Indian housing landscape through clean code, user-centric design, and relentless innovation.
                                </p>
                            </div>

                            <div className="lg:col-span-2">
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-12 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-12 items-center"
                                >
                                    <div className="w-48 h-48 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-orange-500/20 overflow-hidden shrink-0">
                                        <img
                                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dipak"
                                            alt="Lead Developer"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="space-y-6 text-center md:text-left">
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">Dipak Suthar</h3>
                                            <p className="text-orange-500 font-bold uppercase tracking-widest text-sm mt-1">Founding Developer & Lead Architect</p>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 font-medium italic">
                                            "Nexus OS is more than just a software; it's a commitment to making community living efficient, secure, and truly digital for every resident."
                                        </p>
                                        <div className="flex justify-center md:justify-start gap-6">
                                            <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors">GitHub</a>
                                            <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors">LinkedIn</a>
                                            <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors">Twitter</a>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-orange-500/10 dark:bg-orange-500/20 rounded-3xl blur-2xl"></div>
                            <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 aspect-[4/5] bg-slate-100 dark:bg-slate-900 group">
                                <img
                                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                                    alt="Modern Office"
                                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                                />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight">Engineering for Impact</h2>
                            <div className="space-y-6 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                <p>Nexus OS has been built to solve real-world friction. From tracking unpaid maintenance to vetting security guards, we've lived the problems we're now solving.</p>
                                <p>Headquartered in Ahmedabad, Gujarat, we are dedicated to making urban living better, safer, and more connected for everyone.</p>
                            </div>
                            <div className="mt-12 flex gap-12 text-center md:text-left">
                                <div>
                                    <div className="text-4xl font-black text-orange-600 dark:text-white">100%</div>
                                    <div className="text-xs text-slate-500 uppercase font-black tracking-widest mt-2">Custom Built</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-orange-600 dark:text-white">24/7</div>
                                    <div className="text-xs text-slate-500 uppercase font-black tracking-widest mt-2">Continuous Updates</div>
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

export default AboutUsPage;
