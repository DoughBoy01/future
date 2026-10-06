import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import devContentEditorPlugin from './vite-plugin-dev-editor';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    devContentEditorPlugin(), // Dev-only file editing endpoint
  ],
  server: {
    // `npm run dev:api` serves the Worker (API + media) on 8787.
    proxy: {
      '/api': 'http://localhost:8787',
      '/media': 'http://localhost:8787',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['framer-motion', 'canvas-confetti'],
    force: true,
  },
});
