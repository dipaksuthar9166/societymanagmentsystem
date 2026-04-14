import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#1b1b1b] text-white pt-20 pb-10 font-['Outfit']">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-[#FD3752] flex items-center justify-center text-white">
                                <Building2 size={24} />
                            </div>
                            <span className="text-2xl font-bold">Guru<span className="text-[#FD3752]">Kripa</span></span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            India's most trusted Society Management System. We bring security, transparency, and convenience to your gated communities.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <Icon key={i} size={20} className="text-slate-400 hover:text-[#FD3752] cursor-pointer transition-colors" />
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Explore</h4>
                        <ul className="space-y-4 text-slate-400 text-sm font-medium">
                            <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
                            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link to="/demo" className="hover:text-white transition-colors">Book a Demo</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-slate-400 text-sm font-medium">
                            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Get in Touch</h4>
                        <ul className="space-y-4 text-slate-400 text-sm font-medium">
                            <li className="flex items-center gap-3">
                                <Phone size={16} className="text-[#FD3752]" />
                                +91 91080 50000
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={16} className="text-[#FD3752]" />
                                support@gurukripa.in
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-10 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <p>© 2024 Guru Kripa Technologies Pvt Ltd. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
