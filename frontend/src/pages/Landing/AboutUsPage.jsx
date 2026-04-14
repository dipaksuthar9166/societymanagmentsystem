import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Heart, Award } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutUsPage = () => {
    return (
        <div className="min-h-screen bg-white font-['Outfit']">
            <Navbar scrolled={true} />
            <main className="pt-32 pb-20">
                <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl md:text-5xl font-black text-[#464646] mb-8 leading-tight">Redefining <span className="text-[#FD3752]">Technology</span></h1>
                        <p className="text-lg text-slate-600 font-medium leading-relaxed mb-6">Guru Kripa was born out of a simple problem: Managing a residential society shouldn't be a full-time job.</p>
                        <p className="text-lg text-slate-600 font-medium leading-relaxed">We automate maintenance collection and visitor security so you can focus on building a happy community.</p>
                    </motion.div>
                    <div className="bg-slate-100 rounded-[3rem] aspect-square flex items-center justify-center border-8 border-white shadow-xl">
                        <Users size={120} className="text-slate-300" strokeWidth={0.5} />
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default AboutUsPage;
