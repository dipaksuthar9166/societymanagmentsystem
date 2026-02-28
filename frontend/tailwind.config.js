/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'selector', // Enable dark mode with selector strategy
    theme: {
        extend: {
            colors: {
                // Map Tailwind 'indigo' to our Dynamic Theme Engine
                indigo: {
                    50: 'var(--theme-50)',
                    100: 'var(--theme-100)',
                    200: 'var(--theme-200)',
                    300: 'var(--theme-300)',
                    400: 'var(--theme-400)',
                    500: 'var(--theme-500)',
                    600: 'var(--theme-600)',
                    700: 'var(--theme-700)',
                    800: 'var(--theme-800)',
                    900: 'var(--theme-900)',
                    950: 'color-mix(in srgb, var(--theme-primary), black 50%)',
                }
            }
        },
    },
    plugins: [],
}
