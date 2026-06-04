/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['K2D', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bg-main': '#e4e8eb',
        'bg-sidebar': '#09162e',
        'bg-surface': '#ffffff',
        'text-main': '#44769b',
        'text-on-dark': '#a6c1d4',
        'action-inactive': '#18395c',
        'action-hover': '#2d5a87',
        'status-critical': '#c60202',
        'status-severe': '#ff6a00',
        'status-regular': '#cab900',
        'status-success': '#02c602',
        'status-critical-bg': '#fff0f0',
        'status-severe-bg': '#fff5ed',
        'status-regular-bg': '#fffbe0',
        'status-success-bg': '#f0fff0',
        'border-soft': '#d0dce6',
        'sidebar-active': '#2563eb',
      },
      fontSize: {
        'title-large': ['32px', { fontWeight: '700', lineHeight: '1.2' }],
        'title-medium': ['24px', { fontWeight: '700', lineHeight: '1.3' }],
        'card-title': ['18px', { fontWeight: '600', lineHeight: '1.4' }],
        body: ['14px', { fontWeight: '400', lineHeight: '1.6' }],
        label: ['12px', { fontWeight: '700', lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      boxShadow: {
        card: '0 2px 12px 0 rgba(9,22,46,0.07)',
        'card-hover': '0 6px 24px 0 rgba(9,22,46,0.13)',
        sidebar: '4px 0 24px 0 rgba(9,22,46,0.18)',
        modal: '0 16px 64px 0 rgba(9,22,46,0.22)',
      },
      borderRadius: {
        card: '12px',
        badge: '999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s cubic-bezier(.16,1,.3,1)',
        pulse2: 'pulse2 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulse2: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
      },
    },
  },
  plugins: [],
}