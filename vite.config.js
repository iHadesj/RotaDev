import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  // Caminhos relativos (./assets/...) — obrigatório pra rodar via RomFS no
  // Web Applet offline do Switch, que não serve a partir de um host raiz.
  base: './',
  resolve: {
    alias: {
      // Troca o framer-motion pelo shim (elementos DOM puros, sem animação).
      // Elimina a dependência mais moderna do bundle — a mais provável de
      // quebrar no WebKit antigo do console. Ver src/lib/framer-motion-shim.jsx.
      'framer-motion': fileURLToPath(
        new URL('./src/lib/framer-motion-shim.jsx', import.meta.url)
      ),
    },
  },
  plugins: [
    react(),
    // Motor de render do Switch = WebKit antigo. O plugin-legacy transpila
    // tudo pra ES5 + injeta polyfills (core-js) e carrega via SystemJS com
    // <script> clássico. Com renderModernChunks:false NÃO sai nenhum
    // <script type="module"> — que é justamente o que o motor velho não
    // parseia. É o modo mais compatível possível, ao custo de bundle maior.
    legacy({
      targets: ['safari 11'],
      renderModernChunks: false,
    }),
  ],
});
