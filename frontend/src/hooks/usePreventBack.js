import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const usePreventBack = () => {
    const { logout } = useAuth();
    const logoutRef = useRef(logout);

    useEffect(() => {
        logoutRef.current = logout;
    }, [logout]);

    useEffect(() => {
        // Push a trap state into history
        window.history.pushState({ trap: true }, '', window.location.href);

        const handlePopState = (event) => {
            // They pressed back, popping our trap. 
            // We push it right back so the user doesn't actually leave.
            window.history.pushState({ trap: true }, '', window.location.href);
            
            // Trigger the logout confirmation dialog
            if (logoutRef.current) {
                logoutRef.current();
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []); // Only run once on mount
};

export default usePreventBack;
