/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#F5A623',
          dark: '#C7851A',
          light: '#FFD080',
          glow: 'rgba(245,166,35,0.15)',
        },
        surface: {
          primary: '#0a0a0a',
          secondary: '#111111',
          card: '#161616',
          'card-hover': '#1c1c1c',
        },
        border: {
          DEFAULT: '#222222',
          hover: '#333333',
        },
      },
      fontFamily: {
        display: ['Archivo Black', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'card-in': 'cardIn 0.6s ease-out forwards',
        'grid-move': 'gridMove 20s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        cardIn: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        gridMove: {
          from: { transform: 'translate(0,0)' },
          to: { transform: 'translate(60px,60px)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 4px 20px rgba(37,211,102,0.4)' },
          '50%': { boxShadow: '0 4px 30px rgba(37,211,102,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
