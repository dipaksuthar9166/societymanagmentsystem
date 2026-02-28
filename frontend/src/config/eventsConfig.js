
// Event Configuration for STATUS Sharan
// This file contains the dates and settings for automatic festive themes.

const currentYear = new Date().getFullYear();

export const EVENTS = [
    // --- FIXED DATES ---
    {
        id: 'republic_day',
        name: 'Republic Day',
        type: 'patriotic',
        // Month is 0-indexed (Jan is 0)
        start: { month: 0, day: 26 },
        end: { month: 0, day: 26 },
        theme: {
            primary: '#FF9933', // Saffron
            secondary: '#138808', // Green
            accent: '#000088' // Navy
        },
        animation: 'tricolor-confetti',
        heroBannerText: 'Happy Republic Day! 🇮🇳'
    },
    {
        id: 'independence_day',
        name: 'Independence Day',
        type: 'patriotic',
        start: { month: 7, day: 15 }, // August 15
        end: { month: 7, day: 15 },
        theme: {
            primary: '#FF9933',
            secondary: '#138808',
            accent: '#000088'
        },
        animation: 'tricolor-flag',
        heroBannerText: 'Happy Independence Day! 🇮🇳'
    },
    {
        id: 'gandhi_jayanti',
        name: 'Gandhi Jayanti',
        type: 'patriotic',
        start: { month: 9, day: 2 }, // Oct 2
        end: { month: 9, day: 2 },
        theme: {
            primary: '#f9f9f9',
            secondary: '#333',
            accent: '#FF9933'
        },
        animation: 'peace-symbols', // Could be simple fade
        heroBannerText: 'Mahatma Gandhi Jayanti ☸️'
    },
    {
        id: 'christmas',
        name: 'Christmas',
        type: 'festival',
        start: { month: 11, day: 24 }, // Dec 24
        end: { month: 11, day: 26 },   // Dec 26
        theme: {
            primary: '#D42426', // Red
            secondary: '#165B33', // Green
            accent: '#F8B229' // Gold
        },
        animation: 'snowfall',
        heroBannerText: 'Merry Christmas! 🎄'
    },
    {
        id: 'new_year',
        name: 'New Year',
        type: 'celebration',
        start: { month: 0, day: 1 }, // Jan 1
        end: { month: 0, day: 10 },   // Jan 10
        theme: {
            primary: '#FFD700', // Gold
            secondary: '#000000', // Black
            accent: '#C0C0C0' // Silver
        },
        animation: 'fireworks',
        heroBannerText: 'Happy New Year! 🎉'
    },
    {
        id: 'new_year_eve',
        name: 'New Year Eve',
        type: 'celebration',
        start: { month: 11, day: 31 }, // Dec 31
        end: { month: 11, day: 31 },
        theme: {
            primary: '#FFD700',
            secondary: '#000000',
            accent: '#C0C0C0'
        },
        animation: 'fireworks',
        heroBannerText: 'Happy New Year Eve! 🥂'
    },

    // --- VARIABLE DATES (Hardcoded for 2025-2026 for simplicity) ---
    // You can extend this logic or use a library for lunar calendars later.

    // Diwali
    {
        id: 'diwali_2024',
        name: 'Diwali',
        type: 'festival',
        year: 2024,
        start: { month: 10, day: 31 }, // Nov 1 (+/- 1 day)
        end: { month: 10, day: 2 },
        theme: {
            primary: '#FFD700', // Gold
            secondary: '#FF4500', // Orange Red
            accent: '#8B0000' // Dark Red
        },
        animation: 'diyas-sparkle',
        heroBannerText: 'Happy Diwali! 🪔'
    },
    {
        id: 'diwali_2025',
        name: 'Diwali',
        type: 'festival',
        year: 2025,
        start: { month: 9, day: 19 }, // Oct 20 (approx)
        end: { month: 9, day: 22 },
        theme: {
            primary: '#FFD700',
            secondary: '#FF4500',
            accent: '#8B0000'
        },
        animation: 'diyas-sparkle',
        heroBannerText: 'Happy Diwali! 🪔'
    },

    // Holi
    {
        id: 'holi_2025',
        name: 'Holi',
        type: 'festival',
        year: 2025,
        start: { month: 2, day: 13 }, // March 14
        end: { month: 2, day: 15 },
        theme: {
            primary: '#FF00FF', // Magenta
            secondary: '#00FFFF', // Cyan
            accent: '#FFFF00' // Yellow
        },
        animation: 'color-splash',
        heroBannerText: 'Happy Holi! 🎨'
    },
    {
        id: 'holi_2026',
        name: 'Holi',
        type: 'festival',
        year: 2026,
        start: { month: 2, day: 3 }, // March 3
        end: { month: 2, day: 4 },
        theme: {
            primary: '#FF00FF',
            secondary: '#00FFFF',
            accent: '#FFFF00'
        },
        animation: 'color-splash',
        heroBannerText: 'Happy Holi! 🎨'
    }
];

// Helper to check if today matches an event
export const getActiveEvent = () => {
    const today = new Date();
    // For testing: Uncomment below to test a specific date
    // const today = new Date('2025-01-26');

    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    const currentYear = today.getFullYear();

    return EVENTS.find(event => {
        // Check Year Validity for variable events
        if (event.year && event.year !== currentYear) return false;

        // Check Date Range
        // Simplify: assuming start/end are within same month for now or simple cross-over
        if (event.start.month === event.end.month) {
            return currentMonth === event.start.month &&
                currentDay >= event.start.day &&
                currentDay <= event.end.day;
        } else {
            // Cross-month logic (e.g. Dec 31 to Jan 1) - handled individually in list
            return (currentMonth === event.start.month && currentDay >= event.start.day) ||
                (currentMonth === event.end.month && currentDay <= event.end.day);
        }
    });
};
