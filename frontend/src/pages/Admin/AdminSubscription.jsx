import React, { useState, useEffect } from 'react';
import { Check, Shield, Zap, Crown, CreditCard, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const AdminSubscription = ({ token, user, onSuccess }) => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/plans`);
                const data = await res.json();
                if (res.ok) setPlans(data);
            } catch (error) {
                console.error("Fetch plans error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // Load Razorpay Script dynamically
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBuy = async (plan) => {
        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            // 1. Create Order
            const orderRes = await fetch(`${API_BASE_URL}/payments/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ planId: plan._id })
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok) {
                alert('Order creation failed: ' + orderData.message);
                return;
            }

            // 2. Open Razorpay Checkout
            // Safe key retrieval for Vite (import.meta.env) or standard Create-React-App (process.env)
            const razorpayKey = (import.meta && import.meta.env && import.meta.env.VITE_RAZORPAY_KEY_ID) ||
                (typeof process !== 'undefined' && process.env && process.env.REACT_APP_RAZORPAY_KEY_ID) ||
                "rzp_test_YOUR_KEY_HERE";

            const options = {
                key: razorpayKey,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Society Management",
                description: `Subscription to ${plan.name} Plan`,
                order_id: orderData.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    const verifyRes = await fetch(`${API_BASE_URL}/payments/verify`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: plan._id
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        alert('Payment Successful! Subscription Active.');
                        if (onSuccess) onSuccess(); // Callback to refresh dash or unlock
                        window.location.reload();
                    } else {
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.contactNumber
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Payment Error", error);
            alert("Something went wrong with payment");
        }
    };

    const getIcon = (name) => {
        if (name.toLowerCase().includes('enterprise') || name.toLowerCase().includes('premium')) return Crown;
        if (name.toLowerCase().includes('standard')) return Zap;
        return Shield;
    };

    const getColor = (name) => {
        if (name.toLowerCase().includes('enterprise') || name.toLowerCase().includes('premium')) return 'bg-indigo-50 text-indigo-600';
        if (name.toLowerCase().includes('standard')) return 'bg-blue-50 text-blue-600';
        return 'bg-emerald-50 text-emerald-600';
    };

    const [selectedPlan, setSelectedPlan] = useState(null);

    const onSelectPlan = (plan) => {
        setSelectedPlan(plan);
    };

    const confirmPayment = () => {
        if (selectedPlan) {
            handleBuy(selectedPlan);
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-4 md:p-8 transition-colors">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Choose Your Plan</h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Unlock the full power of the Society Management System. Secure, transparent, and efficient management for your entire community.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Loading Plans...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan) => {
                            const Icon = getIcon(plan.name);
                            const colorClass = getColor(plan.name);

                            return (
                                <div key={plan._id} className={`relative bg-white dark:bg-slate-800 rounded-3xl p-8 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.isPopular ? 'border-blue-400 ring-4 ring-blue-50 dark:ring-blue-900/30 shadow-blue-100 dark:shadow-blue-900/20' : 'border-slate-100 dark:border-slate-700 shadow-lg'}`}>
                                    {plan.isPopular && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-b-xl uppercase tracking-widest shadow-lg shadow-blue-200 dark:shadow-none">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-6 mt-2">
                                        <div className={`w-14 h-14 ${colorClass.includes('indigo') ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : colorClass.includes('blue') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'} rounded-2xl flex items-center justify-center mb-6`}>
                                            <Icon size={28} />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 dark:text-white">{plan.name}</h3>
                                        <div className="flex items-baseline mt-4">
                                            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹{plan.price}</span>
                                            <span className="text-slate-500 dark:text-slate-400 font-bold ml-2">/ {plan.durationDays} days</span>
                                        </div>
                                    </div>

                                    <hr className="border-slate-100 dark:border-slate-700 mb-6" />

                                    <ul className="space-y-4 mb-8 min-h-[180px]">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm font-semibold">
                                                <div className="min-w-[20px]">
                                                    <Check size={18} className="text-emerald-500" strokeWidth={3} />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => onSelectPlan(plan)}
                                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${plan.isPopular
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none'
                                            : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 shadow-lg shadow-slate-200 dark:shadow-none'
                                            }`}
                                    >
                                        <CreditCard size={20} />
                                        {plan.price === 0 ? 'Start Free Trial' : 'Subscribe Now'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-12 text-center text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
                    <Shield size={16} />
                    Secure Payment powered by Razorpay. Cancel anytime.
                </div>
            </div>

            {/* Payment Summary Modal */}
            {selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md p-8 rounded-3xl shadow-2xl scale-100 animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white">Checkout</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Review your order details</p>
                            </div>
                            <button onClick={() => setSelectedPlan(null)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                                <AlertTriangle size={20} className="text-slate-400 dark:text-slate-300" />
                            </button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl mb-6 border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-500 dark:text-slate-400 font-bold">Plan</span>
                                <span className="font-black text-slate-800 dark:text-white text-lg">{selectedPlan.name}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-500 dark:text-slate-400 font-bold">Duration</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedPlan.durationDays} Days</span>
                            </div>
                            <hr className="border-slate-200 dark:border-slate-700 my-4" />
                            <div className="flex justify-between items-center">
                                <span className="text-slate-800 dark:text-white font-black text-lg">Total Pay</span>
                                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{selectedPlan.price}</span>
                            </div>
                        </div>

                        <button
                            onClick={confirmPayment}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            <CreditCard size={20} />
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSubscription;
