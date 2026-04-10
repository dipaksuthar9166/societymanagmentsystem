import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, MessageCircle, Share2, Search, PlusCircle, Filter, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';
import { useToast } from '../../../components/ToastProvider';

const ForumTab = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/community/forum`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Forum Fetch Error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/community/forum`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify(newPost)
            });
            if (res.ok) {
                showSuccess("Post Published", "Your discussion is now live!");
                setShowNewPostModal(false);
                setNewPost({ title: '', content: '', category: 'General' });
                fetchPosts();
            }
        } catch (error) {
            showError("Failed", "Could not publish post.");
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/community/forum/${postId}/like`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                fetchPosts();
            }
        } catch (error) {
            console.error("Like Error", error);
        }
    };

    const filteredPosts = posts.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.content.toLowerCase().includes(search.toLowerCase())
    );

    const getCategoryStyles = (cat) => {
        switch(cat) {
            case 'Help': return 'bg-red-50 text-red-600 border-red-100';
            case 'Events': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Buy/Sell': return 'bg-orange-50 text-orange-600 border-orange-100';
            default: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        }
    };

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom duration-500 pb-20">
            {/* Header Actions */}
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border-none shadow-sm text-xs font-bold"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setShowNewPostModal(true)}
                    className="p-2.5 bg-[#0091ea] text-white rounded-xl shadow-md active:scale-95 transition-all"
                >
                    <PlusCircle size={20} />
                </button>
            </div>

            {/* Posts Feed */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[#0091ea] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                        <div key={post._id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                            <div className="flex items-start gap-4">
                                {/* Left Side Avatar + Flat (Exactly like image) */}
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full border-2 border-indigo-50 overflow-hidden bg-slate-100 mb-1 flex items-center justify-center text-indigo-600 font-black text-xs">
                                        {post.author?.name?.[0] || 'R'}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                        {post.author?.flatNo || 'N/A'}
                                    </span>
                                </div>

                                {/* Content Center */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-black text-slate-800 mb-1 leading-tight line-clamp-2 uppercase tracking-tight">
                                        {post.title}
                                    </h3>
                                    
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase">
                                            <MessageCircle size={12} /> {post.comments?.length || 0} Comments
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase">
                                            <Eye size={12} /> {post.views || 0} Views
                                        </div>
                                    </div>

                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                        Posted by: {post.author?.name?.[0]}-{post.author?.flatNo || 'Admin'}, {new Date(post.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Right menu */}
                                <div className="self-start">
                                    <button className="p-1 text-slate-300 hover:text-slate-600">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-slate-400">
                            <MessageSquare className="mx-auto mb-2 opacity-10" size={40} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No discussions yet</p>
                        </div>
                    )}
                </div>
            )}

            {/* New Post Modal */}
            {showNewPostModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowNewPostModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-800">New Discussion</h2>
                            <button onClick={() => setShowNewPostModal(false)} className="p-2 bg-slate-50 rounded-full"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreatePost} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1">Title</label>
                                <input 
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800"
                                    placeholder="What do you want to talk about?"
                                    required
                                    value={newPost.title}
                                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1">Category</label>
                                <select 
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800"
                                    value={newPost.category}
                                    onChange={e => setNewPost({...newPost, category: e.target.value})}
                                >
                                    <option value="General">General Discussion</option>
                                    <option value="Help">Need Help / Inquiry</option>
                                    <option value="Events">Society Events</option>
                                    <option value="Buy/Sell">Buy & Sell</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1">Message</label>
                                <textarea 
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800 h-32 resize-none"
                                    placeholder="Describe your discussion..."
                                    required
                                    value={newPost.content}
                                    onChange={e => setNewPost({...newPost, content: e.target.value})}
                                />
                            </div>
                            <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                                Publish Post
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForumTab;
