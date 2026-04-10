import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, MessageCircle, Share2, Search, PlusCircle, Filter } from 'lucide-react';

const ForumTab = () => {
    const [search, setSearch] = useState('');
    
    const mockPosts = [
        {
            id: 1,
            author: 'Dipak Kumar Suthar',
            flat: 'A-101',
            category: 'Help',
            title: 'Reliable plumber needed urgently!',
            content: 'Hey neighbors, my kitchen sink is leaking badly. Does anyone have the contact of a reliable plumber who can visit today?',
            timestamp: '2 hours ago',
            likes: 12,
            comments: 4,
            avatar: 'D'
        },
        {
            id: 2,
            author: 'Priya Sharma',
            flat: 'B-304',
            category: 'General',
            title: 'Lost keys in the common park',
            content: 'I lost a bunch of keys with a blue keychain near the kids play area. If anyone finds it, please let me know.',
            timestamp: '5 hours ago',
            likes: 8,
            comments: 2,
            avatar: 'P'
        },
        {
            id: 3,
            author: 'Rahul Verma',
            flat: 'C-502',
            category: 'Events',
            title: 'Society Cricket Match this Sunday!',
            content: 'We are organizing a friendly cricket match this Sunday morning. Anyone interested in joining can register by replying here.',
            timestamp: '1 day ago',
            likes: 25,
            comments: 14,
            avatar: 'R'
        }
    ];

    const getCategoryStyles = (cat) => {
        switch(cat) {
            case 'Help': return 'bg-red-50 text-red-600 border-red-100';
            case 'Events': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Buy/Sell': return 'bg-orange-50 text-orange-600 border-orange-100';
            default: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[30px] shadow-sm border border-slate-100">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search discussions..." 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                        <PlusCircle size={18} /> New Post
                    </button>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4 pb-20">
                {mockPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-[35px] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg">
                                {post.avatar}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-black text-slate-800 tracking-tight">{post.author}</h4>
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getCategoryStyles(post.category)}`}>
                                        {post.category}
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Flat {post.flat} • {post.timestamp}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">{post.content}</p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-6">
                                <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <ThumbsUp size={18} />
                                    <span className="text-xs font-black">{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <MessageCircle size={18} />
                                    <span className="text-xs font-black">{post.comments}</span>
                                </button>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ForumTab;
