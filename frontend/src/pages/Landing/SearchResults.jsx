import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Building, ShieldCheck, CreditCard, Star, Filter } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import axios from 'axios';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query') || '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/public/search?q=${query}`);
                setResults(res.data);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchResults();
    }, [query]);

    return (
        <div className="min-h-screen bg-[#F8F9FA] font-['Outfit']">
            <Navbar scrolled={true} />
            
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Search Stats Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                        <h1 className="text-2xl font-bold text-[#464646]">
                            Showing results for "<span className="text-[#FD3752]">{query}</span>"
                            <span className="ml-3 text-sm font-medium text-slate-400">({results.length} Societies found)</span>
                        </h1>
                        <button className="flex items-center gap-2 bg-white px-6 py-2 rounded-full border border-slate-200 font-bold text-sm text-[#464646] hover:bg-slate-50 transition-all">
                            <Filter size={16} /> Filters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Results Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {loading ? (
                                [1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-[2rem]"></div>)
                            ) : results.length > 0 ? (
                                results.map((s) => (
                                    <div key={s._id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row group hover:border-[#FD3752] transition-all">
                                        <div className="md:w-72 h-48 md:h-auto bg-slate-100 relative overflow-hidden">
                                            <img src={s.logo || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={s.name} />
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#FD3752]">Premium Society</div>
                                        </div>
                                        <div className="flex-1 p-8 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-2xl font-black text-[#464646]">{s.name}</h3>
                                                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
                                                        <Star size={12} fill="currentColor"/> 4.8
                                                    </div>
                                                </div>
                                                <p className="text-slate-500 font-medium flex items-center gap-2 mb-6">
                                                    <MapPin size={16} className="text-[#FD3752]"/> {s.address || 'HSR Layout, Bangalore'}
                                                </p>
                                                
                                                <div className="flex gap-4 mb-4">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-xl">
                                                        <ShieldCheck size={14} /> Gate Management
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-xl">
                                                        <CreditCard size={14} /> Auto Billing
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                                                <div className="text-slate-400 text-xs font-medium">98% Residents recommend this app</div>
                                                <Link to={`/society/${s._id}`} className="bg-[#FD3752] text-white px-8 py-3 rounded-xl font-black text-sm hover:shadow-lg hover:shadow-red-200 transition-all">
                                                    Visit Portal
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
                                    <Building size={60} className="mx-auto text-slate-200 mb-6" />
                                    <h2 className="text-2xl font-bold text-slate-400">No Society Found</h2>
                                    <p className="text-slate-400 mt-2">Try searching for "Guru Kripa" or "Heritage"</p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="hidden lg:block space-y-6">
                            <div className="bg-[#464646] rounded-[2rem] p-8 text-white">
                                <h4 className="text-xl font-bold mb-4">Don't find your society?</h4>
                                <p className="text-slate-300 text-sm mb-6 leading-relaxed">Add your society to Guru Kripa and get the first 3 months of automation for free!</p>
                                <Link to="/contact" className="block w-full text-center bg-[#FD3752] text-white py-4 rounded-xl font-black shadow-xl">List Your Society</Link>
                            </div>
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                                <h4 className="font-bold mb-4 text-[#464646]">Why Guru Kripa?</h4>
                                <ul className="space-y-4">
                                    {['99% Payment Recovery', 'Zero Security Leaks', 'Smart Water Billing'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#FD3752]"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SearchResults;
