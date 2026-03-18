/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'resort-gold': '#C5A059', // More refined gold
                'resort-gold-light': '#E5C687',
                'resort-gold-dark': '#A3803B',
                'resort-blue': '#2C5F78', // Deep ocean blue
                'resort-blue-light': '#5D8AA8',
                'resort-dark': '#1A1A1A', // Softer black
                'resort-cream': '#F9F7F2', // Off-white for backgrounds
            },
            fontFamily: {
                'sans': ['Inter', 'sans-serif'],
                'serif': ['Playfair Display', 'serif'],
            },
            backgroundImage: {
                'luxury-pattern': "url('https://www.transparenttextures.com/patterns/cubes.png')", // Subtle pattern if needed
            }
        },
    },
    plugins: [],
}
