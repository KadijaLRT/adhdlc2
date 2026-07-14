/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        base: { 50: '#f8fafc', 900: '#0f172a', 950: '#020617' },
        slate: { 800: '#1e293b', 850: '#172033', 900: '#0f172a', 950: '#020617' },
        indigo: { 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5' },
        emerald: { 300: '#6ee7b7', 400: '#34d399', 500: '#10b981' },
        amber: { 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b' },
      },
    },
  },
  plugins: [],
};
