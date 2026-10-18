/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'iris-violet':      'rgb(var(--color-iris-violet) / <alpha-value>)',
        'deep-iris':        'rgb(var(--color-deep-iris) / <alpha-value>)',
        'cobalt-info':      'rgb(var(--color-cobalt-info) / <alpha-value>)',
        'powder-blue':      'rgb(var(--color-powder-blue) / <alpha-value>)',
        'graphite-ink':     'rgb(var(--color-graphite-ink) / <alpha-value>)',
        slate:              'rgb(var(--color-slate) / <alpha-value>)',
        ash:                'rgb(var(--color-ash) / <alpha-value>)',
        'mauve-dust':       'rgb(var(--color-mauve-dust) / <alpha-value>)',
        fog:                'rgb(var(--color-fog) / <alpha-value>)',
        'charcoal-hairline':'rgb(var(--color-charcoal-hairline) / <alpha-value>)',
        mist:               'rgb(var(--color-mist) / <alpha-value>)',
        'soft-snow':        'rgb(var(--color-soft-snow) / <alpha-value>)',
        'paper-white':      'rgb(var(--color-paper-white) / <alpha-value>)',
        'pure-black':       'rgb(var(--color-pure-black) / <alpha-value>)',

        // NEW — semantic status colors
        'success-bg':     'rgb(var(--color-success-bg) / <alpha-value>)',
        'success-border': 'rgb(var(--color-success-border) / <alpha-value>)',
        'success-text':   'rgb(var(--color-success-text) / <alpha-value>)',
        'warning-bg':     'rgb(var(--color-warning-bg) / <alpha-value>)',
        'warning-border': 'rgb(var(--color-warning-border) / <alpha-value>)',
        'warning-text':   'rgb(var(--color-warning-text) / <alpha-value>)',
        'error-bg':       'rgb(var(--color-error-bg) / <alpha-value>)',
        'error-border':   'rgb(var(--color-error-border) / <alpha-value>)',
        'error-text':     'rgb(var(--color-error-text) / <alpha-value>)',
        'info-bg':        'rgb(var(--color-info-bg) / <alpha-value>)',
        'info-border':    'rgb(var(--color-info-border) / <alpha-value>)',
        'info-text':      'rgb(var(--color-info-text) / <alpha-value>)',
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body:    'var(--font-body)',
        mono:    'var(--font-mono)',
      },
      borderRadius: {
        buttons: 'var(--radius-buttons)',
        cards:   'var(--radius-cards)',
        inputs:  'var(--radius-inputs)',
        images:  'var(--radius-images)',
        tags:    'var(--radius-tags)',
      },
      boxShadow: {
        cta: 'var(--shadow-cta)',
      },
      transitionTimingFunction: {
        overshoot: 'cubic-bezier(.34, 1.56, .64, 1)',
      },
      keyframes: {
        blob1: { '0%, 100%': { transform: 'translate(0, 0) scale(1)' }, '33%': { transform: 'translate(40px, -30px) scale(1.1)' }, '66%': { transform: 'translate(-20px, 20px) scale(0.95)' } },
        blob2: { '0%, 100%': { transform: 'translate(0, 0) scale(1)' }, '33%': { transform: 'translate(-30px, 30px) scale(1.05)' }, '66%': { transform: 'translate(20px, -20px) scale(0.9)' } },
        blob3: { '0%, 100%': { transform: 'translate(0, 0) scale(1)' }, '50%': { transform: 'translate(25px, 25px) scale(1.15)' } },
        float1: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        float2: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(10px)' } },
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