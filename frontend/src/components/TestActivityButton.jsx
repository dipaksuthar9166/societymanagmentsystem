import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { Zap, CheckCircle, XCircle } from 'lucide-react';

const TestActivityButton = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const createSampleActivities = async () => {
        setLoading(true);
        setResult(null);

        try {
            if (!user?.token) {
                setResult({ success: false, message: '❌ No token found. Please login again.' });
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/test/create-sample-activities`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.status === 401) {
                setResult({
                    success: false,
                    message: '❌ Token expired. Please logout and login again.'
                });
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = '/login';
                }, 3000);
                return;
            }

            if (data.success) {
                setResult({ success: true, message: `✅ Created ${data.count} activities!` });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setResult({ success: false, message: data.message || 'Failed to create activities' });
            }
        } catch (error) {
            console.error('Error:', error);
            setResult({ success: false, message: `❌ ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={createSampleActivities}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Zap size={20} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Creating...' : 'Test Live Activity'}
            </button>

            {result && (
                <div className={`mt-3 p-4 rounded-xl shadow-lg ${result.success
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50'
                    }`}>
                    <div className="flex items-center gap-2">
                        {result.success ? (
                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                        ) : (
                            <XCircle size={20} className="text-red-600 dark:text-red-400" />
                        )}
                        <p className={`text-sm font-medium ${result.success
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-red-800 dark:text-red-200'
                            }`}>
                            {result.message}
                        </p>
                    </div>
                    {result.success && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Reloading in 2 seconds...
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TestActivityButton;
