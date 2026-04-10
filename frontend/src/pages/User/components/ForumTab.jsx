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
                    <button 
                        onClick={() => setShowNewPostModal(true)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <PlusCircle size={18} /> New Post
                    </button>
                </div>
            </div>

            {/* Posts Feed */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-4 pb-20">
                    {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                        <div key={post._id} className="bg-white rounded-[35px] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg">
                                    {post.author?.name?.[0] || 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-black text-slate-800 tracking-tight">{post.author?.name || 'Resident'}</h4>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getCategoryStyles(post.category)}`}>
                                            {post.category}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Flat {post.author?.flatNo || 'N/A'} • {new Date(post.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{post.content}</p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={() => handleLike(post._id)}
                                        className={`flex items-center gap-2 transition-colors ${post.likes?.includes(user?.id || user?._id) ? 'text-indigo-600' : 'text-slate-400'}`}
                                    >
                                        <ThumbsUp size={18} className={post.likes?.includes(user?.id || user?._id) ? 'fill-indigo-600' : ''} />
                                        <span className="text-xs font-black">{post.likes?.length || 0}</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                        <MessageCircle size={18} />
                                        <span className="text-xs font-black">{post.comments?.length || 0}</span>
                                    </button>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 text-slate-400">
                            <MessageSquare className="mx-auto mb-4 opacity-10" size={60} />
                            <p className="font-bold">No discussions yet. Be the first to start!</p>
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
