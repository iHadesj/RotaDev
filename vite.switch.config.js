import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

// Configuração legada isolada. Use apenas com `npm run build:switch`.
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      'framer-motion': fileURLToPath(
        new URL('./src/lib/framer-motion-shim.jsx', import.meta.url)
      ),
    },
  },
  plugins: [
    react(),
    legacy({
      targets: ['safari 11'],
      renderModernChunks: false,
    }),
  ],
});
