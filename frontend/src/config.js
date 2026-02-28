// Smart API Configuration for Mobile & Laptop Access
// Automatically detects if running on mobile or laptop

const getAPIBaseURL = () => {
    // Check if running on mobile (different hostname)
    const hostname = window.location.hostname;

    // If accessing via IP address (mobile), use that IP
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:5001/api`;
    }

    // Default to localhost for laptop/desktop
    return 'http://localhost:5001/api';
};

export const API_BASE_URL = getAPIBaseURL();
export const BACKEND_URL = API_BASE_URL.replace('/api', '');

/**
 * Resolves image URLs for mobile/laptop access.
 * If the URL contains localhost but accessed via IP, it replaces it.
 */
export const resolveImageURL = (url) => {
    if (!url) return null;

    // If it's a relative path, prepend backend URL
    if (url.startsWith('/uploads')) {
        return `${BACKEND_URL}${url}`;
    }

    if (url.startsWith('uploads')) {
        return `${BACKEND_URL}/${url}`;
    }

    // If it's an absolute URL pointing to localhost, fix it for mobile
    if (url.includes('localhost:5001') || url.includes('127.0.0.1:5001')) {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return url.replace(/localhost:5001|127.0.0.1:5001/, `${hostname}:5001`);
        }
    }

    return url;
};

// Manual override for development (uncomment if needed)
// export const API_BASE_URL = 'http://192.168.1.100:5001/api'; // Replace with your IP

console.log('🔗 API Connected to:', API_BASE_URL);
