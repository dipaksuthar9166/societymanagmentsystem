import React from 'react';
import { Palmtree, Dumbbell, Coffee, Car } from 'lucide-react';
import { motion } from 'framer-motion';

const FacilityShowcase = () => {
    const facilities = [
        {
            name: "Clubhouse & Events",
            desc: "Book society halls for birthdays or events directly from the app.",
            icon: Coffee,
            img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2000&auto=format&fit=crop"
        },
        {
            name: "Elite Gym & Spa",
            desc: "Track gym occupancy and book personal training sessions.",
            icon: Dumbbell,
            img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000&auto=format&fit=crop"
        },
        {
            name: "Swimming Pool",
            desc: "Check pool timings and status. Automated PH level monitoring logs.",
            icon: Palmtree,
            img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=2000&auto=format&fit=crop"
        },
        {
            name: "Parking Management",
            desc: "Smart parking stickers and real-time empty slot tracking for residents.",
            icon: Car,
            img: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2000&auto=format&fit=crop"
        }
    ];

    return (
        <section className="py-24 bg-white font-['Outfit']">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-[#464646] mb-4">Manage Your <span className="text-[#009688]">Amenities</span></h2>
                    <p className="text-slate-500 font-medium">Full control of common shared facilities in your palm.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {facilities.map((fac, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-xl"
                        >
                            <img src={fac.img} alt={fac.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white mb-4 group-hover:bg-[#FD3752] transition-colors">
                                    <fac.icon size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{fac.name}</h3>
                                <p className="text-xs text-white/80 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">
                                    {fac.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FacilityShowcase;
