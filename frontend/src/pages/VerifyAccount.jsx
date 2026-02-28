import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';

const VerifyAccount = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        verifyEmail();
    }, [token]);

    const verifyEmail = async () => {
        try {
            const res = await fetch(`http://localhost:5001/api/verification/verify-account/${token}`);
            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setMessage(data.message);
                setUserName(data.user.name);

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.message);
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to verify email. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-8 text-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            STATUS Sharan
                        </h1>
                        <p className="text-teal-100 text-sm">
                            Email Verification
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {status === 'verifying' && (
                            <div className="text-center">
                                <Loader size={64} className="text-teal-600 animate-spin mx-auto mb-6" />
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                    Verifying Your Email...
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Please wait while we verify your account.
                                </p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                    🎉 Success!
                                </h2>
                                <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
                                    Welcome, <span className="font-bold text-teal-600">{userName}</span>!
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    {message}
                                </p>

                                {/* Features */}
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 mb-6 text-left">
                                    <p className="font-semibold text-slate-800 dark:text-white mb-3">
                                        You can now:
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="text-green-600 dark:text-green-400">✓</span>
                                            <span>Pay maintenance bills online</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="text-green-600 dark:text-green-400">✓</span>
                                            <span>Raise and track complaints</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="text-green-600 dark:text-green-400">✓</span>
                                            <span>Book society facilities</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="text-green-600 dark:text-green-400">✓</span>
                                            <span>View notices and updates</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    <Loader size={16} className="animate-spin" />
                                    <span>Redirecting to login in 3 seconds...</span>
                                </div>

                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/30"
                                >
                                    Login Now
                                </button>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="text-center">
                                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <XCircle size={48} className="text-red-600 dark:text-red-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                    Verification Failed
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">
                                    {message}
                                </p>

                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 mb-6">
                                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                                        <strong>Possible reasons:</strong>
                                    </p>
                                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 text-left">
                                        <li>• Verification link has expired (24 hours)</li>
                                        <li>• Link has already been used</li>
                                        <li>• Invalid verification token</li>
                                    </ul>
                                </div>

                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    Please contact your society administrator to resend the verification email.
                                </p>

                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl transition-all duration-200"
                                >
                                    Back to Login
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 px-8 py-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                            © 2025 STATUS Sharan. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyAccount;
