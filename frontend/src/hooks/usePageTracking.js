import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Generate or retrieve session ID
        let sessionId = localStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('analytics_session_id', sessionId);
        }

        const trackPageView = async () => {
            try {
                await fetch(`${API_BASE_URL}/analytics/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        path: location.pathname + location.search,
                        referrer: document.referrer,
                        sessionId: sessionId
                    }),
                });
            } catch (error) {
                console.error("Tracking Error (Non-blocking):", error);
            }
        };

        trackPageView();

    }, [location]); // triggering on location change
};

export default usePageTracking;
