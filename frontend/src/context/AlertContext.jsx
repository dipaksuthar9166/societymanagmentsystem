import React, { createContext, useContext, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alertState, setAlertState] = useState({
        isOpen: false,
        type: 'info', // success, error, warning, info, confirm
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    });

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, isOpen: false }));
    };

    const showAlert = (title, message, type = 'info') => {
        return new Promise((resolve) => {
            setAlertState({
                isOpen: true,
                title,
                message,
                type,
                onConfirm: () => {
                    closeAlert();
                    resolve(true); // Resolves promise when OK is clicked
                },
                onCancel: null, // No cancel for simple alert
                confirmText: 'OK',
                cancelText: null
            });
        });
    };

    const showConfirm = (title, message, confirmText = 'Yes', cancelText = 'No') => {
        return new Promise((resolve) => {
            setAlertState({
                isOpen: true,
                title,
                message,
                type: 'confirm',
                onConfirm: () => {
                    closeAlert();
                    resolve(true);
                },
                onCancel: () => {
                    closeAlert();
                    resolve(false);
                },
                confirmText,
                cancelText
            });
        });
    };

    // Component Rendering
    const getIcon = () => {
        switch (alertState.type) {
            case 'success': return <CheckCircle size={48} className="text-emerald-500" />;
            case 'error': return <AlertOctagon size={48} className="text-rose-500" />;
            case 'warning': return <AlertTriangle size={48} className="text-amber-500" />;
            case 'confirm': return <Info size={48} className="text-indigo-500" />;
            default: return <Info size={48} className="text-slate-500" />;
        }
    };

    const getColor = () => {
        switch (alertState.type) {
            case 'success': return 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500';
            case 'error': return 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500';
            case 'warning': return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
            case 'confirm': return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
            default: return 'bg-slate-800 hover:bg-slate-900 focus:ring-slate-500';
        }
    };

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <AnimatePresence>
                {alertState.isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={alertState.type === 'confirm' ? undefined : closeAlert} // Click outside to close unless confirm
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700"
                        >
                            <div className="p-6 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full shadow-inner">
                                        {getIcon()}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                                    {alertState.title}
                                </h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                                    {alertState.message}
                                </p>

                                <div className="flex gap-3 justify-center">
                                    {alertState.cancelText && (
                                        <button
                                            onClick={alertState.onCancel}
                                            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                                        >
                                            {alertState.cancelText}
                                        </button>
                                    )}
                                    <button
                                        onClick={alertState.onConfirm}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all transform active:scale-95 outline-none focus:ring-2 focus:ring-offset-2 ${getColor()}`}
                                    >
                                        {alertState.confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AlertContext.Provider>
    );
};
