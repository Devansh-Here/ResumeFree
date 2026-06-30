/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:            '#0a1628',
        fog:            '#f8fafc',
        ash:            '#1e3a5f',
        graphite:       '#4a6fa5',
        dove:           '#cbd5e1',
        slate:          '#94a3b8',
        obsidian:       '#060d1a',
        rust:           '#059669',
        'apricot-wash': '#d1fae5',
        'sky-wash':     '#ecfdf5',
      },
      fontFamily: {
        signifier: ['"DM Serif Display"', 'Georgia', 'serif'],
        sohne:     ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        cards:   '24px',
        inputs:  '16px',
        buttons: '9999px',
        images:  '12px',
        tags:    '9999px',
      },
      boxShadow: {
        subtle: 'rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.08) 0px 20px 25px -5px, rgba(0,0,0,0.06) 0px 8px 10px -6px',
      },
      keyframes: {
        blob1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        blob2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-30px, 30px) scale(1.05)' },
          '66%': { transform: 'translate(20px, -20px) scale(0.9)' },
        },
        blob3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(25px, 25px) scale(1.15)' },
        },
        float1: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        float2: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(10px)' },
        },
      },
      animation: {
        blob1: 'blob1 12s ease-in-out infinite',
        blob2: 'blob2 14s ease-in-out infinite',
        blob3: 'blob3 10s ease-in-out infinite',
        float1: 'float1 6s ease-in-out infinite',
        float2: 'float2 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}