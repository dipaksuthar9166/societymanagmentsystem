import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Share2, Search, PlusCircle, Clock, MapPin, Tag, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ToastProvider';

const ForumTab = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // New Post State
    const [newPost, setNewPost] = useState({
        title: '',
        description: '',
        type: 'Event',
        price: ''
    });

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/community/posts`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Fetch Forum Posts Error", error);
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
            const res = await fetch(`${API_BASE_URL}/community/posts`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify(newPost)
            });
            if (res.ok) {
                showSuccess('Posted!', 'Your message is now live on the forum.');
                setShowCreateModal(false);
                setNewPost({ title: '', description: '', type: 'Event', price: '' });
                fetchPosts();
            } else {
                showError('Failed', 'Could not create post. Please try again.');
            }
        } catch (error) {
            showError('Error', 'Internal server error.');
        }
    };

    const getCategoryStyles = (cat) => {
        switch(cat) {
            case 'Rent': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Sell': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'Lost': return 'bg-red-50 text-red-600 border-red-100';
            case 'Found': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Event': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        }
    };

    const filteredPosts = posts.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
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
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 w-full md:w-auto"
                >
                    <PlusCircle size={18} /> New Post
                </button>
            </div>

            {/* Posts Feed */}
            {loading ? (
                <div className="py-20 text-center animate-pulse">
                    <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing discussions...</p>
                </div>
            ) : filteredPosts.length > 0 ? (
                <div className="space-y-4">
                    {filteredPosts.map((post) => (
                        <div key={post._id} className="bg-white rounded-[35px] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg">
                                    {post.postedBy?.name?.[0] || 'U'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-black text-slate-800 tracking-tight">{post.postedBy?.name || 'Resident'}</h4>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getCategoryStyles(post.type)}`}>
                                            {post.type}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Flat {post.postedBy?.flatNo || 'A-101'} • {new Date(post.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{post.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{post.description}</p>
                                {post.price && (
                                    <div className="mt-3 inline-flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-black">
                                        ₹{post.price.toLocaleString()}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-6">
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                        <ThumbsUp size={18} />
                                        <span className="text-xs font-black">Like</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                        <MessageCircle size={18} />
                                        <span className="text-xs font-black">Reply</span>
                                    </button>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No discussions found</p>
                </div>
            )}

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">New Community Post</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreatePost} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                <select 
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                                    value={newPost.type}
                                    onChange={(e) => setNewPost({...newPost, type: e.target.value})}
                                >
                                    <option value="Event">Community Event</option>
                                    <option value="Sell">For Sale</option>
                                    <option value="Rent">Up for Rent</option>
                                    <option value="Lost">Lost Item</option>
                                    <option value="Found">Found Item</option>
                                    <option value="Borrow">Borrow Request</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
                                <input 
                                    type="text" 
                                    placeholder="What is this about?"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                                    required
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                />
                            </div>

                            {(newPost.type === 'Sell' || newPost.type === 'Rent') && (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price (₹)</label>
                                    <input 
                                        type="number" 
                                        placeholder="0.00"
                                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                                        value={newPost.price}
                                        onChange={(e) => setNewPost({...newPost, price: e.target.value})}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                <textarea 
                                    rows="4"
                                    placeholder="Tell your neighbors more..."
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                    required
                                    value={newPost.description}
                                    onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all pt-4">
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
