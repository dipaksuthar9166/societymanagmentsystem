import React, { useEffect, useState } from 'react';
import Navbar from './Landing/Navbar';
import Footer from './Landing/Footer';
import HeroSection from './Landing/HeroSection';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
    Building2, FileText, Landmark, Scale, Armchair, 
    Globe, FileSpreadsheet, Play, CheckCircle2
} from 'lucide-react';
import SEO from '../components/SEO';
import axios from 'axios';

// Updated API BASE URL
const API_URL = 'http://localhost:5000/api/public'; // Change to production URL later

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
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-center gap-4 mb-16">
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
            <div className="max-w-7xl mx-auto px-4 text-white">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-4">Trusted by Society Leaders</h2>
                    <p className="text-slate-400 font-medium">Real stories from residential committees across India.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((r, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:border-[#FD3752] transition-colors group">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={r.image} alt={r.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FD3752]" />
                                <div>
                                    <h4 className="font-bold">{r.name}</h4>
                                    <p className="text-xs text-slate-400">{r.role}</p>
                                </div>
                            </div>
                            <p className="text-slate-300 leading-relaxed italic">"{r.quote}"</p>
                            <div className="flex gap-1 mt-6 text-yellow-500">
                                {[1,2,3,4,5].map(s => <span key={s}>★</span>)}
                            </div>
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
    const [stats, setStats] = useState({ societies: 500, residents: 15000, revenue: 500000 });
    const [testimonials, setTestimonials] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        
        // Fetch Real-time Stats & Testimonials
        const fetchData = async () => {
            try {
                const [statsRes, testRes] = await Promise.all([
                    axios.get(`${API_URL}/stats`),
                    axios.get(`${API_URL}/testimonials`)
                ]);
                setStats(statsRes.data);
                setTestimonials(testRes.data);
            } catch (err) {
                console.error("API Fetch Error:", err);
            }
        };
        fetchData();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white text-[#464646] font-['Outfit'] selection:bg-[#FD3752] selection:text-white">
            <SEO title="Guru Kripa - #1 Society Management System" description="Best Society Management Software for apartments." />
            
            <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[#FD3752] z-[200] origin-left" style={{ scaleX }} />
            <Navbar scrolled={scrolled} />

            <main>
                <HeroSection />
                <ServicesRow />
                
                {/* Why Guru Kripa Section */}
                <section className="bg-[#fcfcfc] py-24">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <h2 className="text-4xl font-black mb-16">Why Societies Trust Guru Kripa</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                            {[
                                { title: "Automated Billing", icon: Landmark, desc: "Zero manual calculation errors in maintenance." },
                                { title: "Gatekeeper App", icon: Scale, desc: "Verify every visitor in a single click." },
                                { title: "Smart Accounting", icon: FileSpreadsheet, desc: "Bank-linked transactions & audit-ready reports." },
                                { title: "Digital Notices", icon: Globe, desc: "Broadcast alerts instantly on mobile app." }
                            ].map((item, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="w-16 h-16 bg-red-50 text-[#FD3752] rounded-2xl flex items-center justify-center mx-auto mb-6"><item.icon size={32}/></div>
                                    <h3 className="text-xl font-bold">{item.title}</h3>
                                    <p className="text-slate-500 font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <WeMakeADifference stats={stats} />
                <ReviewsSection testimonials={testimonials} />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
