import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import devContentEditorPlugin from './vite-plugin-dev-editor';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    devContentEditorPlugin(), // Dev-only file editing endpoint
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
