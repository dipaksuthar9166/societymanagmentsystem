import React, { useState } from 'react';
import { API_BASE_URL } from '../../../config';
import {
    Bell, Plus, Trash2, Search, Calendar,
    FileText, Megaphone, CheckCircle, X, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '../../../components/ConfirmationModal';

const NoticesTab = ({ notices, refresh, token }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const handlePost = async () => {
        if (!title.trim() || !content.trim()) return;

        try {
            const res = await fetch(`${API_BASE_URL}/notices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ title, content })
            });

            if (res.ok) {
                setTitle('');
                setContent('');
                setIsPosting(false);
                refresh();
            }
        } catch (error) { console.error('Error posting notice:', error); }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/notices/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setDeletingId(null);
                refresh();
            }
        } catch (error) { console.error('Error deleting notice:', error); }
    };

    const filteredNotices = notices.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Megaphone className="text-blue-600 dark:text-blue-400" /> Digital Notice Board
                </h2>
                <div className="flex items-center gap-3">

                    <button
                        onClick={() => setIsPosting(!isPosting)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl ${isPosting
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30'
                            : 'bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isPosting ? <X size={18} /> : <Plus size={18} />}
                        {isPosting ? 'Cancel' : 'Create Notice'}
                    </button>
                </div>
            </div>

            {/* Create Notice Form */}
            <AnimatePresence>
                {isPosting && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-3xl shadow-xl overflow-hidden transition-all"
                    >
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">New Announcement</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">This will be broadcasted to all residents.</p>
                                </div>
                            </div>

                            <div className="grid gap-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1 mb-2 block">Subject</label>
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:font-normal placeholder:text-slate-400"
                                        placeholder="e.g. Water Supply Interruption"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide ml-1 mb-2 block">Message Content</label>
                                    <textarea
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[150px] placeholder:font-normal placeholder:text-slate-400 leading-relaxed resize-none"
                                        placeholder="Type the full details of the notice here..."
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={handlePost}
                                    disabled={!title || !content}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <CheckCircle size={18} /> Publish Notice
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Search Bar */}
            <div className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md py-4 -my-4 px-1">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center">
                    <Search className="w-5 h-5 text-slate-400 ml-3" />
                    <input
                        type="text"
                        placeholder="Search notices archives..."
                        className="w-full pl-4 pr-4 py-2.5 bg-transparent border-none focus:ring-0 text-sm font-medium dark:text-white placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
                        {notices.length} Total
                    </div>
                </div>
            </div>

            {/* Notices Grid */}
            <div className="grid gap-6">
                <AnimatePresence mode='popLayout'>
                    {filteredNotices.length > 0 ? (
                        filteredNotices.map((notice, index) => (
                            <motion.div
                                key={notice._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-white dark:bg-slate-800 border-l-4 border-l-blue-500 border-y border-r border-slate-200 dark:border-slate-700 dark:border-l-blue-500 p-6 rounded-r-2xl shadow-sm hover:shadow-lg transition-all"
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Date */}
                                    <div className="flex md:flex-col items-center md:items-start gap-3 md:w-32 md:border-r md:border-slate-100 dark:md:border-slate-700 md:pr-6 shrink-0">
                                        <div className="text-center md:text-left">
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 block">Posted On</span>
                                            <h4 className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                                                {new Date(notice.createdAt).getDate()}
                                            </h4>
                                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">
                                                {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {notice.title}
                                            </h3>
                                            <button
                                                onClick={() => setDeletingId(notice._id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-all"
                                                title="Delete Notice"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                            {notice.content}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600 dark:text-white">No notices found</h3>
                            <p className="text-slate-400 text-sm mt-1">Try searching for something else.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <ConfirmationModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={() => handleDelete(deletingId)}
                title="Remove Notice?"
                message="Are you sure you want to remove this announcement from the notice board? This cannot be undone."
                type="danger"
            />
        </div>
    );
};

export default NoticesTab;
