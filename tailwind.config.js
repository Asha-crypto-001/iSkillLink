/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — workshop-credible forest (evolved from emerald, deeper trust)
        forest: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#0d8a5e',
          700: '#0F5132',
          800: '#0f3d26',
          900: '#0c2e1e',
          950: '#052e16',
        },
        // Neutral — single ink scale (replaces mixed slate/stone/gray)
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        paper: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#eef2f7',
        },
        sand: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
        },
        // Keep legacy aliases for gradual migration — mapped to new tokens
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#0d8a5e',
          700: '#0F5132',
          800: '#0f3d26',
          900: '#0c2e1e',
          950: '#052e16',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#152033',
          900: '#0f172a',
          950: '#020617',
        },
        uganda: {
          forest: '#0F5132',
          slate: '#1E293B',
          warm: '#F8FAFC',
          sand: '#F3F4F6',
          gold: '#D97706',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Google Sans', 'Google Sans Text', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Google Sans', 'Google Sans Text', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Ensures minimum 13px for functional text — 12 only for captions
        'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.25rem' }], // 13px
        'body': ['0.9375rem', { lineHeight: '1.6' }], // 15px
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
