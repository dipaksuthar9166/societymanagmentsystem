import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger" // danger, warning, info
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        {/* Icon Container */}
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                                type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                                    'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                            }`}>
                            <AlertTriangle size={32} />
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 leading-tight">
                            {title}
                        </h3>

                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 px-2">
                            {message}
                        </p>

                        <div className="w-full flex flex-col gap-3">
                            <button
                                onClick={onConfirm}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all shadow-xl active:scale-95 ${type === 'danger' ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200 dark:shadow-none' :
                                        type === 'warning' ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-200 dark:shadow-none' :
                                            'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
                                    }`}
                            >
                                {confirmText}
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full py-4 text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.15em] text-[10px] hover:text-slate-800 dark:hover:text-white transition-colors"
                            >
                                {cancelText}
                            </button>
                        </div>
                    </div>

                    {/* Subtle Decorative Elements */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100 to-transparent dark:from-white/5 -mr-12 -mt-12 rounded-full blur-2xl opacity-50"></div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
