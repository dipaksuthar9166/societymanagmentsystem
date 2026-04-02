// Smart API Configuration for Mobile & Laptop Access
// Automatically detects if running on mobile or laptop

const getAPIBaseURL = () => {
    // Return live backend URL for all environments
    return 'https://societymanagmentsystem.onrender.com/api';
    // return 'http://localhost:5001/api';
};

export const API_BASE_URL = getAPIBaseURL();
export const BACKEND_URL = API_BASE_URL.replace('/api', '');

/**
 * Resolves image URLs for mobile/laptop access.
 * If the URL contains localhost but accessed via IP, it replaces it.
 */
export const resolveImageURL = (url) => {
    if (!url) return null;

    // Convert Windows backslashes to forward slashes first
    let finalUrl = String(url).replace(/\\/g, '/');

    // Remove any accidental double slashes early on (except for protocol)
    finalUrl = finalUrl.replace(/([^:]\/)\/+/g, "$1");

    // If it's a relative path, prepend backend URL
    if (finalUrl.startsWith('/uploads')) {
        finalUrl = `${BACKEND_URL}${finalUrl}`;
    } else if (finalUrl.startsWith('uploads')) {
        finalUrl = `${BACKEND_URL}/${finalUrl}`;
    }

    // Force HTTPS for Render links (fixes Mixed Content 404 blocked images)
    if (typeof finalUrl === 'string' && finalUrl.includes('societymanagmentsystem.onrender.com')) {
        finalUrl = finalUrl.replace('http://', 'https://');
    }

    // If it's an absolute URL pointing to localhost or local IP, fix it for live backend
    if (typeof finalUrl === 'string' && (finalUrl.includes('localhost') || finalUrl.includes('192.168.'))) {
        finalUrl = finalUrl.replace(/https?:\/\/[^/]+/g, BACKEND_URL);
    }

    // Final safety check: Clean up any double slashes that might have been introduced during concatenation
    finalUrl = finalUrl.replace(/([^:]\/)\/+/g, "$1");

    return finalUrl;
};

// Manual override for development (uncomment if needed)
// export const API_BASE_URL = 'http://192.168.1.100:5001/api'; // Replace with your IP

console.log('🔗 API Connected to:', API_BASE_URL);
