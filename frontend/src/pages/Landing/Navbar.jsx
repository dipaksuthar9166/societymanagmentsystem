import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, X, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ scrolled }) => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 py-4'
            : 'bg-transparent py-6'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                        <Building2 size={20} />
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Nexus <span className="text-orange-500 not-italic">OS</span></span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {[
                        { name: 'Features', path: '/features' },
                        { name: 'Pricing', path: '/pricing' },
                        { name: 'About', path: '/about' },
                        { name: 'Contact', path: '/contact' }
                    ].map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-6">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-all border border-slate-200 dark:border-white/10 shadow-sm"
                        aria-label="Toggle Theme"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-white transition-colors">Log In</button>
                    <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-orange-500 text-white text-sm font-black rounded-full hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95">
                        Get Started
                    </button>
                </div>

                <div className="flex items-center gap-4 md:hidden">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button className="text-slate-900 dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 overflow-hidden shadow-xl"
                    >
                        <div className="px-6 py-8 space-y-6 flex flex-col">
                            {['Features', 'Pricing', 'About', 'Contact'].map((item) => (
                                <Link key={item} to={`/${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="text-slate-600 dark:text-slate-300 font-bold hover:text-orange-500 dark:hover:text-white text-lg">{item}</Link>
                            ))}
                            <div className="h-px bg-slate-200 dark:bg-white/10 my-2"></div>
                            <button onClick={() => navigate('/login')} className="bg-orange-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20">Sign In</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};


export default Navbar;
