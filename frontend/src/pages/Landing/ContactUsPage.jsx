import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const ContactUsPage = () => {
    return (
        <div className="min-h-screen bg-[#F9FAFB] font-['Outfit']">
            <Navbar scrolled={true} />
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-20">
                        <h1 className="text-4xl md:text-5xl font-black text-[#464646] mb-6">How can we <span className="text-[#FD3752]">Help You?</span></h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Our team is ready to help you simplify your society management.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg flex items-start gap-4">
                                <Phone size={24} className="text-[#FD3752]" />
                                <div><h4 className="font-bold">Phone</h4><p className="">+91 91080 50000</p></div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg flex items-start gap-4">
                                <Mail size={24} className="text-[#FD3752]" />
                                <div><h4 className="font-bold">Email</h4><p className="">support@gurukripa.in</p></div>
                            </div>
                        </div>
                        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100">
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
                                <input type="text" placeholder="Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl" />
                                <input type="email" placeholder="Email" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl" />
                                <textarea rows={4} placeholder="Message" className="md:col-span-2 w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl resize-none"></textarea>
                                <button className="md:col-span-2 bg-[#FD3752] text-white py-4 rounded-xl font-bold text-lg">Send Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContactUsPage;
