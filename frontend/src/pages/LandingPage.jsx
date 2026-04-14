import React, { useEffect, useState } from 'react';
import Navbar from './Landing/Navbar';
import Footer from './Landing/Footer';
import HeroSection from './Landing/HeroSection';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
    Building2, FileText, Landmark, Scale, Armchair, 
    Globe, FileSpreadsheet, Play, ChevronDown
} from 'lucide-react';
import SEO from '../components/SEO';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/public';

const ServicesRow = () => {
    const services = [
        { icon: Landmark, label: "Maintenance Billing", sub: "Auto" },
        { icon: Scale, label: "Security & Visitor", sub: "Gatekeeper" },
        { icon: FileText, label: "Complaint Helpdesk" },
        { icon: Globe, label: "Notice Board" },
        { icon: Armchair, label: "Clubhouse Booking", sub: "Live!" },
        { icon: Building2, label: "Asset Management" }
    ];

    return (
        <section className="bg-white py-12 border-b border-slate-100 font-['Outfit']">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-start flex-wrap gap-y-8">
                {services.map((item, i) => (
                    <div key={i} className="flex flex-col items-center w-1/3 md:w-auto cursor-pointer group">
                        <div className="relative mb-3 flex items-center justify-center w-16 h-16">
                            {item.sub && (
                                <span className={`absolute -top-3 px-2 py-0.5 rounded text-[10px] font-bold z-10 ${item.sub === 'Live!' ? 'bg-orange-100 text-orange-600' : 'bg-red-50 text-[#FD3752]'}`}>
                                    {item.sub}
                                </span>
                            )}
                            <item.icon size={40} className="text-[#464646] group-hover:scale-110 transition-transform group-hover:text-[#FD3752] stroke-[1.5]" />
                        </div>
                        <span className="text-sm font-semibold text-[#464646] text-center">{item.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
};

const WeMakeADifference = ({ stats }) => {
    return (
        <section className="bg-white py-16 font-['Outfit']">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-4 mb-20">
                    <div className="w-16 h-px bg-slate-200"></div>
                    <h2 className="text-3xl font-bold text-[#464646]">We Empower Communities</h2>
                    <div className="w-16 h-px bg-slate-200"></div>
                </div>
                <div className="flex justify-center gap-10 md:gap-32 flex-wrap">
                    {[
                        { val: `${stats.societies}+`, type: "Societies Managed" },
                        { val: `${(stats.residents / 1000).toFixed(1)}k+`, type: "Units Registered" },
                        { val: `₹${(stats.revenue / 100000).toFixed(1)}L+`, type: "Monthly Billing" }
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center gap-6">
                            <div className="w-40 h-40 rounded-full border-[1.5px] border-[#FD3752] flex items-center justify-center text-[#FD3752] text-3xl font-black shadow-xl shadow-red-50">
                                {stat.val}
                            </div>
                            <span className="text-[#464646] font-bold text-[15px] uppercase tracking-wider">{stat.type}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ReviewsSection = ({ testimonials }) => {
    return (
        <section className="bg-slate-900 py-24 font-['Outfit']">
            <div className="max-w-7xl mx-auto px-4 text-white text-center">
                <h2 className="text-3xl md:text-5xl font-black mb-16">Trusted by Society Leaders</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((r, i) => (
                        <div key={i} className="bg-white/5 p-10 rounded-[3rem] border border-white/10 text-left">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={r.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'} className="w-14 h-14 rounded-2xl border-2 border-[#FD3752]" alt="" />
                                <div><h4 className="font-bold">{r.name}</h4><p className="text-xs text-slate-400">{r.role}</p></div>
                            </div>
                            <p className="text-slate-300 italic font-medium leading-relaxed">"{r.quote}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQSection = ({ faqs }) => {
    const [openIdx, setOpenIdx] = useState(0);
    return (
        <section className="bg-white py-24 font-['Outfit']">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black text-[#464646]">Common Questions</h2>
                    <p className="text-slate-500 font-medium italic">Backend Connected FAQ Section</p>
                </div>
                <div className="space-y-4">
                    {faqs.map((f, i) => (
                        <div key={i} className="border border-slate-100 rounded-[2rem] overflow-hidden hover:border-[#FD3752] transition-colors">
                            <button 
                                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                                className="w-full text-left px-8 py-6 flex items-center justify-between bg-white group"
                            >
                                <span className={`text-lg font-bold transition-colors ${openIdx === i ? 'text-[#FD3752]' : 'text-[#464646]'}`}>{f.question}</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openIdx === i ? 'bg-[#FD3752] text-white rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                                    <ChevronDown size={20} />
                                </div>
                            </button>
                            {openIdx === i && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-8 pb-8 text-slate-500 font-medium leading-relaxed">
                                    {f.answer}
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const [scrolled, setScrolled] = useState(false);
    const [stats, setStats] = useState({ societies: 500, residents: 15000, revenue: 5000000 });
    const [testimonials, setTestimonials] = useState([]);
    const [faqs, setFaqs] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        
        const fetchData = async () => {
            try {
                const [statsRes, testRes, faqRes] = await Promise.all([
                    axios.get(`${API_URL}/stats`),
                    axios.get(`${API_URL}/testimonials`),
                    axios.get(`${API_URL}/faqs`)
                ]);
                setStats(statsRes.data);
                setTestimonials(testRes.data);
                setFaqs(faqRes.data);
            } catch (err) {
                console.error("API Fetch Error:", err);
            }
        };
        fetchData();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white text-[#464646] font-['Outfit'] selection:bg-[#FD3752] selection:text-white">
            <SEO title="Guru Kripa - #1 Society Management System" />
            <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[#FD3752] z-[200] origin-left" style={{ scaleX }} />
            <Navbar scrolled={scrolled} />
            <main>
                <HeroSection />
                <ServicesRow />
                <WeMakeADifference stats={stats} />
                <ReviewsSection testimonials={testimonials} />
                <FAQSection faqs={faqs} />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
