/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['IBM Plex Sans', 'sans-serif'],
                heading: ['Chivo', 'sans-serif'],
                mono: ['IBM Plex Mono', 'monospace'],
            },
            colors: {
                background: '#09090b',
                foreground: '#ffffff',
                card: {
                    DEFAULT: '#0f0f12',
                    foreground: '#ffffff'
                },
                popover: {
                    DEFAULT: '#0f0f12',
                    foreground: '#ffffff'
                },
                primary: {
                    DEFAULT: '#10b981',
                    hover: '#059669',
                    foreground: '#000000'
                },
                secondary: {
                    DEFAULT: '#18181b',
                    foreground: '#ffffff'
                },
                muted: {
                    DEFAULT: '#18181b',
                    foreground: '#a1a1aa'
                },
                accent: {
                    DEFAULT: '#10b981',
                    foreground: '#000000'
                },
                destructive: {
                    DEFAULT: '#ef4444',
                    foreground: '#ffffff'
                },
                border: '#27272a',
                input: '#27272a',
                ring: '#10b981',
            },
            borderRadius: {
                lg: '0.5rem',
                md: '0.375rem',
                sm: '0.25rem'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
