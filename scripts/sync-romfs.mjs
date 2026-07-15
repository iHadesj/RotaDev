// Copia o build do Vite (dist/) para o RomFS do projeto Switch, no lugar
// exato que o Web Applet offline espera: switch/romfs/html-document/.
//
// Rode depois de cada `vite build` (ou use `npm run build:switch`, que já
// encadeia os dois). Depois é só `make` dentro de switch/ no ambiente
// devkitPro pra gerar o .nro.

import { rmSync, cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(raiz, 'dist');
const destino = resolve(raiz, 'switch', 'romfs', 'html-document');

if (!existsSync(dist)) {
  console.error('[sync-romfs] dist/ não existe. Rode `npm run build` antes.');
  process.exit(1);
}

rmSync(destino, { recursive: true, force: true });
cpSync(dist, destino, { recursive: true });

console.log(`[sync-romfs] dist/ -> ${destino} OK`);
