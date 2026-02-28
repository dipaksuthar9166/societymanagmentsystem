import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [freezeAlert, setFreezeAlert] = useState(null); // State for freeze notification
    const navigate = useNavigate();

    // Determine Socket URL based on window location (same logic as config.js roughly)
    const getSocketURL = () => {
        return BACKEND_URL;
    };

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (error) {
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    // Socket Listener for Account Freeze & Global Socket Init
    useEffect(() => {
        let socket;
        if (user) {
            socket = io(getSocketURL());
            window.io = socket; // Expose to window for other components like TrafficAnalytics

            socket.on('connect', () => {
                // console.log("Auth Socket Connected");
                if (user.company) {
                    socket.emit('join_society', user.company);
                }
                // Super Admin join own room?
                if (user.role === 'superadmin') {
                    socket.emit('join_room', 'superadmin_global');
                }
            });

            socket.on('account_frozen', (data) => {
                console.log("Account Frozen Event Received:", data);
                setFreezeAlert(data.message || "Your account has been frozen.");
            });

            return () => {
                socket.disconnect();
                window.io = null;
            };
        }
    }, [user]);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        if (userData.role === 'superadmin') {
            navigate('/super-admin-dashboard');
        } else if (userData.role === 'admin') {
            navigate('/admin-dashboard');
        } else if (userData.role === 'guard') {
            navigate('/gate-pass');
        } else if (['chairman', 'secretary', 'treasurer', 'committee_member'].includes(userData.role)) {
            navigate('/committee-dashboard');
        } else {
            navigate('/user-dashboard');
        }
    };

    const mockLogin = (role) => {
        const mockUsers = {
            admin: { name: 'Demo Admin', role: 'admin', company: 'demo-society', isDemo: true, token: 'demo-token' },
            user: { name: 'Demo Resident', role: 'user', company: 'demo-society', isDemo: true, token: 'demo-token' },
            guard: { name: 'Demo Guard', role: 'guard', company: 'demo-society', isDemo: true, token: 'demo-token' },
            chairman: { name: 'Demo Chairman', role: 'chairman', company: 'demo-society', isDemo: true, token: 'demo-token' }
        };
        const userData = mockUsers[role] || mockUsers.admin;
        login(userData);
    };

    const logout = () => {
        setShowLogoutDialog(true);
    };

    const handleLogoutConfirm = () => {
        setUser(null);
        localStorage.removeItem('user');
        setFreezeAlert(null); // Clear alert
        navigate('/');
    };

    // Force Logout for Freeze
    const handleFreezeAcknowledge = () => {
        setUser(null);
        localStorage.removeItem('user');
        setFreezeAlert(null);
        navigate('/');
    };

    const value = {
        user,
        loading,
        login,
        mockLogin,
        logout,
        isAuthenticated: !!user,
        role: user?.role,
        isDemo: user?.isDemo,
        societyId: user?.company,
        token: user?.token
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}

            {/* Standard Logout Dialog */}
            <ConfirmDialog
                isOpen={showLogoutDialog}
                onClose={() => setShowLogoutDialog(false)}
                onConfirm={handleLogoutConfirm}
                title="Logout Confirmation"
                message="Are you sure you want to logout? You will need to login again to access your account."
                type="logout"
            />

            {/* Account Frozen Alert Modal */}
            {freezeAlert && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-red-600 animate-in zoom-in-95">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2">Account Frozen</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            {freezeAlert}
                        </p>
                        <button
                            onClick={handleFreezeAcknowledge}
                            className="w-full py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                        >
                            OK, I Understand
                        </button>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
