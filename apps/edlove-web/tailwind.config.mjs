/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                'serif': ['Playfair Display', 'Georgia', 'serif'], // Luxury headings
                'sans': ['Inter', 'system-ui', 'sans-serif'],      // Clean body
                'display': ['Space Grotesk', 'sans-serif'],        // Modern accents
            },
            colors: {
                warmGold: '#FFD700',       // More vibrant
                dawnRose: '#FF6B9D',       // More saturated pink
                cosmicPurple: '#9D4EDD',   // Richer purple
                skyBlue: '#00D4FF',        // More electric
                starlightSilver: '#F8F9FA',
                deepIndigo: '#1E1B4B',
            },
        },
    },
    plugins: [],
}
