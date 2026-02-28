import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import Navbar from './Landing/Navbar';
import Footer from './Landing/Footer';
import HeroSection from './Landing/HeroSection';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Zap, BarChart3, Users,
    ArrowRight, Star, Heart, Building2, Phone,
    CheckCircle, Settings, Clock, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Components mimicking the template ---

const TrustSection = ({ brands = [] }) => (
    <section className="py-16 bg-white dark:bg-slate-900 overflow-hidden border-y border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Global Partners</h3>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {(brands.length > 0 ? brands : ['Gecina', 'Booking.com', 'Brookfield', 'Century 21', 'JLL']).map((brand, i) => (
                    <span key={i} className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white hover:text-orange-500 cursor-default">{brand}</span>
                ))}
            </div>
        </div>
    </section>
);

const Counter = ({ value, label, suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value);
        if (isNaN(end) || end === 0) return;

        let totalMiliseconds = 2000;
        let incrementTime = Math.max(totalMiliseconds / end, 10);

        let timer = setInterval(() => {
            start += Math.ceil(end / 100);
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 30);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="text-center space-y-2">
            <div className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
                {count}{suffix}
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">{label}</p>
        </div>
    );
};

const LiveStatsSection = ({ stats }) => (
    <section className="py-24 bg-white dark:bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-20">
                <Counter value={stats?.societies || 250} label="Active Societies" suffix="+" />
                <Counter value={stats?.residents || 12000} label="Happy Residents" suffix="+" />
                <Counter value={99} label="System Uptime" suffix="%" />
                <Counter value={stats?.revenue ? Math.floor(stats.revenue / 1000) : 500} label="Revenue Managed" suffix="k+" />
            </div>
        </div>
    </section>
);

const LivePulse = () => {
    const [index, setIndex] = useState(0);
    const notifications = [
        "New Society: Green Valley Apartments just joined!",
        "Maintenance Payment of ₹4,500 processed for Flat 402.",
        "Security Alert: Visitor entry approved at Blue Ridge.",
        "New Feature: Automated GST billing is now live!",
        "Recent Join: 50+ residents joined Nexus OS today."
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % notifications.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed bottom-8 left-8 z-[100] hidden md:block">
            <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 flex items-center gap-4 max-w-sm"
            >
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 relative">
                    <Clock size={20} />
                    <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Live Pulse</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{notifications[index]}</p>
                </div>
            </motion.div>
        </div>
    );
};

