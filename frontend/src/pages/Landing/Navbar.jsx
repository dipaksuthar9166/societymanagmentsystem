import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, X, Menu, Sun, Moon, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ scrolled }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Features', path: '/features' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'Security', path: '/security' },
        { name: 'Contact', path: '/contact' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
            ? 'bg-white/80 dark:bg-[#030712]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 py-4'
            : 'bg-transparent py-8'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl group-hover:rotate-[15deg] transition-all duration-500 ease-spring">
                            <LayoutGrid size={22} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#030712] rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Socie<span className="text-indigo-600">Hub</span></span>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-0.5">Community OS</span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center bg-slate-100/50 dark:bg-white/5 px-2 py-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5 backdrop-blur-md">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${
                                isActive(link.path)
                                    ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-2xl bg-slate-100/50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-white transition-all border border-slate-200/50 dark:border-white/5"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button 
                        onClick={() => navigate('/login')} 
                        className="px-6 py-2.5 text-xs font-black text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
                    >
                        Sign In
                    </button>
                    
                    <button 
                        onClick={() => navigate('/login')} 
                        className="group relative px-7 py-3 bg-[#030712] dark:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Trial Access <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>

                {/* Mobile Controls */}
                <div className="flex lg:hidden items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button 
                        className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg active:scale-90 transition-transform" 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar/Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-[#030712] z-[110] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] border-l border-slate-100 dark:border-white/5"
                    >
                        <div className="p-8 h-full flex flex-col justify-between">
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-black dark:text-white">Guru Kripa <span className="text-indigo-600">Building</span></span>
                                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400"><X /></button>
                                </div>
                                <div className="space-y-4">
                                    {navLinks.map((item) => (
                                        <Link 
                                            key={item.name} 
                                            to={item.path} 
                                            onClick={() => setMobileMenuOpen(false)} 
                                            className="block text-2xl font-black text-slate-800 dark:text-slate-200 hover:text-indigo-600 transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <button onClick={() => navigate('/login')} className="w-full bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Sign In</button>
                                <button onClick={() => navigate('/login')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20">Get Started Free</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
