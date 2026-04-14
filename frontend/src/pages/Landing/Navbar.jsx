import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Percent, Menu, X, Coins } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ scrolled }) => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 bg-white border-b border-gray-200 shadow-sm py-3 font-['Outfit']`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
                
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FD3752] rounded flex items-center justify-center text-white">
                        <Home size={24} strokeWidth={2.5}/>
                    </div>
                    <span className="text-xl md:text-2xl font-bold text-[#464646]">
                        Guru<span className="text-[#FD3752]">Kripa</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-6">
                    {/* Pay Rent */}
                    <button className="flex items-center gap-2 group px-2 py-1">
                        <div className="bg-[#FFF4E5] p-1.5 rounded text-orange-500">
                            <Coins size={18} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-semibold text-[#464646]">Pay Rent</span>
                            <p className="text-[10px] text-slate-500 font-medium">Earn Cashback <Percent size={10} className="inline"/></p>
                        </div>
                    </button>

                    <div className="w-px h-6 bg-slate-300"></div>

                    {/* Post Free Ad */}
                    <button className="flex items-center gap-2 bg-[#009688] hover:bg-[#00897b] transition-colors text-white px-4 py-2 rounded shadow text-sm font-bold tracking-wide">
                        Post Free Property Ad
                    </button>

                    <div className="w-px h-6 bg-slate-300"></div>

                    {/* Sign Up / Login */}
                    <button 
                        onClick={() => navigate('/login')} 
                        className="text-sm font-bold text-[#464646] hover:text-[#FD3752] transition-colors"
                    >
                        Sign up<span className="text-slate-400 font-normal mx-1">/</span>Log in
                    </button>

                    <div className="w-px h-6 bg-slate-300"></div>

                    {/* Menu Trigger */}
                    <button className="flex items-center gap-2 text-sm font-bold text-[#464646] hover:text-[#FD3752]">
                        <Menu size={24} />
                        Menu
                    </button>
                </div>

                {/* Mobile Controls */}
                <div className="flex lg:hidden items-center gap-4">
                    <button className="bg-[#009688] text-white px-3 py-1.5 rounded text-xs font-bold shadow">
                        Post Ad
                    </button>
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="text-[#464646]"
                    >
                        {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar/Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[110] shadow-2xl border-l border-slate-200"
                    >
                        <div className="px-6 py-4 flex flex-col h-full overflow-y-auto">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
                                <span className="text-2xl font-bold text-[#464646]">Menu</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500"><X size={28}/></button>
                            </div>
                            
                            <div className="space-y-6 flex-1">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-[#464646]">
                                    Sign up / Log in
                                </Link>
                                <hr className="border-slate-100" />
                                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-[#464646]">
                                    Pay Rent / Maintenance
                                </Link>
                                <hr className="border-slate-100" />
                                <button className="w-full text-left text-lg font-bold text-[#009688] py-2">
                                    Post Free Property Ad
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
