import React, { useState } from 'react';
import { Bug, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const DebugPanel = () => {
    const [debugInfo, setDebugInfo] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const checkAuth = () => {
        const userStr = localStorage.getItem('user');
        let user = null;

        try {
            user = userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            user = { error: 'Failed to parse user object' };
        }

        const token = user?.token || null;

        setDebugInfo({
            hasToken: !!token,
            token: token ? `${token.substring(0, 20)}...` : 'NULL',
            hasUser: !!user,
            user: user ? {
                name: user.name,
                role: user.role,
                company: user.company,
                token: user.token ? 'YES' : 'NO',
                _id: user._id
            } : 'NULL'
        });
        setIsOpen(true);
    };

    const clearAndReload = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    if (!isOpen) {
        return (
            <button
                onClick={checkAuth}
                className="fixed bottom-24 right-6 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-200"
                title="Debug Auth"
            >
                <Bug size={20} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-24 right-6 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Bug size={20} />
                    Auth Debug
                </h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    ✕
                </button>
            </div>

            {debugInfo && (
                <div className="space-y-3">
                    {/* Token Status */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            {debugInfo.hasToken ? (
                                <CheckCircle size={16} className="text-green-500" />
                            ) : (
                                <XCircle size={16} className="text-red-500" />
                            )}
                            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                                Token Status
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono break-all">
                            {debugInfo.token}
                        </p>
                    </div>

                    {/* User Status */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            {debugInfo.hasUser ? (
                                <CheckCircle size={16} className="text-green-500" />
                            ) : (
                                <XCircle size={16} className="text-red-500" />
                            )}
                            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                                User Data
                            </span>
                        </div>
                        {debugInfo.user !== 'NULL' ? (
                            <div className="text-xs space-y-1">
                                <p className="text-slate-600 dark:text-slate-400">
                                    <span className="font-semibold">Name:</span> {debugInfo.user.name || 'N/A'}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400">
                                    <span className="font-semibold">Role:</span> {debugInfo.user.role || 'N/A'}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400">
                                    <span className="font-semibold">Company:</span> {debugInfo.user.company || 'N/A'}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400">
                                    <span className="font-semibold">CompanyId:</span> {debugInfo.user.companyId || 'N/A'}
                                </p>
                                <p className="text-slate-600 dark:text-slate-400">
                                    <span className="font-semibold">Society:</span> {debugInfo.user.society || 'N/A'}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-red-500">No user data found</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={checkAuth}
                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} />
                            Refresh
                        </button>
                        <button
                            onClick={clearAndReload}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            Clear & Login
                        </button>
                    </div>

                    {/* Diagnosis */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
                            Diagnosis:
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            {!debugInfo.hasToken && !debugInfo.hasUser && "❌ Not logged in. Click 'Clear & Login'"}
                            {debugInfo.hasToken && !debugInfo.hasUser && "⚠️ Token exists but no user data"}
                            {!debugInfo.hasToken && debugInfo.hasUser && "⚠️ User data exists but no token"}
                            {debugInfo.hasToken && debugInfo.hasUser && "✅ Auth looks good!"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebugPanel;
