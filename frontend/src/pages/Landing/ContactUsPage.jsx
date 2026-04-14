import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import axios from 'axios';

const ContactUsPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', societyName: '', mobile: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/public/contact', formData);
            setStatus({ type: 'success', message: 'Message sent! We will contact you soon.' });
            setFormData({ name: '', email: '', societyName: '', mobile: '', message: '' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to send. Please try again later.' });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-['Outfit']">
            <Navbar scrolled={true} />
            <main className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black text-[#464646]">We'd love to <span className="text-[#FD3752]">hear from you</span></h1>
                        {status && (
                            <div className={`p-4 rounded-xl font-bold ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {status.message}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            {[
                                { icon: Phone, title: "Support Hotline", val: "+91 91080 50000" },
                                { icon: Mail, title: "Email Support", val: "support@gurukripa.in" }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl flex items-start gap-6">
                                    <item.icon size={26} className="text-[#FD3752]" />
                                    <div><h4 className="font-bold text-[#464646] uppercase text-xs tracking-widest">{item.title}</h4><p className="text-[#464646] font-black text-xl mt-1">{item.val}</p></div>
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
                                <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" placeholder="Your Name" className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#FD3752] outline-none" />
                                <input required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} type="email" placeholder="Email Address" className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#FD3752] outline-none" />
                                <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows={5} placeholder="How can we help?" className="md:col-span-2 w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-[#FD3752] outline-none resize-none"></textarea>
                                <button disabled={loading} className="md:col-span-2 bg-[#FD3752] hover:bg-[#e02d45] text-white py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3">
                                    {loading ? <Loader2 className="animate-spin" /> : 'Send Message'} <ArrowRight size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContactUsPage;
