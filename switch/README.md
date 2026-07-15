# Dev do Corre — homebrew Switch (.nro)

Wrapper que sobe o **Web Applet offline** do sistema apontando pro build do
Vite embutido no RomFS. Roda em Switch com Atmosphère CFW.

## Estrutura

```
switch/
├── Makefile              # template devkitPro (ROMFS := romfs, metadados no NACP)
├── icon.jpg              # ícone 256x256 do NACP
├── source/main.c         # webOfflineCreate + webConfigShow
└── romfs/
    └── html-document/    # <- build do Vite (dist/) copiado pra cá (GERADO)
```

> `romfs/html-document/` é **gerado** a partir de `../dist`. Não edite à mão.
> O nome `html-document/` é obrigatório: `WebDocumentKind_OfflineHtmlPage`
> resolve o `docPath` ("index.html") relativo a essa pasta dentro do RomFS.

## Como gerar o .nro

1. **No Windows (raiz do projeto)** — build web + sincroniza o RomFS:
   ```
   npm run build:switch
   ```
   (isso roda `vite build` e copia `dist/` -> `switch/romfs/html-document/`)

2. **No shell do devkitPro (MSYS2 / "devkitPro MSYS2")** — dentro de `switch/`:
   ```
   make
   ```
   Sai um `dev-do-corre.nro` aqui na pasta.

## Instalar no console

Copie `dev-do-corre.nro` pro SD em:

```
/switch/dev-do-corre/dev-do-corre.nro
```

Abra pelo **hbmenu** (Album com o jogo segurando R, ou o hbmenu via título).
Lançar pelo hbmenu garante o acesso ao applet web.

## Pré-requisitos

- devkitPro + devkitA64 + libnx (pacote `switch-dev`), com `$DEVKITPRO` no ambiente.
- Atmosphère atualizado no console (firmware recente ⇒ WebKit menos antigo).
