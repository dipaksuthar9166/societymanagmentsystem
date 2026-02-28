import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, BACKEND_URL } from '../config';
import { io } from 'socket.io-client';
import {
    MessageCircle,
    Send,
    X,
    Search,
    Circle,
    Check,
    CheckCheck,
    Minimize2,
    Users,
    MessageSquare,
    User,
    Image as ImageIcon,
    Smile,
    Paperclip
} from 'lucide-react';
import { resolveImageURL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'users'
    const [conversations, setConversations] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Initialize Socket.IO
    useEffect(() => {
        const newSocket = io(BACKEND_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            newSocket.emit('join_room', user.id || user._id);
        });

        newSocket.on('new_message', (message) => {
            console.log('New message received:', message);

            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKfj+LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrg');
            audio.play().catch(e => console.log('Audio play failed'));

            if (selectedConversation && message.conversationId === selectedConversation.conversationId) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            } else {
                fetchConversations();
            }
        });
        newSocket.on('typing_status', (data) => {
            if (selectedConversation && data.conversationId === selectedConversation.conversationId) {
                setOtherUserTyping(data.isTyping);
            }
        });

        newSocket.on('user_status_change', (data) => {
            setOnlineUsers(prev => {
                if (data.status === 'online') return [...new Set([...prev, data.userId])];
                return prev.filter(id => id !== data.userId);
            });
        });

        newSocket.on('online_users_list', (list) => {
            setOnlineUsers(list);
        });

        // Request initial online list
        newSocket.emit('get_online_users');

        return () => newSocket.close();
    }, [user.id, user._id, selectedConversation]);

    // Fetch conversations
    const fetchConversations = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
                const total = data.reduce((sum, conv) => sum + conv.unreadCount, 0);
                setUnreadCount(total);
            }
        } catch (error) {
            console.error('Fetch conversations error:', error);
        }
    };

    // Fetch users
    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/chat/users`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Fetch users error:', error);
        }
    };

    // Fetch messages
    const fetchMessages = async (conversationId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/chat/messages/${conversationId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Fetch messages error:', error);
        }
    };

    // Send message
    const handleTyping = () => {
        if (!socket || !selectedConversation) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing_status', {
                receiverId: selectedConversation.otherUser._id,
                conversationId: selectedConversation.conversationId,
                isTyping: true
            });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit('typing_status', {
                receiverId: selectedConversation.otherUser._id,
                conversationId: selectedConversation.conversationId,
                isTyping: false
            });
        }, 2000);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const res = await fetch(`${API_BASE_URL}/chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    receiverId: selectedConversation.otherUser._id,
                    content: newMessage
                })
            });

            if (res.ok) {
                const message = await res.json();
                setMessages(prev => [...prev, message]);
                setNewMessage('');
                scrollToBottom();
                fetchConversations();
            }
        } catch (error) {
            console.error('Send message error:', error);
        }
    };

    const sendImage = async (file) => {
        if (!file || !selectedConversation) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('receiverId', selectedConversation.otherUser._id);

        try {
            const res = await fetch(`${API_BASE_URL}/chat/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
                body: formData
            });

            if (res.ok) {
                const message = await res.json();
                setMessages(prev => [...prev, message]);
                scrollToBottom();
                fetchConversations();
            }
        } catch (error) {
            console.error('Image upload error:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const selectConversation = (conv) => {
        setSelectedConversation(conv);
        fetchMessages(conv.conversationId);
    };

    const startNewChat = (selectedUser) => {
        const conversationId = [user.id || user._id, selectedUser._id].sort().join('_');
        const newConversation = {
            conversationId,
            otherUser: selectedUser,
            lastMessage: null,
            unreadCount: 0
        };
        setSelectedConversation(newConversation);
        setMessages([]);
        fetchMessages(conversationId);
        setTimeout(scrollToBottom, 100);
    };

    useEffect(() => {
        if (isOpen) {
            fetchConversations();
            fetchUsers();
        }
    }, [isOpen]);

    // Listen for external chat start events
    useEffect(() => {
        const handleStartChat = (event) => {
            const selectedUser = event.detail;
            setIsOpen(true);
            startNewChat(selectedUser);
        };

        window.addEventListener('startChat', handleStartChat);
        return () => window.removeEventListener('startChat', handleStartChat);
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.flatNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredConversations = conversations.filter(conv =>
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-24 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <MessageCircle size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Chat Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-50 md:w-96 md:h-[600px] bg-white md:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-0 md:border border-slate-200"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={20} />
                                    <h3 className="font-bold">
                                        {selectedConversation ? (
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{selectedConversation.otherUser.name}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                                    {otherUserTyping ? (
                                                        <span className="text-indigo-600 dark:text-indigo-400 animate-pulse italic">typing...</span>
                                                    ) : (
                                                        selectedConversation.otherUser.role + (selectedConversation.otherUser.flatNo ? ` • ${selectedConversation.otherUser.flatNo}` : '')
                                                    )}
                                                </p>
                                            </div>
                                        ) : 'Messages'}
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    {selectedConversation && (
                                        <button
                                            onClick={() => setSelectedConversation(null)}
                                            className="p-1 hover:bg-white/20 rounded transition-colors"
                                        >
                                            <Minimize2 size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-white/20 rounded transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            {!selectedConversation ? (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    {/* Tabs */}
                                    <div className="flex border-b border-slate-200 bg-slate-50">
                                        <button
                                            onClick={() => setActiveTab('chats')}
                                            className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'chats'
                                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            <MessageSquare size={16} />
                                            <span className="hidden sm:inline">Chats</span>
                                            <span className="sm:hidden">💬</span>
                                            <span className="text-xs">({conversations.length})</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('users')}
                                            className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'users'
                                                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            <Users size={16} />
                                            <span className="hidden sm:inline">All Users</span>
                                            <span className="sm:hidden">👥</span>
                                            <span className="text-xs">({users.length})</span>
                                        </button>
                                    </div>

                                    {/* Search */}
                                    <div className="p-3 md:p-4 border-b border-slate-200">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder={activeTab === 'chats' ? 'Search chats...' : 'Search users...'}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    {/* List */}
                                    <div className="flex-1 overflow-y-auto">
                                        {activeTab === 'chats' ? (
                                            // Conversations List
                                            filteredConversations.length > 0 ? (
                                                filteredConversations.map(conv => (
                                                    <div
                                                        key={conv.conversationId}
                                                        onClick={() => selectConversation(conv)}
                                                        className="p-3 md:p-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer border-b border-slate-100 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative flex-shrink-0">
                                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-base md:text-lg">
                                                                    {conv.otherUser.name[0]}
                                                                </div>
                                                                {onlineUsers.includes(conv.otherUser._id) && (
                                                                    <Circle className="absolute -bottom-0.5 -right-0.5 fill-green-500 text-green-500" size={12} />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <p className="font-bold text-sm text-slate-800 truncate pr-2">{conv.otherUser.name}</p>
                                                                    {conv.unreadCount > 0 && (
                                                                        <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                                                                            {conv.unreadCount}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-slate-500 truncate">
                                                                    {conv.lastMessage?.content || 'No messages yet'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                                                    <MessageSquare size={48} className="mb-2 opacity-50" />
                                                    <p className="text-sm font-semibold text-center">No conversations yet</p>
                                                    <p className="text-xs text-center mt-1">Start a new chat from All Users tab</p>
                                                </div>
                                            )
                                        ) : (
                                            // All Users List
                                            filteredUsers.length > 0 ? (
                                                filteredUsers.map(u => (
                                                    <div
                                                        key={u._id}
                                                        onClick={() => startNewChat(u)}
                                                        className="p-3 md:p-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer border-b border-slate-100 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-base md:text-lg group-hover:scale-110 transition-transform flex-shrink-0">
                                                                {u.name[0]}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-sm text-slate-800 truncate">{u.name}</p>
                                                                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                                                                    {u.flatNo && (
                                                                        <span className="bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                                                                            Flat {u.flatNo}
                                                                        </span>
                                                                    )}
                                                                    <span className="capitalize">{u.role}</span>
                                                                </div>
                                                            </div>
                                                            <MessageCircle size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
                                                    <Users size={48} className="mb-2 opacity-50" />
                                                    <p className="text-sm font-semibold">No users found</p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-slate-50">
                                        {messages.map((msg, idx) => {
                                            const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
                                            const currentUserId = user.id?.toString() || user._id?.toString();
                                            const isMine = senderId === currentUserId;

                                            return (
                                                <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] md:max-w-[70%] ${isMine ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-white text-slate-800 border border-slate-200'} rounded-2xl px-3 md:px-4 py-2 shadow-sm`}>
                                                        {msg.messageType === 'image' ? (
                                                            <div className="space-y-1">
                                                                <img
                                                                    src={resolveImageURL(msg.fileUrl)}
                                                                    alt="Shared in chat"
                                                                    className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                                                                    onClick={() => window.open(resolveImageURL(msg.fileUrl), '_blank')}
                                                                />
                                                                {msg.content !== 'Sent an image' && <p className="text-sm break-words">{msg.content}</p>}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm break-words">{msg.content}</p>
                                                        )}
                                                        <div className={`flex items-center gap-1 mt-1 text-xs ${isMine ? 'text-indigo-200' : 'text-slate-500'}`}>
                                                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            {isMine && (
                                                                msg.isRead ? <CheckCheck size={14} /> : <Check size={14} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className="p-3 md:p-4 border-t border-slate-200 bg-white">
                                        <div className="flex items-center gap-2 mb-2 px-1">
                                            <button
                                                onClick={() => document.getElementById('chat-image-input').click()}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Send Image"
                                            >
                                                <ImageIcon size={20} />
                                            </button>
                                            <input
                                                type="file"
                                                id="chat-image-input"
                                                hidden
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files[0]) sendImage(e.target.files[0]);
                                                    e.target.value = null; // Reset
                                                }}
                                            />
                                            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Send File">
                                                <Paperclip size={20} />
                                            </button>
                                            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Emojis">
                                                <Smile size={20} />
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <textarea
                                                value={newMessage}
                                                onChange={(e) => {
                                                    setNewMessage(e.target.value);
                                                    handleTyping();
                                                }}
                                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                                                placeholder="Type a message..."
                                                className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none dark:text-white"
                                                rows="1"
                                            />
                                            <button
                                                onClick={sendMessage}
                                                className="w-10 h-10 md:w-10 md:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full flex items-center justify-center transition-all transform active:scale-95 md:hover:scale-110 flex-shrink-0"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
