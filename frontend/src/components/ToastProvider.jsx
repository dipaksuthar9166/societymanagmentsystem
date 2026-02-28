import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

const Toast = ({ id, type, title, message, users, onClose }) => {
    const icons = {
        success: <CheckCircle className="text-green-500" size={24} />,
        error: <AlertCircle className="text-red-500" size={24} />,
        warning: <AlertTriangle className="text-orange-500" size={24} />,
        info: <Info className="text-blue-500" size={24} />
    };

    const colors = {
        success: 'border-green-200 bg-green-50',
        error: 'border-red-200 bg-red-50',
        warning: 'border-orange-200 bg-orange-50',
        info: 'border-blue-200 bg-blue-50'
    };

    return (
        <div className={`mb-3 p-4 rounded-xl border-2 ${colors[type]} shadow-lg animate-in slide-in-from-right duration-300`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {icons[type]}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 mb-1">{title}</h4>
                    <p className="text-xs text-slate-600">{message}</p>

                    {/* User List */}
                    {users && users.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 mb-2">
                                Affected Users ({users.length}):
                            </p>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {users.map((user, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                                            {user.name?.[0] || user.flatNo?.[0] || 'U'}
                                        </div>
                                        <span className="font-medium text-slate-700">
                                            {user.name || 'Unknown'}
                                        </span>
                                        {user.flatNo && (
                                            <span className="text-slate-500">- Flat {user.flatNo}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onClose(id)}
                    className="flex-shrink-0 p-1 hover:bg-white/50 rounded-lg transition-colors"
                >
                    <X size={16} className="text-slate-400" />
                </button>
            </div>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type = 'info', title, message, users, duration = 5000 }) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, title, message, users }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((title, message, users) => {
        return addToast({ type: 'success', title, message, users });
    }, [addToast]);

    const showError = useCallback((title, message, users) => {
        return addToast({ type: 'error', title, message, users });
    }, [addToast]);

    const showWarning = useCallback((title, message, users) => {
        return addToast({ type: 'warning', title, message, users });
    }, [addToast]);

    const showInfo = useCallback((title, message, users) => {
        return addToast({ type: 'info', title, message, users });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showWarning, showInfo }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-20 right-6 z-50 w-96 max-w-full">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
