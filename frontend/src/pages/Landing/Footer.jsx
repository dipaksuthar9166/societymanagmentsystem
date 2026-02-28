import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Twitter, Facebook, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 pt-24 pb-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                                <Building2 size={16} />
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Nexus <span className="text-orange-500 italic">OS</span></span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed max-w-xs mb-8 font-medium">
                            Empowering modern communities with intelligent automation. Manage billing, security, and communication with ease.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Facebook, Linkedin, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-black mb-6 uppercase tracking-widest text-xs">Product</h4>
                        <ul className="space-y-4">
                            <li><Link to="/features" className="text-slate-600 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm font-bold">Features</Link></li>
                            <li><Link to="/security" className="text-slate-600 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm font-bold">Security</Link></li>
                            <li><Link to="/pricing" className="text-slate-600 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm font-bold">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-black mb-6 uppercase tracking-widest text-xs">Company</h4>
                        <ul className="space-y-4">
                            <li><Link to="/about" className="text-slate-600 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm font-bold">About Us</Link></li>
                            <li><a href="#" className="text-slate-600 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm font-bold">Careers</a></li>
                            <li><Link to="/contact" className="text-slate-600 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm font-bold">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-slate-900 dark:text-white font-black mb-6 uppercase tracking-widest text-xs">Legal</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-slate-600 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm font-bold">Privacy</a></li>
                            <li><a href="#" className="text-slate-600 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm font-bold">Terms</a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest text-center md:text-left">
                    <p>© 2026 Nexus OS Platforms. All rights reserved.</p>
                    <p className="flex items-center gap-1.5 order-first md:order-none">
                        Designed & Developed with <span className="text-red-500 animate-pulse text-xs">❤️</span> by
                        <span className="text-slate-900 dark:text-white hover:text-orange-500 transition-colors cursor-pointer border-b border-orange-500/30 pb-0.5"> Dipak Suthar</span>
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-indigo-600 dark:hover:text-white transition-colors">LinkedIn</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
