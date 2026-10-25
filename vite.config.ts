import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// On Vercel the API is served from the same deployment, so the frontend calls /api directly.
// Setting it explicitly also turns off the browser-only demo fallback there.
if (process.env.VERCEL && !process.env.VITE_API_URL) {
  process.env.VITE_API_URL = '/api';
}

export default defineConfig({
  plugins: [react()],
  base: process.env.NETLIFY || process.env.VERCEL ? '/' : '/iSkillLink/',
  build: {
    assetsInlineLimit: 0,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      }
    }
  }
});
