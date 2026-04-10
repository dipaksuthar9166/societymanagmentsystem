import React, { useState, useEffect } from 'react';
import { BarChart3, MessageSquare, Users, MessageCircle, Eye, MoreVertical } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../config';
import { useToast } from '../../../components/ToastProvider';
import ForumTab from './ForumTab';
import PollsTab from './PollsTab';

const CommunityHub = () => {
    const [activeSubTab, setActiveSubTab] = useState('polls');

    return (
        <div className="bg-[#f4f7f9] min-h-screen -m-6 animate-in fade-in duration-500">
            {/* Top Blue Header exactly like the image */}
            <div className="bg-[#1e5f9e] pt-12 pb-4 px-6 text-center shadow-lg">
                <h2 className="text-white text-lg font-black tracking-tight uppercase mb-4">Resident Engagement</h2>
                
                <div className="flex bg-[#164a7d] rounded-lg p-1 max-w-sm mx-auto">
                    <button 
                        onClick={() => setActiveSubTab('polls')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all text-xs font-black uppercase tracking-widest ${activeSubTab === 'polls' ? 'bg-[#0091ea] text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                    >
                        <BarChart3 size={16} /> Polls
                    </button>
                    <button 
                        onClick={() => setActiveSubTab('forum')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all text-xs font-black uppercase tracking-widest ${activeSubTab === 'forum' ? 'bg-[#0091ea] text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                    >
                        <MessageSquare size={16} /> Forum
                    </button>
                </div>
            </div>

            <div className="p-4 max-w-lg mx-auto pb-24">
                {activeSubTab === 'polls' ? <PollsTab /> : <ForumTab />}
            </div>
        </div>
    );
};

export default CommunityHub;
