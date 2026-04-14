import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Laptop, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import axios from 'axios';

const DemoPortal = () => {
    const [formData, setFormData] = useState({ name: '', phone: '', societyName: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleDemoRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/public/demo', formData);
            setSuccess(true);
            setFormData({ name: '', phone: '', societyName: '' });
        } catch (err) {
            alert("Submission failed. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-white font-['Outfit']">
            <Navbar scrolled={true} />
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                        <div className="space-y-8">
                            <h1 className="text-4xl md:text-6xl font-black text-[#464646]">Future of <span className="text-[#FD3752]">Societies</span></h1>
                            <p className="text-lg text-slate-500 font-medium">Explore our intuitive resident app and powerful admin dashboard live with an expert.</p>
                            <div className="flex flex-col gap-4">
                                {["15-minute personalized tour", "Explore all 8 premium modules", "Zero cost consultation"].map((text, i) => (
                                    <div key={i} className="flex items-center gap-3 text-[#464646] font-bold">
                                        <CheckCircle2 size={20} className="text-emerald-500" />{text}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-900 p-10 md:p-14 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                            {success ? (
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40}/></div>
                                    <h2 className="text-3xl font-bold">Request Received!</h2>
                                    <p className="text-slate-400 font-medium">Our expert will call you on your mobile within 24 hours.</p>
                                    <button onClick={() => setSuccess(false)} className="text-[#FD3752] font-bold underline">Submit another request</button>
                                </div>
                            ) : (
                                <form className="space-y-6 relative z-10" onSubmit={handleDemoRequest}>
                                    <h3 className="text-2xl font-bold mb-8">Book Your Free Demo</h3>
                                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" placeholder="Full Name" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-[#FD3752] outline-none transition-all" />
                                    <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} type="tel" placeholder="Mobile Number" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-[#FD3752] outline-none transition-all" />
                                    <input required value={formData.societyName} onChange={(e) => setFormData({...formData, societyName: e.target.value})} type="text" placeholder="Society Name" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-[#FD3752] outline-none transition-all" />
                                    <button disabled={loading} className="w-full bg-[#FD3752] py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#e02d45] transition-all flex items-center justify-center gap-3">
                                        {loading ? <Loader2 className="animate-spin" /> : 'Get Callback'} <ArrowRight size={20} />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DemoPortal;
