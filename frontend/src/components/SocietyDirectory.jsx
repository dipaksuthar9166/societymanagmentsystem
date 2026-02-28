import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import {
    Building,
    MessageCircle,
    Search,
    User,
    MapPin,
    Phone,
    Mail,
    Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

const SocietyDirectory = ({ onStartChat }) => {
    const { user } = useAuth();
    const [flats, setFlats] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFlats();
    }, []);

    const fetchFlats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/flats`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter only occupied flats
                const occupiedFlats = data.filter(flat => flat.tenantId && flat.tenantId._id !== user.id);
                setFlats(occupiedFlats);
            }
        } catch (error) {
            console.error('Fetch flats error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredFlats = flats.filter(flat =>
        flat.flatNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flat.block?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flat.tenantId?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChatClick = (flat) => {
        const userToChat = {
            _id: flat.tenantId._id,
            name: `Resident of ${flat.block ? flat.block + '-' : ''}${flat.flatNo}`,
            flatNo: flat.flatNo,
            block: flat.block,
            actualName: flat.tenantId.name, // Hidden from UI but available
            role: flat.tenantId.role
        };

        console.log('Dispatching startChat event for:', userToChat);

        // Dispatch custom event that ChatWidget will listen to
        const event = new CustomEvent('startChat', { detail: userToChat });
        window.dispatchEvent(event);

        // Also call the callback if provided (for compatibility)
        if (onStartChat) {
            onStartChat(userToChat);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <Building size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Society Directory</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Connect with your neighbors</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                <input
                    type="text"
                    placeholder="Search by flat number or block..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white shadow-sm"
                />
            </div>

            {/* Flats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFlats.map((flat, idx) => (
                    <motion.div
                        key={flat._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer group"
                        onClick={() => handleChatClick(flat)}
                    >
                        {/* Flat Number Badge */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                    {flat.block || flat.flatNo.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-slate-800 dark:text-white">
                                        {flat.block ? `${flat.block}-` : ''}{flat.flatNo}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        {flat.floor ? `Floor ${flat.floor}` : 'Flat'}
                                    </p>
                                </div>
                            </div>
                            <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                <MessageCircle size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                            </div>
                        </div>

                        {/* Privacy-Protected Info */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <User size={14} className="text-slate-400 dark:text-slate-500" />
                                <span className="font-medium">Resident</span>
                            </div>
                            {flat.tenantId?.role === 'admin' && (
                                <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                                    <Shield size={14} />
                                    <span className="font-bold">Committee Member</span>
                                </div>
                            )}
                        </div>

                        {/* Action Hint */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <p className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-medium">
                                Click to start conversation →
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredFlats.length === 0 && (
                <div className="text-center py-12">
                    <Building size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-bold">No flats found</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search</p>
                </div>
            )}
        </div>
    );
};

export default SocietyDirectory;
