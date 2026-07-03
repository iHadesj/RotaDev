/* =====================================================================
   DEV DO CORRE · Service Worker — MODO BUSÃO 🚌
   Estratégia:
   · navegação (HTML): network-first, cai pro cache no túnel
   · assets same-origin (js/css/ícones): stale-while-revalidate
   · CDNs (fontes + libs do sandbox): cache-first, pré-aquecidas no install
   ===================================================================== */

const VERSAO = 'ddc-v1';
const CACHE_APP = VERSAO + '-app';
const CACHE_CDN = VERSAO + '-cdn';

// libs que o sandbox usa + fontes — baixa já no install pra
// funcionar offline mesmo que o usuário nunca tenha aberto um desafio
const PREAQUECER_CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.development.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.development.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js',
  'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const app = await caches.open(CACHE_APP);
      await app.addAll(['/', '/manifest.webmanifest']);
      const cdn = await caches.open(CACHE_CDN);
      // best-effort: sem rede no install, segue o baile
      await Promise.allSettled(PREAQUECER_CDN.map((u) => cdn.add(u)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const nomes = await caches.keys();
      await Promise.all(nomes.filter((n) => !n.startsWith(VERSAO)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // navegação: tenta a rede (app atualizado), cai pro cache offline
  if (req.mode === 'navigate') {
    e.respondWith(
      (async () => {
        try {
          const resp = await fetch(req);
          const cache = await caches.open(CACHE_APP);
          cache.put('/', resp.clone());
          return resp;
        } catch (err) {
          return (await caches.match('/')) || Response.error();
        }
      })()
    );
    return;
  }

  const ehCDN =
    url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  // CDN: cache-first (essas URLs são versionadas, não mudam)
  if (ehCDN) {
    e.respondWith(
      (async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        const resp = await fetch(req);
        if (resp.ok || resp.type === 'opaque') {
          const cache = await caches.open(CACHE_CDN);
          cache.put(req, resp.clone());
        }
        return resp;
      })()
    );
    return;
  }

  // assets do próprio app: stale-while-revalidate
  if (url.origin === self.location.origin) {
    e.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_APP);
        const hit = await cache.match(req);
        const atualiza = fetch(req)
          .then((resp) => {
            if (resp.ok) cache.put(req, resp.clone());
            return resp;
          })
          .catch(() => null);
        return hit || (await atualiza) || Response.error();
      })()
    );
  }
});
