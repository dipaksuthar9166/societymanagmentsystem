import React from 'react';
import { Play, Laptop, CheckCircle2 } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const DemoPortal = () => {
    return (
        <div className="min-h-screen bg-white font-['Outfit']">
            <Navbar scrolled={true} />
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                        <div className="space-y-8">
                            <h1 className="text-4xl md:text-6xl font-black text-[#464646]">Future of <span className="text-[#FD3752]">Societies</span></h1>
                            <p className="text-lg text-slate-500 font-medium">Explore our intuitive resident app and powerful admin dashboard live.</p>
                            <div className="flex flex-col gap-4">
                                {["15-minute walkthrough", "Explore all premium modules"].map((text, i) => (
                                    <div key={i} className="flex items-center gap-3 text-[#464646] font-bold"><CheckCircle2 size={20} className="text-emerald-500" />{text}</div>
                                ))}
                            </div>
                            <button className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-[#FD3752] transition-all">
                                <Laptop size={20} /> Watch Product Tour
                            </button>
                        </div>
                        <div className="bg-slate-100 rounded-[2.5rem] aspect-video border-[12px] border-slate-900 overflow-hidden shadow-2xl relative">
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Play size={32} fill="currentColor" className="text-white" /></div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DemoPortal;
