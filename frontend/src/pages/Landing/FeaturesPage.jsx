import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, MessageCircle, Settings, FileText, Calendar, Cloud, Bell } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const FeatureItem = ({ icon: Icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        viewport={{ once: true }}
        className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 hover:border-[#FD3752] hover:bg-white transition-all group shadow-sm hover:shadow-xl"
    >
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-[#FD3752] mb-6 group-hover:scale-110 group-hover:bg-[#FD3752] group-hover:text-white transition-all">
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold text-[#464646] mb-4">{title}</h3>
        <p className="text-slate-500 leading-relaxed text-sm font-medium">{desc}</p>
    </motion.div>
);

const FeaturesPage = () => {
    const detailedFeatures = [
        { title: "Automated Accounting", desc: "Full accounting suite with automated invoicing, online collections, and Tally integration.", icon: CreditCard },
        { title: "Smart Gatekeeper", desc: "Digital visitor management with QR codes and real-time approval requests.", icon: ShieldCheck },
        { title: "Resident App", desc: "Digital notice board, opinion polls, and group broadcast to keep everyone connected.", icon: MessageCircle },
        { title: "Facility Manager", desc: "Online booking for clubhouse, gym, and theater. Manage AMC of assets easily.", icon: Calendar },
        { title: "Helpdesk", desc: "Residents can raise complaints with photos, track status, and rate technicians.", icon: Settings },
        { title: "Cloud Storage", desc: "Store society registration papers, share certificates, and bye-laws securely.", icon: Cloud },
        { title: "Compliance", desc: "Digital records of all committee meetings, AGM minutes, and society resolutions.", icon: FileText },
        { title: "Instant Alerts", desc: "Automated alerts for maintenance dues, visitor arrival, and upcoming meetings.", icon: Bell }
    ];

    return (
        <div className="min-h-screen bg-white font-['Outfit']">
            <Navbar scrolled={true} />
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-20">
                        <h1 className="text-4xl md:text-6xl font-black text-[#464646] mb-6">Powerful <span className="text-[#FD3752]">Modules</span></h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Everything you need to automate your society operations and ensure transparency.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                        {detailedFeatures.map((f, i) => (
                            <FeatureItem key={i} icon={f.icon} title={f.title} desc={f.desc} delay={i * 0.1} />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FeaturesPage;
