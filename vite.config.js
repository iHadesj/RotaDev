import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Mantém o deploy independente do domínio/subdiretório.
  base: './',
  // Web e produção usam o Framer Motion real. A compatibilidade do Switch
  // vive isolada em vite.switch.config.js e não afeta mais este build.
  plugins: [react()],
});
