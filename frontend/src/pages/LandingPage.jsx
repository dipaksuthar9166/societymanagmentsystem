import React, { useEffect, useState } from 'react';
import { API_BASE_URL, resolveImageURL } from '../config';
import Navbar from './Landing/Navbar';
import Footer from './Landing/Footer';
import HeroSection from './Landing/HeroSection';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Zap, BarChart3, Users,
    ArrowRight, Star, Heart, Building2, Phone,
    CheckCircle, Settings, Clock, ChevronDown, Rocket, Smartphone, Globe, Lock, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Improved Premium Components ---

const MarqueeSection = ({ brands = [] }) => (
    <section className="py-20 bg-slate-50 dark:bg-[#030712] overflow-hidden border-y border-slate-100 dark:border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Powering Global Communities</h3>
        </div>
        <div className="flex overflow-hidden group">
            <div className="flex animate-marquee group-hover:pause gap-12 md:gap-24 items-center whitespace-nowrap px-10">
                {(brands.length > 0 ? [...brands, ...brands] : ['Guru Kripa Building Site', 'Nexus Towers', 'Global Heights', 'Skyline Residency', 'Emerald Estate', 'Urban Oasis', 'Guru Kripa Building Site', 'Nexus Towers']).map((brand, i) => (
                    <span key={i} className="text-3xl md:text-5xl font-black text-slate-200 dark:text-slate-800 transition-colors hover:text-indigo-600 dark:hover:text-indigo-500 cursor-default uppercase italic tracking-tighter">
                        {brand}
                    </span>
                ))}
            </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-marquee {
                animation: marquee 30s linear infinite;
            }
            .pause { animation-play-state: paused; }
        `}} />
    </section>
);

const FeatureShowcase = () => {
    const features = [
        { icon: Lock, title: "Smart Gate Access", desc: "Digital guest passes with QR codes sent via WhatsApp/SMS instantly.", color: "indigo" },
        { icon: Smartphone, title: "Resident Wallet", desc: "Integrated payment gateway for maintenance, utilities, and fine payments.", color: "emerald" },
        { icon: BarChart3, title: "Society Analytics", desc: "Advanced financial reporting and tax management for committee members.", color: "violet" },
        { icon: Globe, title: "E-Voting", desc: "Conduct transparent society elections and meetings with digital voting.", color: "blue" }
    ];

    return (
        <section className="py-32 bg-white dark:bg-[#030712] relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <span className="text-indigo-600 font-black uppercase tracking-widest text-[10px]">Ecosystem Power</span>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight">Everything you need to <span className="text-indigo-600">thrive.</span></h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">A modular platform built to scale with your community's needs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((f, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -10 }}
                            className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-white/5 transition-all group relative overflow-hidden"
                        >
                            <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                <f.icon size={28} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">{f.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
                            
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ComparisonSection = () => {
    const points = [
        { label: "Visitor Management", manual: "Paper Registers & Calls", hub: "QR Passes & Video Call" },
        { label: "Account Billing", manual: "Manual PDF/Paper Invoices", hub: "AI-Auto Bills & GST Ready" },
        { label: "Staff Tracking", manual: "Biometric Machines/Books", hub: "Geofenced Mobile App" },
        { label: "SOS Alerts", manual: "Intercom or Shouting", hub: "App-Integrated Panic Link" },
        { label: "Complaint Desk", manual: "Tracking down the Admin", hub: "SLA-based Ticket System" }
    ];

    return (
        <section className="py-32 bg-slate-950 text-white overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50"></div>

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Modern Transformation</span>
                    <h2 className="text-4xl md:text-5xl font-black">Upgrade to <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Guru Kripa 2.0</span></h2>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-3 bg-indigo-600 p-8 font-black uppercase tracking-widest text-[10px]">
                        <div>Feature</div>
                        <div className="opacity-60">Legacy Systems</div>
                        <div className="text-white">Guru Kripa Building Site</div>
                    </div>
                    {points.map((p, i) => (
                        <div key={i} className="grid grid-cols-3 p-8 border-t border-white/5 items-center group hover:bg-white/5 transition-colors">
                            <div className="text-sm font-black text-slate-300">{p.label}</div>
                            <div className="text-xs font-bold text-slate-500 line-through opacity-50">{p.manual}</div>
                            <div className="text-sm font-black text-emerald-400 flex items-center gap-2">
                                <CheckCircle size={16} />
                                {p.hub}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CTASection = () => {
    const navigate = useNavigate();
    return (
        <section className="py-24 bg-white dark:bg-[#030712]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="bg-indigo-600 rounded-[3.5rem] p-12 lg:p-24 text-center text-white relative overflow-hidden">
                    <div className="relative z-10 space-y-10">
                        <h2 className="text-5xl lg:text-7xl font-black leading-tight max-w-4xl mx-auto">Ready to digitalize <br /> your society?</h2>
                        <p className="text-xl opacity-80 max-w-2xl mx-auto font-medium">Join 500+ modern communities who have already upgraded their urban lifestyle with Guru Kripa.</p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button 
                                onClick={() => navigate('/login')}
                                className="bg-white text-indigo-600 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
                            >
                                Get Started Free
                            </button>
                            <button className="px-12 py-5 border-2 border-white/30 hover:border-white text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all">
                                Contact Sales
                            </button>
                        </div>
                    </div>

                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full -ml-48 -mb-48 blur-3xl opacity-50"></div>
                </div>
            </div>
        </section>
    );
};

const FeaturedProjects = ({ projects = [] }) => {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/10" id="projects">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="space-y-4">
                        <span className="text-indigo-600 font-black uppercase tracking-widest text-[10px]">Active Hubs</span>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">Societies Powered <br /> by <span className="text-indigo-600">Guru Kripa</span></h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">From luxury estates to community clusters, we manage the most premium societies across the country.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {projects.map((p, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-xl group"
                        >
                            <div className="h-56 relative overflow-hidden bg-slate-200">
                                <img src={resolveImageURL(p.img)} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-4 right-4 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-lg">
                                    {p.badge}
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{p.title}</h3>
                                <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mb-6">
                                    <MapPin size={14} className="text-indigo-500" />
                                    {p.location}
                                </div>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-white/5 mt-auto">
                                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{p.price}</span>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Hub</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 dark:border-white/5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-10 flex justify-between items-center text-left group"
            >
                <span className="text-xl font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{question}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <ChevronDown size={20} />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pb-10"
                    >
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-4xl">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const [scrolled, setScrolled] = useState(false);
    const [stats, setStats] = useState(null);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        
        // Fetch Public Stats
        fetch(`${API_BASE_URL.replace('/api', '')}/api/public/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(e => console.error(e));

        // Fetch Featured Projects
        fetch(`${API_BASE_URL.replace('/api', '')}/api/public/projects`)
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(e => console.error(e));

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-[#030712] text-slate-900 dark:text-white transition-colors duration-500 font-['Outfit'] selection:bg-indigo-600 selection:text-white">
            {/* Scroll Progress Indicator */}
            <motion.div className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 z-[200] origin-left" style={{ scaleX }} />

            <Navbar scrolled={scrolled} />

            <main>
                <HeroSection stats={stats} />
                <MarqueeSection brands={stats?.brands} />
                <FeaturedProjects projects={projects} />
                <FeatureShowcase />
                <ComparisonSection />
                
                {/* Visual Separator Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                        <div>
                            <h3 className="text-5xl font-black text-indigo-600">24/7</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">Active Security</p>
                        </div>
                        <div>
                            <h3 className="text-5xl font-black text-emerald-500">100%</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">Data Privacy</p>
                        </div>
                        <div>
                            <h3 className="text-5xl font-black text-violet-500">₹0</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">Setup Cost</p>
                        </div>
                        <div>
                            <h3 className="text-5xl font-black text-blue-500">10k+</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">Daily Active Users</p>
                        </div>
                    </div>
                </section>

                <CTASection />

                <section className="py-32 bg-white dark:bg-[#030712]">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-16 space-y-4">
                            <span className="text-indigo-600 font-black uppercase tracking-widest text-[10px]">Got Questions?</span>
                            <h2 className="text-4xl font-black">Frequently Asked</h2>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            <FAQItem question="Is our data secure on the cloud?" answer="Yes, we use AWS and Google Cloud infrastructure with bank-grade encryption (AES-256). Each society has an isolated data bucket ensuring absolute privacy." />
                            <FAQItem question="How do residents get their login credentials?" answer="Once an admin adds a resident, they receive an automated WhatsApp and Email with an OTP verification link to set up their account." />
                            <FAQItem question="Can we manage multiple society accounts?" answer="Yes, committee members who live in multiple 'Guru Kripa Societies' can switch accounts with a single click in the app." />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
