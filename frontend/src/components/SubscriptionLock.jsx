import React from 'react';
import { Lock, AlertTriangle, PhoneCall } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SubscriptionLock = ({ children, societyDetails }) => {
    const { user } = useAuth();

    // Safety check: If no data yet, just render (let loading states handle it) or return null
    if (!societyDetails) return <>{children}</>;

    const { subscription } = societyDetails;

    // Logic to check validity
    // 1. Check explicit status
    // 2. Check date expiry
    const isExpired = subscription?.status === 'Expired' ||
        (subscription?.endDate && new Date(subscription.endDate) < new Date());

    if (!isExpired) return <>{children}</>;

    // User requested that EVERYONE should be able to renew/buy subscription
    // So we treat everyone as capable of seeing the "Renew" button action
    const canRenew = true;

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* The actual dashboard content, heavily blurred and unclickable */}
            <div className="w-full h-full blur-md pointer-events-none select-none opacity-50 grayscale transition-all duration-1000">
                {children}
            </div>

            {/* The Lock Overlay */}
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-500">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg text-center border-t-8 border-red-500 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={48} />
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-3 uppercase tracking-tight">Access Restricted</h2>

                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        {canRenew
                            ? "Your society's subscription plan has expired. Essential services are currently frozen. Please renew your plan to restore full access."
                            : "This society's subscription has expired. Access to the dashboard is temporarily suspended. Please contact your Society Admin."}
                    </p>

                    {canRenew ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.hash = '#subscription'}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-red-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                <AlertTriangle size={20} />
                                Renew Subscription Now
                            </button>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Grace Period Ends in 2 Days</p>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center gap-2 text-slate-600 font-bold">
                            <PhoneCall size={18} />
                            Contact Admin for Updates
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionLock;
