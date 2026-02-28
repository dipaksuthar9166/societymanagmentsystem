import React from 'react';
import { AlertCircle, LogOut, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'warning' }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'logout':
                return <LogOut className="text-red-500" size={48} />;
            case 'warning':
                return <AlertCircle className="text-amber-500" size={48} />;
            case 'danger':
                return <AlertCircle className="text-red-500" size={48} />;
            default:
                return <AlertCircle className="text-blue-500" size={48} />;
        }
    };

    const getButtonColors = () => {
        switch (type) {
            case 'logout':
            case 'danger':
                return 'bg-red-600 hover:bg-red-700';
            case 'warning':
                return 'bg-amber-600 hover:bg-amber-700';
            default:
                return 'bg-indigo-600 hover:bg-indigo-700';
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-800">
                {/* Header */}
                <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-center mb-4">
                        {getIcon()}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{title}</h2>
                    <p className="text-slate-600 dark:text-slate-400">{message}</p>
                </div>

                {/* Actions */}
                <div className="p-6 flex gap-3 bg-white dark:bg-slate-900">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-6 py-3 text-white rounded-xl font-bold transition-all shadow-lg ${getButtonColors()}`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
