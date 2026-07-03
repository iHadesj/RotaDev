import React from 'react';
import ReactDOM from 'react-dom/client';
import DevDoCorre from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(<DevDoCorre />);

// MODO BUSÃO 🚌 — service worker deixa o app funcionar offline.
// Só em produção: em dev ele brigaria com o HMR do Vite.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* sem SW (http, navegador antigo...) o app segue normal, só não fica offline */
    });
  });
}