const ComparisonSection = () => {
    const points = [
        { label: "Visitor Management", manual: "Manual Registers & Pens", nexus: "QR-based Instant Pass" },
        { label: "Account Billing", manual: "Paper Invoices & Cash", nexus: "Auto-GST Bills & Online Pay" },
        { label: "Staff Tracking", manual: "Physical Attendance Books", nexus: "Biometric Facial Recognition" },
        { label: "SOS & Security", manual: "Shouting or Calling Guards", nexus: "One-Tap Panic Button (App)" },
        { label: "Complaint Resolution", manual: "Finding the Secretary", nexus: "Digital Ticket Tracking" }
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
            <div className="max-w-5xl mx-auto px-6 space-y-16">
                <div className="text-center space-y-4">
                    <span className="text-orange-500 font-bold uppercase tracking-widest text-sm">The Transformation</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">Legacy vs <span className="text-orange-500">Nexus OS</span></h2>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5">
                    <div className="grid grid-cols-3 bg-slate-900 text-white p-6 md:p-8 font-black uppercase tracking-widest text-[10px] md:text-xs">
                        <div className="col-span-1">Feature</div>
                        <div className="text-slate-500">Legacy Way</div>
                        <div className="text-orange-500">Nexus Way</div>
                    </div>
                    {points.map((p, i) => (
                        <div key={i} className="grid grid-cols-3 p-6 md:p-8 border-t border-slate-100 dark:border-white/5 items-center group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="text-sm font-black text-slate-900 dark:text-white">{p.label}</div>
                            <div className="text-xs font-bold text-slate-400 line-through decoration-slate-300">{p.manual}</div>
                            <div className="text-sm font-black text-orange-600 dark:text-orange-400 flex items-center gap-2">
                                <CheckCircle size={16} />
                                {p.nexus}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const AppShowcase = () => {
    return (
        <section className="py-24 bg-white dark:bg-black overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <span className="text-orange-500 font-bold uppercase tracking-widest text-sm">Mobile First</span>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight">
                                Your Society, <br />
                                <span className="text-orange-500 italic">In Your Pocket.</span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-lg">
                                Designed for absolute convenience. Approve guests, book the clubhouse, and pay maintenance with zero friction on our Resident App.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { title: "Fast Booking", desc: "Amenities booked in 10s" },
                                { title: "Instant Approval", desc: "QR codes for visitors" },
                                { title: "Live Tracking", desc: "Real-time courier logs" },
                                { title: "Society Chat", desc: "Connect with neighbors" }
                            ].map((f, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="mt-1 text-orange-500">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-wider">{f.title}</p>
                                        <p className="text-sm text-slate-500 font-medium">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-transform shadow-xl">
                                <div className="text-left leading-none">
                                    <p className="text-[10px] uppercase font-bold opacity-60">Get it on</p>
                                    <p className="text-lg">Google Play</p>
                                </div>
                            </button>
                            <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-transform shadow-xl">
                                <div className="text-left leading-none">
                                    <p className="text-[10px] uppercase font-bold opacity-60">Download on</p>
                                    <p className="text-lg">App Store</p>
                                </div>
                            </button>
                        </div>
                    </motion.div>

                    <div className="relative flex justify-center lg:justify-end">
                        <div className="absolute inset-0 bg-orange-500/20 blur-[100px] rounded-full scale-75"></div>
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            className="relative z-10 w-[300px] h-[600px] bg-slate-900 rounded-[3.5rem] p-4 border-[8px] border-slate-950 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
                        >
                            <div className="w-1/2 h-7 bg-slate-950 absolute top-0 left-1/2 -translate-x-1/2 z-20 rounded-b-2xl flex justify-center items-end pb-1.5">
                                <div className="w-12 h-1 bg-white/20 rounded-full"></div>
                            </div>
                            <div className="w-full h-full bg-slate-100 rounded-[2.5rem] overflow-hidden relative">
                                {/* App UI Simulation */}
                                <div className="p-6 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/20"></div>
                                        <div className="h-4 w-20 bg-slate-200 rounded-full"></div>
                                    </div>
                                    <div className="h-32 w-full bg-slate-900 rounded-2xl p-4 flex flex-col justify-end gap-2">
                                        <div className="h-2 w-1/2 bg-white/20 rounded-full"></div>
                                        <div className="h-4 w-3/4 bg-orange-500 rounded-full"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-24 bg-white rounded-xl shadow-sm p-3 space-y-2">
                                                <div className="w-6 h-6 rounded-lg bg-orange-100"></div>
                                                <div className="h-1.5 w-full bg-slate-100"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-32 w-full bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
                                        <div className="h-2 w-1/3 bg-slate-200"></div>
                                        <div className="flex-1 bg-slate-50 rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const FeatureCard = ({ title, img, price, badge }) => (
    <div className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-slate-100 dark:border-white/5">
        <div className="relative h-64 overflow-hidden">
            <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {badge}
            </div>
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Active
            </div>
        </div>
        <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{title}</h3>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Building2 size={16} />
                <span>Managed Society</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-4">
                <p className="text-orange-500 font-black text-lg">{price}</p>
                <button className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-orange-500 transition-colors">
                    View Details
                </button>
            </div>
        </div>
    </div>
);

const ProjectSection = ({ projects = [] }) => (
    <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
            <div className="text-center space-y-4">
                <span className="text-orange-500 font-bold uppercase tracking-widest text-sm">Our Project</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">Our Complete Project</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {projects.length > 0 ? projects.map((project, i) => (
                    <FeatureCard
                        key={i}
                        title={project.title}
                        price={project.price}
                        badge={project.badge}
                        img={project.img}
                    />
                )) : (
                    <>
                        <FeatureCard title="Basanti Palace" price="98% Uptime" badge="Premium" img="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80" />
                        <FeatureCard title="Gulshan Garden" price="450 Units" badge="Gold" img="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80" />
                        <FeatureCard title="Dhanmondi Home" price="Secure" badge="Platinum" img="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" />
                        <FeatureCard title="Motijheel Villa" price="Automated" badge="New" img="https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&q=80" />
                    </>
                )}
            </div>
        </div>
    </section>
);

const ServiceCard = ({ icon: Icon, title, desc }) => (
    <div className="p-8 bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-white/5 hover:-translate-y-2 transition-transform duration-300 group text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        <div className="w-16 h-16 mx-auto bg-slate-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-500">
            <Icon size={32} className="text-slate-900 dark:text-white group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const ServiceSection = () => (
    <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
            <div className="text-center space-y-4">
                <span className="text-orange-500 font-bold uppercase tracking-widest text-sm">Our Service</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">Key Strength of Service</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <ServiceCard icon={Zap} title="Fast Deployment" desc="Deploy Nexus OS in your society within 24 hours with our express setup team." />
                <ServiceCard icon={Phone} title="24/7 Support" desc="Our SOC (Security Operations Center) is always active to help you." />
                <ServiceCard icon={ShieldCheck} title="Ironclad Security" desc="Zero-breach record with end-to-end encryption for all resident data." />
                <ServiceCard icon={Users} title="Community First" desc="Features designed to bring residents together and foster harmony." />
            </div>
        </div>
    </section>
);

const AboutSection = () => {
    const navigate = useNavigate();
    return (
        <section className="py-24 bg-slate-900 relative overflow-hidden text-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-0 items-center">
                    <div className="relative h-[600px] rounded-l-[3rem] overflow-hidden hidden lg:block">
                        <img src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&q=80" className="w-full h-full object-cover" alt="About" />
                        <div className="absolute inset-0 bg-indigo-900/20 mix-blend-multiply"></div>
                    </div>

                    <div className="bg-slate-950 p-12 lg:p-20 rounded-[3rem] lg:-ml-20 relative z-10 shadow-2xl border border-white/10 space-y-8">
                        <div>
                            <span className="text-orange-500 font-bold uppercase tracking-widest text-sm">About Us</span>
                            <h2 className="text-4xl md:text-5xl font-black mt-2">Why People Choose Us</h2>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            We provide awesome service at your door that's why every people know our company and trust very much.
                            Nexus OS delivers automated billing, smart security, and seamless facility management.
                        </p>

                        <div className="pt-8 relative">
                            <button onClick={() => navigate('/about')} className="bg-orange-500 text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-orange-600 transition-colors shadow-lg">
                                Explore More
                            </button>

                            {/* Floating Hotline Box */}
                            <div className="absolute -bottom-32 -right-8 lg:-right-32 bg-orange-500 p-8 rounded-tl-3xl shadow-xl hidden sm:block">
                                <div className="text-center text-white">
                                    <Phone size={32} className="mx-auto mb-2" />
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-90">Our Hotline</p>
                                    <p className="text-xl font-black">+0123 4567</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};










{/* Toggle */ }











const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 dark:border-white/5 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-8 flex justify-between items-center text-left group"
            >
                <span className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight">{question}</span>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={24} className="text-slate-400" />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pb-8"
                    >
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQSection = () => {
    const faqs = [
        { q: "How secure is resident data?", a: "We use AES-256 encryption. Your society data is private and never shared. We are ISO 27001 certified for information security standards." },
        { q: "How long does setup take?", a: "Typical setup takes less than 24 hours. Our ground team helps map your residents and units so you can go live instantly." },
        { q: "Can we use it for multiple buildings?", a: "Yes, Nexus OS is designed for single-tower buildings as well as large multi-phase townships with different wings." },
        { q: "Do residents need training?", a: "The Resident App is intuitive. We provide on-site demos, video tutorials, and 24/7 WhatsApp support for any queries." }
    ];

    return (
        <section className="py-24 bg-white dark:bg-black">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-orange-500 font-bold uppercase tracking-widest text-sm">Support & Help</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">Common <span className="text-orange-500 italic">Questions</span></h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {faqs.map((faq, i) => <FAQItem key={i} question={faq.q} answer={faq.a} />)}
                </div>
            </div>
        </section>
    );
};

const TestimonialsSection = ({ testimonials = [] }) => (
    <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
            <div className="space-y-4">
                <span className="text-orange-500 font-bold uppercase tracking-widest text-sm">Testimonials</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">Word From Our Happy Client</h2>
            </div>

            {testimonials.length > 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-xl border border-slate-100 dark:border-white/5 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-serif">
                        "
                    </div>

                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                        "{testimonials[0].quote}"
                    </p>

                    <div className="mt-8 flex justify-center items-center gap-4">
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <img src={testimonials[0].image} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black text-slate-900 dark:text-white">{testimonials[0].name}</p>
                            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">{testimonials[0].role}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-xl border border-slate-100 dark:border-white/5 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-serif">
                        "
                    </div>

                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                        "Nexus OS is the one-stop solution for any society. It has transformed our community management, making it secure, transparent, and absolutely seamless. Highly recommended!"
                    </p>

                    <div className="mt-8 flex justify-center items-center gap-4">
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" alt="User" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black text-slate-900 dark:text-white">Renu S.</p>
                            <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">Secretary, Gokuldham</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </section>
);

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [trustBrands, setTrustBrands] = useState([]);
    const [projects, setProjects] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Fetch Dynamic Data
        const fetchData = async () => {
            try {
                const baseUrl = API_BASE_URL.replace('/api', '');

                // Fetch Stats
                fetch(`${baseUrl}/api/public/stats`)
                    .then(res => res.json())
                    .then(data => setStats(data))
                    .catch(e => console.error("Stats fetch failed", e));

                // Fetch Trust Brands
                fetch(`${baseUrl}/api/public/trust`)
                    .then(res => res.json())
                    .then(data => setTrustBrands(data))
                    .catch(e => console.error("Trust fetch failed", e));

                // Fetch Projects
                fetch(`${baseUrl}/api/public/projects`)
                    .then(res => res.json())
                    .then(data => setProjects(data))
                    .catch(e => console.error("Projects fetch failed", e));

                // Fetch Testimonials
                fetch(`${baseUrl}/api/public/testimonials`)
                    .then(res => res.json())
                    .then(data => setTestimonials(data))
                    .catch(e => console.error("Testimonials fetch failed", e));
            } catch (err) {
                console.error("Error fetching landing page data", err);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-500 font-['Outfit'] selection:bg-orange-500 selection:text-white">
            <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-orange-500 z-[100] origin-left" style={{ scaleX }} />

            <Navbar scrolled={true} />
            <LivePulse />

            <HeroSection stats={stats} />
            <LiveStatsSection stats={stats} />
            <ComparisonSection />
            <AppShowcase />
            <TrustSection brands={trustBrands} />
            <ProjectSection projects={projects} />
            <ServiceSection />
            <AboutSection />
            <TestimonialsSection testimonials={testimonials} />
            <FAQSection />

            <Footer />
        </div>
    );
};

export default LandingPage;
