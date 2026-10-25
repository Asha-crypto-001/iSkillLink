/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — deep workshop green. Actions only (buttons, links, focus, "done").
        forest: {
          50: '#eef5f0',
          100: '#d8e8dd',
          200: '#b3d1bd',
          300: '#86b496',
          400: '#5a9470',
          500: '#3a7a55',
          600: '#276645',
          700: '#1f5a3d',
          800: '#184630',
          900: '#123524',
          950: '#0b2216',
        },
        // Neutral — warm "paper and ink" greys instead of cool slate.
        ink: {
          50: '#f7f5f2',
          100: '#efebe6',
          200: '#e2dcd4',
          300: '#cbc3b8',
          400: '#a39a8e',
          500: '#766d62',
          600: '#5c544a',
          700: '#453e36',
          800: '#2e2924',
          900: '#1f1c18',
          950: '#14120f',
        },
        // Accent — murram, the red earth of Ugandan roads. Reserved for money held in escrow.
        clay: {
          50: '#fbf1ec',
          100: '#f5dccf',
          200: '#eab9a0',
          500: '#c2643a',
          600: '#b4532a',
          700: '#8f4020',
          800: '#6e3119',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Source Sans 3 has a smaller x-height than the old face, so the small steps sit
        // one notch larger: functional text is never below 12px, everyday small text is 13px.
        'xs': ['0.8125rem', { lineHeight: '1.125rem' }], // 13px
        'sm': ['0.9375rem', { lineHeight: '1.375rem' }], // 15px
        'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }], // 12px
        'body-sm': ['0.875rem', { lineHeight: '1.3125rem' }], // 14px
        'body': ['1rem', { lineHeight: '1.6' }], // 16px
      },
      borderRadius: {
        'control': '12px',
        'card': '16px',
        'display': '20px',
        'pill': '9999px',
      },
      boxShadow: {
        'level-1': '0 1px 2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.08), 0 0 0 1px rgba(226,232,240,0.6)',
        'level-2': '0 8px 24px rgba(15,23,42,0.08), 0 0 0 1px rgba(226,232,240,0.8)',
        'level-3': '0 20px 40px rgba(15,23,42,0.14), 0 0 0 1px rgba(226,232,240,0.8)',
        'soft': '0 1px 2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.08)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },
      maxWidth: {
        'container': '1280px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        slideUp: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
