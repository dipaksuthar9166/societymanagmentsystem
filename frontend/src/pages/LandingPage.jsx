import React, { useEffect, useState } from 'react';
import Navbar from './Landing/Navbar';
import Footer from './Landing/Footer';
import HeroSection from './Landing/HeroSection';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
    Building2, FileText, Landmark, Scale, Armchair, 
    Globe, UserMinus, FileSpreadsheet, Home, PenTool, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const BannerFeature = () => (
    <div className="w-full bg-[#1b3f66] py-3 text-center text-white text-sm font-medium flex items-center justify-center gap-2">
        <span>Do you know how much <strong>loan</strong> you can get? Get maximum with <strong>Guru Kripa</strong></span>
        <button className="bg-white text-[#1b3f66] px-3 py-1 rounded text-xs font-bold uppercase">Check Eligibility</button>
    </div>
);

const ServicesRow = () => {
    const services = [
        { icon: Building2, label: "Builder Projects", sub: "New" },
        { icon: PenTool, label: "Sale Agreement", sub: "New" },
        { icon: Landmark, label: "Home Loan" },
        { icon: Scale, label: "Property Legal Services" },
        { icon: Armchair, label: "Home Interiors", sub: "Sale is live!" },
        { icon: Globe, label: "Guru Kripa For NRIs" }
    ];

    return (
        <section className="bg-white py-12 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-start flex-wrap gap-y-8">
                {services.map((item, i) => (
                    <div key={i} className="flex flex-col items-center w-1/3 md:w-auto cursor-pointer group">
                        <div className="relative mb-3 flex items-center justify-center w-16 h-16">
                            {item.sub && (
                                <span className={`absolute -top-3 px-2 py-0.5 rounded text-[10px] font-bold z-10 ${item.sub === 'Sale is live!' ? 'bg-orange-100 text-orange-600' : 'bg-orange-100 text-[#464646]'}`}>
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

const WhyUseNoBroker = () => {
    const reasons = [
        { icon: UserMinus, title: "Avoid Brokers", desc: "We directly connect you to verified owners to save brokerage" },
        { icon: FileSpreadsheet, title: "Free Listing", desc: "Easy listing process. Also using WhatsApp" },
        { icon: Home, title: "Shortlist without Visit", desc: "Extensive Information makes it easy" },
        { icon: FileText, title: "Rental Agreement", desc: "Assistance in creating Rental agreement & Paper work" }
    ];

    return (
        <section className="bg-[#fcfcfc] py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-center gap-4 mb-12">
                    <div className="w-16 h-px bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full border border-[#FD3752]"></div>
                    <h2 className="text-3xl font-semibold text-[#464646]">Why Use Guru Kripa</h2>
                    <div className="w-3 h-3 rounded-full border border-[#FD3752]"></div>
                    <div className="w-16 h-px bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center px-4 md:px-0">
                    {reasons.map((r, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-16 h-16 mb-6 text-[#464646] flex items-center justify-center">
                                <r.icon size={60} strokeWidth={1} />
                            </div>
                            <h3 className="text-lg font-bold text-[#464646] mb-2">{r.title}</h3>
                            <p className="text-sm text-[#464646] leading-relaxed max-w-[220px]">{r.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const BusinessAssistBanner = () => (
    <section className="bg-white py-16 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col items-center mb-10">
                <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="w-16 h-px bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full border border-[#FD3752]"></div>
                    <h2 className="text-[28px] font-semibold text-[#464646]">Guru Kripa Business Assist Plan For Builders</h2>
                    <div className="w-3 h-3 rounded-full border border-[#FD3752]"></div>
                    <div className="w-16 h-px bg-slate-200"></div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-16 flex-wrap">
                <div className="w-[300px] h-[180px] bg-slate-100 rounded flex items-center justify-center text-slate-300">
                    <Building2 size={80} strokeWidth={1}/>
                </div>
                <div className="flex flex-col items-start gap-4">
                    <p className="text-[#464646] font-medium">Get in touch with us to Sell or Rent Your Projects</p>
                    <button className="bg-[#FD3752] hover:bg-[#e02d45] text-white px-8 py-2.5 rounded font-bold text-[15px] transition-colors">
                        Enquire Now
                    </button>
                    <p className="text-xs text-slate-500 mt-2">For Builder Enquiries: +91 91080 50400</p>
                </div>
            </div>
        </div>
    </section>
);

const WeMakeADifference = () => {
    return (
        <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-center gap-4 mb-16">
                    <div className="w-16 h-px bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full border border-[#FD3752]"></div>
                    <h2 className="text-3xl font-semibold text-[#464646]">We Make A Difference</h2>
                    <div className="w-3 h-3 rounded-full border border-[#FD3752]"></div>
                    <div className="w-16 h-px bg-slate-200"></div>
                </div>

                <div className="flex justify-center gap-10 md:gap-32 flex-wrap">
                    {[
                        { val: "₹130 cr+", type: "Brokerage saved monthly" },
                        { val: "30 Lakh+", type: "Customers Connected Monthly" },
                        { val: "2 Lakh+", type: "New Listings Monthly" }
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center gap-6">
                            <div className="w-40 h-40 rounded-full border-[1.5px] border-[#FD3752] flex items-center justify-center text-[#FD3752] text-3xl font-bold">
                                {stat.val}
                            </div>
                            <span className="text-[#464646] font-medium text-[15px]">{stat.type}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const AppDownloadSection = () => {
    return (
        <section className="py-20 bg-white border-t border-slate-100">
            <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex-1 max-w-[400px]">
                    <div className="bg-slate-100 w-full aspect-[4/5] rounded-3xl flex items-center justify-center relative overflow-hidden border-8 border-black">
                        <span className="text-slate-400 font-bold">App Interface Mockup</span>
                        {/* Red header of the app */}
                        <div className="absolute top-0 left-0 right-0 h-14 bg-[#FD3752] flex items-center px-4 text-white">
                            <span className="font-bold">Guru Kripa</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 space-y-6">
                    <h2 className="text-[32px] font-semibold text-[#FD3752]">Find A New Home On The Go</h2>
                    <div>
                        <h3 className="text-xl font-bold text-[#464646]">Download our app</h3>
                        <p className="text-[#464646] font-medium mt-1">Where convenience is at your fingertip</p>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-12 cursor-pointer" loading="lazy" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-12 cursor-pointer" loading="lazy" />
                    </div>
                </div>
            </div>
        </section>
    );
};

const ReviewsSection = () => {
    const reviews = [
        { name: "Shubham Raibhandar", text: "The site really helps us to find good properties in the least amount of time without any headache of brokerage. I was so scared in Pune due to the issues of high deposit as well as brokerage." },
        { name: "Lisa Das", text: "It was a nice experience with Guru Kripa. They helped me to find a new home to stay as it was difficult for me, as an individual to find a home with friendly roommates. I thankfully Guru Kripa helped me." },
        { name: "Kishore", text: "Found Great Place to Stay via Guru Kripa provides a great place to stay with safe environment. If they show you something about property that is always same as it. No fake pictures." }
    ];

    return (
        <section className="bg-[#3F5E6B] py-20 mt-10">
            <div className="max-w-7xl mx-auto px-4">
                
                {/* Video Mockup */}
                <div className="max-w-3xl mx-auto mb-16 relative cursor-pointer group rounded overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-white/10 shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-luminosity"></div>
                    <div className="absolute top-4 left-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FD3752] flex items-center justify-center text-white font-bold">%</div>
                        <span className="text-white font-bold text-lg">Guru Kripa Reviews - Why our customers love us?</span>
                    </div>
                    <div className="w-20 h-14 bg-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-500 transition-colors z-10 shadow-lg">
                        <Play size={32} className="text-white fill-white" />
                    </div>
                </div>

                {/* Review Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((r, i) => (
                        <div key={i} className="bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                                    {r.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-[#464646] font-medium text-sm">{r.name}</h4>
                                    <div className="flex gap-0.5 text-[#009688]">
                                        {[1,2,3,4,5].map(s => <span key={s}>★</span>)}
                                    </div>
                                </div>
                            </div>
                            <h5 className="font-bold text-[#464646] mb-2">{r.name.includes('Shubham') ? 'Helps us to find good properties' : r.name.includes('Lisa') ? 'It\'s a nice experience' : 'Found Great Place to Stay via Guru Kripa'}</h5>
                            <p className="text-[#464646] text-[13px] leading-relaxed">
                                {`"${r.text}"`}
                            </p>
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

    useEffect(() => {
        window.scrollTo(0, 0);
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Guru Kripa",
        "url": "https://societymanagementsystem.vercel.app/",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://societymanagementsystem.vercel.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#464646] transition-colors duration-500 font-['Outfit'] selection:bg-[#FD3752] selection:text-white">
            <SEO 
                title="Guru Kripa - #1 Society Management System & Apartment Software" 
                description="Best Society Management System for gated communities. Manage billing, security, helpdesk, and communication with Guru Kripa. The most trusted society management software." 
                keywords="society management system, apartment management software, society billing software, gated community app, best society software, Guru Kripa"
                url="https://societymanagementsystem.vercel.app"
                schemaMarkup={schemaMarkup}
                type="website" 
            />
            {/* Scroll Progress Indicator */}
            <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[#FD3752] z-[200] origin-left" style={{ scaleX }} />

            <Navbar scrolled={scrolled} />

            <main>
                <HeroSection />
                <BannerFeature />
                <ServicesRow />
                <WhyUseNoBroker />
                <BusinessAssistBanner />
                <WeMakeADifference />
                <AppDownloadSection />
                <ReviewsSection />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
