/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:            '#0a1628',  // Deep Navy — primary text, CTA bg ← CHANGED
        fog:            '#f8fafc',  // Slate 50  — secondary bg
        ash:            '#1e3a5f',  // Navy 700  — muted body text ← CHANGED
        graphite:       '#4a6fa5',  // Navy 400  — tertiary text ← CHANGED
        dove:           '#cbd5e1',  // Slate 300 — borders, dividers
        slate:          '#94a3b8',  // Slate 400 — placeholder
        obsidian:       '#060d1a',  // Darkest navy ← CHANGED
        rust:           '#059669',  // Emerald 600 — accent ✦
        'apricot-wash': '#d1fae5',  // Emerald 100 — light accent bg
        'sky-wash':     '#ecfdf5',  // Emerald 50  — subtle tint
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
    },
  },
  plugins: [],
}