import React from 'react';
import ReactDOM from 'react-dom/client';
import DevDoCorre from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(<DevDoCorre />);

// Sem service worker: o motor WebKit antigo do Switch não suporta SW, e o
// offline aqui vem do RomFS (tudo já está no cartucho/SD, nada de rede).
