import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Check, Clock, RefreshCw } from 'lucide-react';

const OTPRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        otp: '',
        password: '',
        confirmPassword: '',
        role: 'user'
    });

    // State
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');

    // Timer countdown
    useEffect(() => {
        if (otpSent && timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [otpSent, timer]);

    // Format timer
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    // Step 1: Send OTP
    const sendOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email) {
            setError('Please enter name and email');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/api/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name
                })
            });

            const data = await res.json();

            if (res.ok) {
                setOtpSent(true);
                setStep(2);
                setTimer(300);
                setCanResend(false);
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const resendOTP = async () => {
        setTimer(300);
        setCanResend(false);
        await sendOTP({ preventDefault: () => { } });
    };

    // Step 2: Verify OTP
    const verifyOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/api/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp
                })
            });

            const data = await res.json();

            if (data.verified) {
                setOtpVerified(true);
                setStep(3);
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Complete Registration
    const completeRegistration = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.password || formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    isVerified: true // Already verified via OTP
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert('✅ Registration successful! You can login now.');
                navigate('/login');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-8 text-center">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            STATUS Sharan
                        </h1>
                        <p className="text-teal-100 text-sm">
                            Create Your Account
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="px-8 pt-6">
                        <div className="flex items-center justify-between mb-8">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                        }`}>
                                        {step > s ? <Check size={20} /> : s}
                                    </div>
                                    {s < 3 && (
                                        <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Step 1: Email Entry */}
                        {step === 1 && (
                            <form onSubmit={sendOTP} className="space-y-4">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                                    Enter Your Details
                                </h2>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                            className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your@email.com"
                                            className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                    <ArrowRight size={20} />
                                </button>
                            </form>
                        )}

                        {/* Step 2: OTP Verification */}
                        {step === 2 && (
                            <form onSubmit={verifyOTP} className="space-y-4">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                    Verify Your Email
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    OTP sent to <span className="font-semibold text-teal-600">{formData.email}</span>
                                </p>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Enter 6-Digit OTP
                                    </label>
                                    <input
                                        type="text"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleChange}
                                        placeholder="123456"
                                        maxLength={6}
                                        className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Timer */}
                                <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Clock size={16} />
                                    <span>Expires in {formatTime(timer)}</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                    <Check size={20} />
                                </button>

                                {/* Resend OTP */}
                                <button
                                    type="button"
                                    onClick={resendOTP}
                                    disabled={!canResend || loading}
                                    className="w-full py-2 text-teal-600 dark:text-teal-400 font-semibold hover:underline disabled:opacity-50 disabled:no-underline flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={16} />
                                    {canResend ? 'Resend OTP' : 'Resend available after expiry'}
                                </button>
                            </form>
                        )}

                        {/* Step 3: Password & Complete */}
                        {step === 3 && (
                            <form onSubmit={completeRegistration} className="space-y-4">
                                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg">
                                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                                        <Check size={16} />
                                        Email verified successfully!
                                    </p>
                                </div>

                                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                                    Complete Registration
                                </h2>

                                {/* Locked fields */}
                                <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <div className="text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Name:</span>
                                        <span className="ml-2 font-semibold text-slate-800 dark:text-white">{formData.name}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Email:</span>
                                        <span className="ml-2 font-semibold text-slate-800 dark:text-white">{formData.email}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter password"
                                            className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm password"
                                            className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? 'Creating Account...' : 'Complete Registration'}
                                    <Check size={20} />
                                </button>
                            </form>
                        )}

                        {/* Login Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Already have an account?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                                >
                                    Login
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPRegistration;
