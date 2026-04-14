import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
    const serviceBadges = [
        "Home Renovation Queries", "Interior Design Tips", "Interior Design Queries", "NRI RealEstate Guide",
        "Home Painting Guide", "Home Painting Queries", "Cleaning Services", "Kitchen Cleaning Services",
        "NRI RealEstate Queries", "Realestate Vastu Guide", "Personal Loan Guide", "Personal Loan Queries",
        "Sofa Cleaning Services", "Bathroom Cleaning Services", "Full House Cleaning Services",
        "Bill Payment Guide", "Realestate Legal Guide", "Realestate Legal Queries", "e-AASTHI BBMP",
        "Home Cleaning Guide", "Home Cleaning Queries", "AC Services", "Carpentry Services",
        "Due Diligence Service", "Carpentry Services Queries", "Electrician Services", "Electrician Services Queries", "Plumbing Services",
        "Plumbing Services Queries", "Lease Agreement", "Notary", "Notary Advocate", "Notary Affidavit"
    ];

    const propertyLinks = [
        {
            title: "Properties for Sale in Hyderabad",
            links: ["Flats for Sale in Kukatpally", "Flats for Sale in Hitech City", "Flats for Sale in Gachibowli", "Flats for Sale in Whitefields", "Flats for Sale in Himayath Nagar", "Flats for Sale in Sanath Nagar", "Flats for Sale in Hyderabad Below 45 Lakhs", "Flats For Sale Below 60 Lakhs In Hyderabad"]
        },
        {
            title: "Properties for Sale in Delhi",
            links: ["Flats for Sale in Greater Kailash", "Flats for Sale in Connaught Place", "Flats for Sale in Gulmohar Park", "Flats for Sale in Green Park Extension", "Flats for Sale in East of Kailash", "Flats for Sale in Lajpat Nagar I", "Flats for Sale in Delhi Below 45 Lakhs", "Flats For Sale Below 60 Lakhs In Delhi"]
        },
        {
            title: "Properties for Sale in Noida",
            links: ["Flats For Sale In Sector 75 Noida", "Flats For Sale In Sector 76 Noida", "Flats For Sale In Kendriya Vihar Sector 51 Noida", "Flats For Sale In Noida Sector 18", "Flats For Sale In Sector 107 Noida", "Flats For Sale In Sector 128 Noida", "Flats For Sale In Sector 150 Noida", "Flats for Sale in Greater Noida"]
        }
    ];

    return (
        <footer className="bg-white font-['Outfit'] border-t border-slate-100">
            {/* Service Badges Section */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-wrap gap-x-2 gap-y-3 justify-center md:justify-start">
                    {serviceBadges.map((badge, index) => (
                        <div key={index} className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-md text-[11px] font-semibold hover:bg-slate-200 cursor-pointer transition-colors border border-slate-200/50">
                            {badge}
                        </div>
                    ))}
                </div>
            </div>

            {/* Find / List Property Banner */}
            <div className="bg-[#f0f0f0] border-y border-[#e0e0e0]">
                <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#d4d4d4]">
                    <div className="flex-1 py-10 px-4 text-center flex flex-col items-center justify-center">
                        <h4 className="text-xl font-bold text-[#464646]">Find Property</h4>
                        <p className="text-sm text-slate-500 mt-1 mb-5">Select from thousands of options, without brokerage.</p>
                        <button className="bg-[#464646] hover:bg-[#333] text-white px-8 py-2.5 rounded shadow text-sm font-bold transition-colors">
                            Find Now
                        </button>
                    </div>
                    <div className="flex-1 py-10 px-4 text-center flex flex-col items-center justify-center">
                        <h4 className="text-xl font-bold text-[#464646]">List Your Property</h4>
                        <p className="text-sm text-slate-500 mt-1 mb-5">For Free. Without any brokerage.</p>
                        <button className="bg-[#464646] hover:bg-[#333] text-white px-8 py-2.5 rounded shadow text-sm font-bold transition-colors">
                            Free Posting
                        </button>
                    </div>
                </div>
            </div>

            {/* Links, App & Social Section */}
            <div className="bg-white py-10 border-b border-slate-200 flex flex-col items-center">
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[13px] font-semibold text-[#464646] mb-8 px-4">
                    <a href="#" className="hover:text-[#FD3752] transition-colors">About Us</a>
                    <a href="#" className="hover:text-[#FD3752] transition-colors">Careers</a>
                    <a href="#" className="hover:text-[#FD3752] transition-colors">Terms & Conditions</a>
                    <a href="#" className="hover:text-[#FD3752] transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-[#FD3752] transition-colors">Testimonials</a>
                    <a href="#" className="hover:text-[#FD3752] transition-colors">Sitemap</a>
                    <a href="#" className="hover:text-[#FD3752] transition-colors">FAQs</a>
                </div>
                
                <div className="flex gap-4 mb-6">
                    <div className="bg-black text-white px-3 py-1.5 rounded-md flex items-center justify-center cursor-pointer hover:bg-slate-800 h-9">
                        <span className="text-xs font-bold whitespace-nowrap">GET IT ON<br/><span className="text-[14px]">Google Play</span></span>
                    </div>
                    <div className="bg-black text-white px-4 py-1.5 rounded-md flex items-center justify-center cursor-pointer hover:bg-slate-800 h-9">
                        <span className="text-xs font-bold whitespace-nowrap opacity-80">Download on the<br/><span className="text-[14px] opacity-100">App Store</span></span>
                    </div>
                </div>

                <div className="flex gap-3 mb-6">
                    {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                        <a key={i} href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#464646] hover:text-white transition-colors">
                            <Icon size={14} className="fill-current stroke-0" />
                        </a>
                    ))}
                </div>

                <p className="text-xs font-medium text-slate-500">© 2013-25 Guru Kripa Technologies Solutions Pvt. Ltd.</p>
            </div>

            {/* Bottom Property SEO Links Matrix */}
            <div className="bg-white py-12 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
                    {propertyLinks.map((col, idx) => (
                        <div key={idx}>
                            <h5 className="font-bold text-[#464646] text-[13px] mb-4">{col.title}</h5>
                            <ul className="space-y-3">
                                {col.links.map((link, i) => (
                                    <li key={i}>
                                        <a href="#" className="text-[11px] text-[#464646] hover:underline font-medium opacity-80 hover:opacity-100">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Sticky Chat Button visual representation */}
            <div className="fixed bottom-6 right-6 w-14 h-14 bg-[#FD3752] rounded-full shadow-2xl shadow-[#FD3752]/40 flex items-center justify-center text-white cursor-pointer z-50 hover:bg-[#e02d45] hover:scale-105 transition-all">
                <div className="relative">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span className="absolute -top-1 -right-1 text-white text-[10px] bg-red-800 rounded-full w-4 h-4 flex items-center justify-center font-bold pb-0.5">%</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
