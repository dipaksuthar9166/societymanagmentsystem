import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ scrolled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navLinks = [
        { name: 'Features', path: '/features' },
        { name: 'Security', path: '/security' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' }
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-white/80 backdrop-blur-md py-5'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-[#FD3752] flex items-center justify-center text-white shadow-lg shadow-[#FD3752]/20 rotate-[-5deg] group-hover:rotate-0 transition-transform">
                        <Building2 size={24} strokeWidth={2.5}/>
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-[#464646]">
                        Guru<span className="text-[#FD3752]">Kripa</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name} 
                            to={link.path}
                            className={`text-[15px] font-semibold transition-colors ${location.pathname === link.path ? 'text-[#FD3752]' : 'text-[#464646] hover:text-[#FD3752]'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-[#464646] hover:text-[#FD3752] font-bold text-sm px-4 py-2 transition-colors">
                        <User size={18} />
                        Log In
                    </button>
                    <Link to="/demo" className="bg-[#009688] hover:bg-[#00897b] text-white px-6 py-2.5 rounded-md font-bold text-sm shadow-sm transition-all hover:scale-105">
                        Book a Demo
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button className="lg:hidden p-2 text-[#464646]" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-100 shadow-2xl py-6 px-4 flex flex-col gap-4 overflow-hidden"
                    >
                        {navLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className="text-lg font-semibold text-[#464646] py-2 border-b border-slate-50"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-3 pt-4">
                            <button onClick={() => { setIsOpen(false); navigate('/login'); }} className="flex items-center justify-center gap-2 py-3 font-bold text-[#464646] border border-slate-200 rounded-md">
                                <User size={18} /> Log In
                            </button>
                            <Link to="/demo" onClick={() => setIsOpen(false)} className="bg-[#009688] text-white py-3 text-center font-bold rounded-md shadow-lg">
                                Book a Demo
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
