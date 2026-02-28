import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const ContactItem = ({ icon: Icon, title, val, sub }) => (
    <div className="flex gap-6 items-start">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <Icon size={24} />
        </div>
        <div>
            <h4 className="text-slate-900 dark:text-white font-black text-lg mb-1">{title}</h4>
            <p className="text-slate-700 dark:text-slate-200 font-bold">{val}</p>
            <p className="text-slate-500 text-sm mt-1 font-medium">{sub}</p>
        </div>
    </div>
);

import { API_BASE_URL } from '../../config';

const ContactUsPage = () => {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        societyName: '',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/public/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                setSent(true);
                setFormData({ name: '', phone: '', email: '', societyName: '', message: '' });
            } else {
                alert(data.error || "Failed to send message");
            }
        } catch (error) {
            console.error("Submit Error:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <Navbar scrolled={true} />
            <div className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">

                        {/* Left: Info */}
                        <div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-orange-600 dark:text-orange-400 font-black tracking-[0.2em] uppercase text-xs mb-4"
                            >
                                Get in Touch
                            </motion.p>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 leading-tight tracking-tight">Let's talk <br /> about your society.</h1>
                            <p className="text-slate-600 dark:text-slate-400 mb-12 text-lg font-medium">Whether you're a chairman ready to automate or a resident with a query, we're here to help.</p>

                            <div className="space-y-10">
                                <ContactItem
                                    icon={Mail}
                                    title="Email Us"
                                    val="Dipaksuthr@gmail.com"
                                    sub="Response time: within 2 hours"
                                />
                                <ContactItem
                                    icon={Phone}
                                    title="Call Support"
                                    val="+91 8306614268"
                                    sub="Mon - Sun, 9:00 AM - 9:00 PM"
                                />
                                <ContactItem
                                    icon={MapPin}
                                    title="Visit Office"
                                    val="Tragad, Ahmedabad, Gujarat 382470"
                                    sub="near Apollo International School"
                                />
                            </div>

                            <div className="mt-16 flex items-center gap-4 p-5 rounded-[2rem] bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 max-w-sm">
                                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"><MessageCircle size={24} /></div>
                                <div>
                                    <p className="text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase tracking-wider">Quick Demo?</p>
                                    <p className="text-slate-500 text-xs font-bold">Chat with us on WhatsApp for 5min setup.</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 md:p-14 relative shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 dark:opacity-5 -z-0 text-orange-600 dark:text-white"><Send size={150} /></div>

                            {sent ? (
                                <div className="text-center py-20 relative z-10">
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-6">
                                        <Send size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Message Sent!</h3>
                                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Thank you for reaching out. One of our community specialists will contact you shortly.</p>
                                    <button onClick={() => setSent(false)} className="mt-8 text-orange-600 font-black hover:underline uppercase tracking-widest text-xs">Send another message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors shadow-sm"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                                            <input
                                                required
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors shadow-sm"
                                                placeholder="+91 83066 14268"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Work Email</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors shadow-sm"
                                            placeholder="john@society.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Society Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.societyName}
                                            onChange={(e) => setFormData({ ...formData, societyName: e.target.value })}
                                            className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors shadow-sm"
                                            placeholder="Royal Palms Heights"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Message</label>
                                        <textarea
                                            rows="4"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors resize-none shadow-sm"
                                            placeholder="How can we help you?"
                                        ></textarea>
                                    </div>
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full py-5 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/30 active:scale-95 uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {loading ? 'SENDING...' : 'SEND MESSAGE'}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ContactUsPage;
