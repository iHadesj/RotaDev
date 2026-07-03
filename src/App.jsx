import React, { useState, useEffect, useRef, useId } from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  LayoutGroup,
} from "framer-motion";
import confetti from "canvas-confetti";

/* =====================================================================
   DEV DO CORRE v3 — do extremo sul até a Faria Lima
   Agora com DUAS linhas de busão (dois cursos):
   · LINHA 5X-SUL — React + Java (fullstack)
   · LINHA 6X-SUL — HTML + CSS + JS do zero ao avançado + mini TypeScript
   E 3 tipos de desafio:
   · QUIZ     — múltipla escolha
   · ENCAIXE  — quebra-cabeça: monta o código peça por peça
   · CÓDIGO   — digita de verdade, roda, vê na tela, com lint amigável
   React, HTML, CSS, JS e TS rodam AO VIVO num sandbox. Java é validado
   com lint amigável (a saída é simulada — Java precisa da JVM).
   ===================================================================== */

const STORAGE_KEY = "dev_do_corre_v1";
const TEMA_KEY = "dev_do_corre_tema_v1";
const CURSO_KEY = "dev_do_corre_curso_v1";

const TEMAS = [
  { id: "padrao", nome: "5X-Sul (claro)", cor: "#FF4D00", papel: "#EFE9DC" },
  { id: "noite", nome: "Noite (escuro)", cor: "#FF6A26", papel: "#131318" },
  { id: "vapor", nome: "Vapor (rosa)", cor: "#FF2E88", papel: "#FBE8EF" },
  { id: "taxi", nome: "Táxi (amarelo)", cor: "#FFB800", papel: "#F5F1DC" },
];

const LEVELS = [
  { min: 0, nome: "Estagiário do Corre" },
  { min: 160, nome: "Dev Júnior" },
  { min: 320, nome: "Dev Pleno" },
  { min: 500, nome: "Dev Sênior" },
  { min: 700, nome: "Tech Lead do Extremo Sul" },
];

function getLevel(xp) {
  let atual = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) atual = l;
  const idx = LEVELS.indexOf(atual);
  const prox = LEVELS[idx + 1] || null;
  return { ...atual, prox };
}

/* ---------- animações (framer-motion + confete) ---------- */

const springMedio = { type: "spring", stiffness: 420, damping: 30 };

const telaVariants = {
  inicial: { opacity: 0, x: 40 },
  entra: { opacity: 1, x: 0, transition: { duration: 0.28, ease: "easeOut" } },
  sai: { opacity: 0, x: -40, transition: { duration: 0.18, ease: "easeIn" } },
};

const listaStagger = {
  entra: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

const itemSobe = {
  inicial: { opacity: 0, y: 18 },
  entra: { opacity: 1, y: 0, transition: springMedio },
};

const itemLado = {
  inicial: { opacity: 0, x: -28 },
  entra: { opacity: 1, x: 0, transition: springMedio },
};

const CORES_CONFETE = ["#FF4D00", "#B8F53C", "#2B2BFF", "#0D0D0D", "#FFF3B0"];

function estouraConfete(opts = {}) {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.6 },
    colors: CORES_CONFETE,
    disableForReducedMotion: true,
    ...opts,
  });
}

function chuvaDeConfete() {
  estouraConfete({ particleCount: 140, spread: 100, origin: { y: 0.5 } });
  setTimeout(
    () =>
      estouraConfete({
        particleCount: 80,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.75 },
      }),
    250,
  );
  setTimeout(
    () =>
      estouraConfete({
        particleCount: 80,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.75 },
      }),
    450,
  );
}

// contagem animada pro placar do resultado
function useContagem(alvo, dur = 900) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    let raf;
    const t0 = performance.now();
    function tick(t) {
      const p = Math.min(1, (t - t0) / dur);
      setValor(Math.round(alvo * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [alvo, dur]);
  return valor;
}

/* ============================ UTILS ============================ */

function embaralha(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function embaralhaDiferente(arr) {
  if (arr.length < 2) return [...arr];
  let r = embaralha(arr);
  let guard = 0;
  while (guard < 10 && r.every((x, i) => x === arr[i])) {
    r = embaralha(arr);
    guard++;
  }
  return r;
}

/* ---------- LINT AMIGÁVEL ---------- */

// Checa (), {} e [] desbalanceados, strings abertas, e aponta a linha.
function lintDelimitadores(codigo) {
  const avisos = [];
  const pares = { ")": "(", "}": "{", "]": "[" };
  const abre = { "(": ")", "{": "}", "[": "]" };
  const nomes = { "(": "parêntese", "{": "chave", "[": "colchete" };
  const stack = [];
  let linha = 1;
  let emString = null;

  for (let i = 0; i < codigo.length; i++) {
    const c = codigo[i];
    if (c === "\n") {
      if (emString && emString.ch !== "`") {
        avisos.push({
          nivel: "erro",
          msg:
            "Linha " +
            emString.linha +
            ": abriu uma string com " +
            emString.ch +
            " e pulou de linha sem fechar. Fecha as aspas antes do fim da linha.",
        });
        emString = null;
      }
      linha++;
      continue;
    }
    if (emString) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === emString.ch) emString = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      emString = { ch: c, linha };
      continue;
    }
    if (c === "/" && codigo[i + 1] === "/") {
      while (i < codigo.length && codigo[i] !== "\n") i++;
      i--;
      continue;
    }
    if (c === "/" && codigo[i + 1] === "*") {
      i += 2;
      while (
        i < codigo.length - 1 &&
        !(codigo[i] === "*" && codigo[i + 1] === "/")
      ) {
        if (codigo[i] === "\n") linha++;
        i++;
      }
      i++;
      continue;
    }
    if (abre[c]) {
      stack.push({ c, linha });
    } else if (pares[c]) {
      const topo = stack.pop();
      if (!topo || topo.c !== pares[c]) {
        avisos.push({
          nivel: "erro",
          msg:
            "Linha " +
            linha +
            ": tem um " +
            c +
            " sobrando (ou fora de ordem). Confere se ele tem um par aberto antes.",
        });
      }
    }
  }
  if (emString) {
    avisos.push({
      nivel: "erro",
      msg: "Linha " + emString.linha + ": string aberta que nunca fecha.",
    });
  }
  for (const s of stack) {
    avisos.push({
      nivel: "erro",
      msg:
        "Linha " +
        s.linha +
        ": o " +
        nomes[s.c] +
        " " +
        s.c +
        " abriu e nunca fechou. Todo " +
        s.c +
        " precisa do seu par " +
        abre[s.c] +
        ".",
    });
  }
  return avisos;
}

// Erros clássicos de quem está começando no Java, explicados com calma.
function lintJava(codigo) {
  const avisos = [];
  const linhas = codigo.split("\n");
  linhas.forEach((l, idx) => {
    const n = idx + 1;
    const t = l.trim();
    if (!t || t.startsWith("//") || t.startsWith("/*") || t.startsWith("*"))
      return;

    if (/\bsystem\.out/.test(l)) {
      avisos.push({
        nivel: "erro",
        msg:
          "Linha " +
          n +
          ": Java diferencia maiúscula de minúscula — é System, com S maiúsculo.",
      });
    }
    if (/System\.out\.(printLn|Println|PrintLn|PRINTLN)/.test(l)) {
      avisos.push({
        nivel: "erro",
        msg:
          "Linha " + n + ": o método é println, tudo minúsculo (print line).",
      });
    }
    if (/\bstring\s+\w/.test(l)) {
      avisos.push({
        nivel: "erro",
        msg:
          "Linha " + n + ": String é uma classe, então começa com S maiúsculo.",
      });
    }
    if (/\b(Int|INT)\s+\w+\s*=/.test(l)) {
      avisos.push({
        nivel: "erro",
        msg:
          "Linha " +
          n +
          ": o tipo é int, minúsculo — os primitivos são todos minúsculos.",
      });
    }
    if (/String\s+\w+\s*=\s*'[^']*'/.test(l)) {
      avisos.push({
        nivel: "erro",
        msg:
          "Linha " +
          n +
          ': String usa aspas DUPLAS " ". Aspas simples em Java é só pra char (um caractere só).',
      });
    }

    // heurística do ponto e vírgula — aviso suave, sem bloquear
    const terminaOk = /[;{},]$/.test(t) || /\)\s*\{$/.test(t);
    const ehEstrutura =
      /^(public|private|protected|static|class|interface|if|else|for|while|do|switch|case|default|try|catch|finally|@|package|import|return$)/.test(
        t,
      );
    const pareceComando =
      /(System\.out|=|\+\+|--|return\s+\S|^\w+\.\w+\(|^\w+\()/.test(t) &&
      !/^(if|for|while|switch|catch)\b/.test(t);
    if (!terminaOk && !ehEstrutura && pareceComando) {
      avisos.push({
        nivel: "aviso",
        msg:
          "Linha " +
          n +
          ": essa linha parece um comando — em Java, comando termina com ; (ponto e vírgula).",
      });
    }
  });
  return avisos;
}

// Deslizes clássicos de JSX.
function lintJSX(codigo) {
  const avisos = [];
  const linhas = codigo.split("\n");
  linhas.forEach((l, idx) => {
    const n = idx + 1;
    if (/<\w[^>]*\bclass=/.test(l)) {
      avisos.push({
        nivel: "erro",
        msg:
          "Linha " +
          n +
          ": no JSX é className, não class (class é palavra reservada do JavaScript).",
      });
    }
    if (/\bonclick=/.test(l)) {
      avisos.push({
        nivel: "erro",
        msg:
          "Linha " +
          n +
          ": eventos no React são camelCase — onClick, com C maiúsculo.",
      });
    }
    if (/\bonchange=/.test(l)) {
      avisos.push({
        nivel: "erro",
        msg: "Linha " + n + ": é onChange, com C maiúsculo.",
      });
    }
    if (
      /\buseState\s*\(/.test(l) &&
      /^(var|let)\s+\w+\s*=\s*useState/.test(l.trim())
    ) {
      avisos.push({
        nivel: "aviso",
        msg:
          "Linha " +
          n +
          ": o useState devolve um ARRAY — o costume é desestruturar: const [valor, setValor] = useState(...).",
      });
    }
  });
  return avisos;
}

// Erros clássicos de quem está começando no HTML.
function lintHTML(codigo) {
  const avisos = [];
  const semComentario = codigo.replace(/<!--[\s\S]*?-->/g, "");
  const VAZIAS = ["img", "br", "hr", "input", "meta", "link", "source"];
  const PARES = [
    "main",
    "header",
    "footer",
    "nav",
    "section",
    "article",
    "div",
    "span",
    "p",
    "a",
    "button",
    "form",
    "label",
    "select",
    "option",
    "textarea",
    "ul",
    "ol",
    "li",
    "table",
    "tr",
    "td",
    "th",
    "strong",
    "em",
    "style",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ];
  for (const tag of PARES) {
    const abre = (
      semComentario.match(new RegExp("<" + tag + "(\\s[^>]*)?>", "gi")) || []
    ).length;
    const fecha = (
      semComentario.match(new RegExp("</" + tag + "\\s*>", "gi")) || []
    ).length;
    if (abre > fecha) {
      avisos.push({
        nivel: "erro",
        msg:
          "A tag <" +
          tag +
          "> abriu " +
          abre +
          "x mas só fechou " +
          fecha +
          "x. Toda <" +
          tag +
          "> precisa do par </" +
          tag +
          ">.",
      });
    } else if (fecha > abre) {
      avisos.push({
        nivel: "erro",
        msg:
          "Tem um </" +
          tag +
          "> sobrando — fechou " +
          fecha +
          "x mas só abriu " +
          abre +
          "x.",
      });
    }
  }
  if (/<image[\s>]/i.test(semComentario)) {
    avisos.push({
      nivel: "erro",
      msg: "A tag de imagem é <img>, não <image>. E ela é vazia — não precisa fechar.",
    });
  }
  for (const tag of VAZIAS) {
    if (new RegExp("</" + tag + "\\s*>", "i").test(semComentario)) {
      avisos.push({
        nivel: "aviso",
        msg:
          "<" +
          tag +
          "> é uma tag vazia — não existe </" +
          tag +
          ">. Escreve só <" +
          tag +
          "> (ou <" +
          tag +
          " />).",
      });
    }
  }
  return avisos;
}

// Deslizes clássicos de JS/TS puro.
function lintJS(codigo) {
  const avisos = [];
  const linhas = codigo.split("\n");
  linhas.forEach((l, idx) => {
    const n = idx + 1;
    const t = l.trim();
    if (!t || t.startsWith("//")) return;
    if (/\bconsole\.(Log|LOG)\b/.test(l)) {
      avisos.push({
        nivel: "erro",
        msg:
          "Linha " +
          n +
          ": é console.log, tudo minúsculo — JavaScript diferencia maiúscula de minúscula.",
      });
    }
    if (/\bConsole\.log/.test(l)) {
      avisos.push({
        nivel: "erro",
        msg: "Linha " + n + ": console começa com c minúsculo.",
      });
    }
    if (
      /\bdocument\.(querySelektor|querySeletor|queryselector)\b/i.test(l) &&
      !/querySelector(All)?\b/.test(l)
    ) {
      avisos.push({
        nivel: "erro",
        msg:
          "Linha " +
          n +
          ": o método é querySelector — com S maiúsculo e escrito assim mesmo.",
      });
    }
    if (/if\s*\([^)]*[^=!<>]=(?![=>])/.test(l)) {
      avisos.push({
        nivel: "aviso",
        msg:
          "Linha " +
          n +
          ": dentro do if tem um = sozinho — isso ATRIBUI valor em vez de comparar. Pra comparar usa === .",
      });
    }
  });
  return avisos;
}

// Traduz o "erro de IDE" pro português do dia a dia.
function traduzErro(msg) {
  msg = String(msg || "");
  let m;
  if (msg === "SEM_APP") {
    return "Não achei um componente chamado App. O desafio precisa de um function App() { ... } — é ele que o jogo renderiza na tela.";
  }
  if (
    (m = msg.match(/ReferenceError:?\s*(\w+) is not defined/)) ||
    (m = msg.match(/(\w+) is not defined/))
  ) {
    return (
      'Você usou "' +
      m[1] +
      '", mas essa variável/função não existe (ainda). Ou faltou criar, ou o nome está escrito diferente — e maiúscula/minúscula conta!'
    );
  }
  if ((m = msg.match(/([\w.$]+) is not a function/))) {
    return (
      '"' +
      m[1] +
      '" não é uma função. Confere se o nome está certo — ou se essa variável está guardando outra coisa sem você perceber.'
    );
  }
  if (/Adjacent JSX elements/i.test(msg)) {
    return "O return do JSX só aceita UM elemento pai. Embrulha tudo numa <div> ... </div> (ou num fragmento <> ... </>).";
  }
  if ((m = msg.match(/Expected corresponding JSX closing tag for <(\w+)>/))) {
    return (
      "A tag <" +
      m[1] +
      "> abriu e não fechou. Toda tag JSX fecha: </" +
      m[1] +
      "> — ou se ela é vazia, auto-fecha com />."
    );
  }
  if (/Unterminated string/i.test(msg)) {
    return "Tem uma string (texto entre aspas) que abriu e não fechou em algum canto.";
  }
  if ((m = msg.match(/Unexpected token[^(]*\((\d+):\d+\)/))) {
    return (
      "O código tropeçou em algo inesperado perto da linha " +
      m[1] +
      " do seu código. Normalmente é chave/parêntese fora do lugar, vírgula sobrando, ou algo que não fechou na linha de cima."
    );
  }
  if (/Unexpected token/i.test(msg)) {
    return "Tem um caractere fora do lugar — geralmente chave, parêntese ou vírgula. Revisa o começo e o fim de cada linha.";
  }
  if (/Cannot read propert/i.test(msg)) {
    return "Você tentou acessar algo dentro de um valor que está undefined ou null. Confere se a variável foi preenchida ANTES de usar.";
  }
  if (/Maximum update depth|Too many re-renders/i.test(msg)) {
    return "Loop infinito de renderização! Provavelmente você está chamando a função set direto no corpo do componente (ou num useEffect sem array de dependências).";
  }
  return (
    'O erro cru foi: "' +
    msg +
    '". Lê com calma — geralmente ele mesmo entrega a pista. Se travar, pede uma dica aí embaixo.'
  );
}

/* ---------- SANDBOX: React rodando de verdade num iframe ---------- */

function escapaScript(s) {
  return String(s).replace(/<\/script/gi, "<\\/script");
}

function montaSrcDoc(codigo, preambulo) {
  const user = escapaScript((preambulo ? preambulo + "\n\n" : "") + codigo);
  return [
    '<!DOCTYPE html><html><head><meta charset="utf-8"/>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.development.js"></' +
      "script>",
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.development.js"></' +
      "script>",
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></' +
      "script>",
    "<style>",
    "body{font-family:system-ui,-apple-system,sans-serif;background:#ffffff;color:#0D0D0D;padding:14px;margin:0;font-size:15px}",
    "button{font-size:15px;padding:8px 14px;border-radius:0;border:2px solid #0D0D0D;background:#FF4D00;cursor:pointer;font-weight:700}",
    "button:active{transform:translate(1px,1px)}",
    "input{font-size:15px;padding:8px 10px;border-radius:0;border:2px solid #0D0D0D}",
    "ul{padding-left:22px} li{margin:4px 0} h1,h2{margin:6px 0}",
    '</style></head><body><div id="root"></div>',
    "<script>",
    'window.onerror=function(m){parent.postMessage({ddc:1,tipo:"erro",msg:String(m)},"*");return true;};',
    "var _log=console.log;",
    'console.log=function(){var a=Array.prototype.slice.call(arguments).map(function(x){try{return typeof x==="object"?JSON.stringify(x):String(x)}catch(e){return String(x)}});parent.postMessage({ddc:1,tipo:"log",texto:a.join(" ")},"*");_log.apply(console,arguments);};',
    'window.addEventListener("load",function(){',
    '  var root=document.getElementById("root");',
    '  function manda(){parent.postMessage({ddc:1,tipo:"tela",texto:root.innerText||""},"*");}',
    "  try{new MutationObserver(function(){setTimeout(manda,60);}).observe(root,{childList:true,subtree:true,characterData:true});}catch(e){}",
    "  setTimeout(manda,400);setTimeout(manda,1200);setTimeout(manda,2500);",
    "});",
    "</" + "script>",
    '<script type="text/babel" data-presets="react">',
    "const { useState, useEffect, useMemo, useCallback, useRef, useContext, createContext } = React;",
    user,
    ";(function(){",
    "  try{",
    '    if(typeof App==="undefined"){parent.postMessage({ddc:1,tipo:"erro",msg:"SEM_APP"},"*");return;}',
    '    ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));',
    '  }catch(e){parent.postMessage({ddc:1,tipo:"erro",msg:String((e&&e.message)||e)},"*");}',
    "})();",
    "</" + "script></body></html>",
  ].join("\n");
}

/* ---------- SANDBOX 2: HTML / JS / TS puro num iframe ---------- */

const REPORTER_WEB = [
  "<script>",
  'window.onerror=function(m){parent.postMessage({ddc:1,tipo:"erro",msg:String(m)},"*");return true;};',
  "var _log=console.log;var _buf=[];",
  'function _tela(){var t=(document.body?document.body.innerText:"")+"\\n"+_buf.join("\\n");parent.postMessage({ddc:1,tipo:"tela",texto:t},"*");}',
  'console.log=function(){var a=Array.prototype.slice.call(arguments).map(function(x){try{return typeof x==="object"?JSON.stringify(x):String(x)}catch(e){return String(x)}});var s=a.join(" ");_buf.push(s);parent.postMessage({ddc:1,tipo:"log",texto:s},"*");setTimeout(_tela,30);_log.apply(console,arguments);};',
  'window.addEventListener("load",function(){',
  "  try{new MutationObserver(function(){setTimeout(_tela,60);}).observe(document.body,{childList:true,subtree:true,characterData:true});}catch(e){}",
  "  setTimeout(_tela,300);setTimeout(_tela,1000);setTimeout(_tela,2200);",
  "});",
  "</" + "script>",
].join("\n");

function montaSrcDocWeb(codigo, lang, htmlBase, preambulo) {
  const estilo =
    "<style>body{font-family:system-ui,-apple-system,sans-serif;background:#ffffff;color:#0D0D0D;padding:14px;margin:0;font-size:15px}</style>";
  const cabeca = '<!DOCTYPE html><html><head><meta charset="utf-8"/>' + estilo;

  if (lang === "html") {
    // o código do aluno É a página (pode trazer <style> junto)
    return cabeca + REPORTER_WEB + "</head><body>" + codigo + "</body></html>";
  }

  // js / ts: base HTML opcional + script do aluno
  const user = escapaScript((preambulo ? preambulo + "\n\n" : "") + codigo);
  const babel =
    lang === "ts"
      ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></' +
        "script>"
      : "";
  const abreScript =
    lang === "ts"
      ? '<script type="text/babel" data-presets="typescript">'
      : "<script>";
  return [
    cabeca,
    babel,
    REPORTER_WEB,
    "</head><body>",
    htmlBase || "",
    abreScript,
    user,
    "</" + "script></body></html>",
  ].join("\n");
}

/* ============================ ESTILO ============================ */

const CSS = String.raw`
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');

.ddc {
  --papel: #EFE9DC;
  --tinta: #0D0D0D;
  --branco: #FFFFFF;
  --laranja: #FF4D00;
  --lima: #B8F53C;
  --azul: #2B2BFF;
  --vermelho: #FF2E2E;
  --salmao: #FFB3A7;
  --cinza: #6B6659;
  --amarelo-claro: #FFF3B0;
  --preto: #0D0D0D;        /* superfícies escuras (código, terminal, barras) */
  --contraste: #0D0D0D;    /* texto sobre cores de destaque (laranja, lima...) */
  --creme: #FFFBEA;
  --tracinho: #C9C2B0;
  --lint-erro: #B3261E;
  --lint-aviso: #8A5A00;
  --lint-dica: #4A4400;
  --textura-linha: rgba(13, 13, 13, 0.12);
  --textura-ponto: rgba(13, 13, 13, 0.13);
  --textura-luz: rgba(255, 255, 255, 0.38);

  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 18%, var(--textura-luz) 0 2px, transparent 2.5px),
    radial-gradient(circle at 2px 2px, var(--textura-ponto) 1.1px, transparent 1.4px),
    repeating-linear-gradient(90deg, transparent 0 62px, var(--textura-linha) 62px 65px),
    repeating-linear-gradient(0deg, transparent 0 62px, var(--textura-linha) 62px 65px),
    var(--papel);
  background-size: 180px 180px, 18px 18px, 124px 124px, 124px 124px, auto;
  background-position: 0 0, 0 0, 0 0, 0 0, 0 0;
  background-attachment: fixed;
  color: var(--tinta);
  font-family: 'Space Grotesk', system-ui, sans-serif;
  display: flex;
  justify-content: center;
  padding: 24px 14px 56px;
  box-sizing: border-box;
}
.ddc *, .ddc *::before, .ddc *::after { box-sizing: border-box; }
.ddc-shell { width: 100%; max-width: 580px; }

/* ---------- letreiro de busão (assinatura) ---------- */
.letreiro {
  background: var(--branco);
  border: 4px solid var(--tinta);
  box-shadow: 10px 10px 0 var(--tinta);
}
.letreiro-rota {
  background: var(--preto);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 3px;
  color: var(--laranja); margin: 0; padding: 9px 16px;
  text-transform: uppercase;
}
.letreiro-dest {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(34px, 10vw, 56px);
  line-height: 0.9; color: var(--tinta); margin: 0; padding: 18px 16px 14px;
  text-transform: uppercase; letter-spacing: 1px; white-space: pre-line;
}
.letreiro-sub {
  background: var(--lima);
  border-top: 4px solid var(--tinta);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 2px; color: var(--contraste);
  margin: 0; padding: 8px 16px; text-transform: uppercase;
}
.letreiro--mini { box-shadow: 8px 8px 0 var(--tinta); }
.letreiro--mini .letreiro-rota { font-size: 10px; letter-spacing: 2px; padding: 7px 14px; }
.letreiro--mini .letreiro-dest { font-size: 22px; letter-spacing: 0.5px; padding: 12px 14px; }

/* ---------- botões ---------- */
.btn {
  font-family: 'Archivo Black', sans-serif;
  text-transform: uppercase; letter-spacing: 1px; font-size: 15px;
  border: 3px solid var(--tinta); border-radius: 0;
  padding: 14px 18px; cursor: pointer; width: 100%;
  background: var(--branco); color: var(--tinta);
  box-shadow: 5px 5px 0 var(--tinta);
  transition: transform 0.06s ease, box-shadow 0.06s ease;
}
.btn:focus-visible { outline: 3px solid var(--azul); outline-offset: 3px; }
.btn-laranja { background: var(--laranja); color: var(--contraste); }
.btn-azul { background: var(--azul); color: #fff; }
.btn-lima { background: var(--lima); color: var(--contraste); }
.btn-fantasma {
  background: var(--papel); color: var(--tinta);
  border-width: 2px; box-shadow: none;
  font-family: 'Space Grotesk', sans-serif; font-weight: 700;
  font-size: 13px; padding: 10px 14px; text-transform: none; letter-spacing: 0;
}
.btn:not(:disabled):active { transform: translate(5px, 5px); box-shadow: 0 0 0 var(--tinta); }
.btn-fantasma:not(:disabled):active { transform: translate(2px, 2px); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.toolbar { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.toolbar .btn { width: auto; flex: 1; min-width: 120px; font-size: 13px; padding: 12px; }

/* ---------- barra de XP ---------- */
.xp-wrap { background: var(--branco); border: 3px solid var(--tinta); box-shadow: 6px 6px 0 var(--tinta); padding: 12px 14px; margin: 18px 0; }
.xp-top {
  display: flex; justify-content: space-between; align-items: baseline;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; gap: 8px;
}
.xp-nivel { background: var(--lima); border: 2px solid var(--tinta); padding: 2px 8px; font-weight: 700; color: var(--contraste); }
.xp-pts { color: var(--cinza); }
.xp-bar { height: 16px; background: var(--papel); border: 2px solid var(--tinta); overflow: hidden; }
.xp-fill {
  height: 100%;
  background: repeating-linear-gradient(45deg, var(--laranja), var(--laranja) 8px, var(--tinta) 8px, var(--tinta) 10px);
  transition: width 0.5s ease;
}

/* ---------- trilha (linha de busão) ---------- */
.trilha { position: relative; margin-top: 6px; padding-left: 46px; }
.trilha::before {
  content: ''; position: absolute; left: 17px; top: 8px; bottom: 30px;
  width: 5px; background: var(--tinta);
}
.parada { position: relative; margin-bottom: 16px; }
.parada-dot {
  position: absolute; left: -46px; top: 14px;
  width: 38px; height: 38px;
  border: 3px solid var(--tinta); display: flex; align-items: center; justify-content: center;
  font-family: 'Archivo Black', sans-serif; font-size: 14px;
  background: var(--branco); color: var(--tinta); z-index: 1;
  box-shadow: 3px 3px 0 var(--tinta);
}
.parada-dot--feito { background: var(--lima); }
.parada-dot--atual { background: var(--laranja); animation: pulsa 1.6s ease-in-out infinite; }
@keyframes pulsa {
  0%, 100% { box-shadow: 3px 3px 0 var(--tinta); }
  50% { box-shadow: 3px 3px 0 var(--tinta), 0 0 0 8px rgba(255, 77, 0, 0.25); }
}
.parada-card {
  width: 100%; text-align: left;
  background: var(--branco); border: 3px solid var(--tinta); border-radius: 0;
  box-shadow: 5px 5px 0 var(--tinta);
  padding: 14px; color: var(--tinta); cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  transition: transform 0.06s ease, box-shadow 0.06s ease;
}
.parada-card:not(:disabled):hover { transform: translate(2px, 2px); box-shadow: 3px 3px 0 var(--tinta); }
.parada-card:focus-visible { outline: 3px solid var(--azul); outline-offset: 2px; }
.parada-card:disabled { opacity: 0.45; cursor: not-allowed; }
.parada-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 2px; color: var(--azul); text-transform: uppercase; font-weight: 700;
  display: flex; justify-content: space-between; gap: 8px;
}
.parada-nome { font-family: 'Archivo Black', sans-serif; font-size: 17px; margin: 6px 0 2px; text-transform: uppercase; line-height: 1.1; }
.parada-local { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--laranja); font-weight: 700; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
.parada-desc { font-size: 13px; color: var(--cinza); margin: 0; line-height: 1.4; }
.parada-score { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--contraste); background: var(--lima); padding: 0 5px; font-weight: 700; }

/* ---------- cards de curso (home) ---------- */
.curso-card {
  width: 100%; text-align: left; display: block;
  background: var(--branco); border: 3px solid var(--tinta); border-radius: 0;
  box-shadow: 6px 6px 0 var(--tinta);
  padding: 16px 14px; margin: 14px 0;
  color: var(--tinta); cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  transition: transform 0.06s ease, box-shadow 0.06s ease;
}
.curso-card:hover { transform: translate(2px, 2px); box-shadow: 4px 4px 0 var(--tinta); }
.curso-card:active { transform: translate(4px, 4px); box-shadow: 2px 2px 0 var(--tinta); }
.curso-card:focus-visible { outline: 3px solid var(--azul); outline-offset: 2px; }
.curso-cta {
  display: inline-block; margin-top: 12px;
  font-family: 'Archivo Black', sans-serif; font-size: 12px;
  text-transform: uppercase; letter-spacing: 1px;
  background: var(--laranja); color: var(--contraste);
  border: 2px solid var(--tinta); padding: 6px 10px;
}

/* ---------- cartões ---------- */
.card { background: var(--branco); border: 3px solid var(--tinta); box-shadow: 6px 6px 0 var(--tinta); padding: 18px 16px; margin: 16px 0; }
.card-titulo {
  font-family: 'Archivo Black', sans-serif; font-size: 20px;
  margin: 0; text-transform: uppercase; color: var(--contraste); line-height: 1.4;
  background: var(--lima); display: inline; padding: 0 4px;
  box-decoration-break: clone; -webkit-box-decoration-break: clone;
}
.card-titulo + .card-txt { margin-top: 12px; }
.card-txt { font-size: 15px; line-height: 1.6; margin: 0; color: var(--tinta); }

.code {
  display: block; background: var(--preto);
  border-left: 6px solid var(--laranja);
  padding: 12px 14px; margin-top: 14px;
  font-family: 'JetBrains Mono', monospace; font-size: 12.5px; line-height: 1.6;
  color: var(--lima); white-space: pre-wrap; word-break: break-word;
}

.pager {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  letter-spacing: 2px; color: var(--cinza); text-transform: uppercase;
  text-align: center; margin: 12px 0 4px;
}

/* ---------- desafios ---------- */
.quiz-topo {
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  letter-spacing: 1.5px; text-transform: uppercase; color: var(--tinta);
  margin: 16px 2px 8px;
}
.quiz-streak { color: var(--laranja); font-weight: 700; }
.tipo-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 1.5px;
  border: 2px solid var(--azul); color: var(--azul); font-weight: 700;
  padding: 2px 7px; text-transform: uppercase;
}
.quiz-q { font-family: 'Archivo Black', sans-serif; font-size: 18px; line-height: 1.3; margin: 0 0 6px; }
.enunciado { font-size: 14.5px; line-height: 1.55; color: var(--tinta); margin: 6px 0 0; }

.missao {
  background: var(--amarelo-claro);
  border: 3px solid var(--tinta);
  padding: 10px 12px; font-size: 13.5px; margin-top: 14px;
  color: var(--tinta); line-height: 1.5;
}
.missao b { color: var(--tinta); }
.missao--dica { background: var(--branco); border: 3px dashed var(--azul); }
.alvos { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.alvo {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  border: 2px solid var(--tinta);
  padding: 3px 8px; color: var(--tinta); background: var(--branco); font-weight: 700;
}
.alvo--ok { background: var(--lima); color: var(--contraste); }
.alvo--ok::before { content: '✓ '; }

.opts { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
.opt {
  text-align: left; background: var(--branco);
  border: 3px solid var(--tinta);
  padding: 13px 14px; color: var(--tinta);
  font-family: 'Space Grotesk', sans-serif; font-size: 14.5px; font-weight: 500;
  cursor: pointer; display: flex; gap: 10px; align-items: flex-start;
  box-shadow: 3px 3px 0 var(--tinta);
  transition: transform 0.06s ease, box-shadow 0.06s ease, background 0.12s ease;
}
.opt:not(:disabled):hover { background: var(--amarelo-claro); }
.opt:not(:disabled):active { transform: translate(3px, 3px); box-shadow: 0 0 0 var(--tinta); }
.opt:focus-visible { outline: 3px solid var(--azul); outline-offset: 2px; }
.opt:disabled { cursor: default; }
.opt-letra {
  font-family: 'Archivo Black', sans-serif; font-size: 12px;
  background: var(--preto); color: #fff;
  min-width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.opt--certa { background: var(--lima); color: var(--contraste); }
.opt--errada { background: var(--salmao); color: var(--contraste); }
.opt--apagada { opacity: 0.4; }

.feedback { border: 3px solid var(--tinta); box-shadow: 4px 4px 0 var(--tinta); padding: 14px; margin-top: 16px; animation: sobe 0.25s ease; color: var(--contraste); }
@keyframes sobe { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.feedback--ok { background: var(--lima); }
.feedback--ruim { background: var(--salmao); }
.feedback-titulo { font-family: 'Archivo Black', sans-serif; font-size: 15px; text-transform: uppercase; margin: 0 0 6px; color: inherit; }
.feedback-txt { font-size: 14px; line-height: 1.55; margin: 0; color: inherit; }

/* ---------- editor de código ---------- */
.editor { border: 3px solid var(--tinta); overflow: hidden; background: var(--preto); margin-top: 14px; box-shadow: 5px 5px 0 var(--tinta); }
.editor-topo {
  display: flex; align-items: center; gap: 8px;
  background: var(--laranja); padding: 8px 10px; border-bottom: 3px solid var(--tinta);
}
.dot { width: 12px; height: 12px; display: inline-block; }
.d1 { background: var(--tinta); } .d2 { background: var(--branco); } .d3 { background: var(--lima); }
.editor-arquivo {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: var(--contraste); margin-left: 6px; letter-spacing: 1px; font-weight: 700;
}
.editor-corpo { display: flex; align-items: stretch; }
.editor-nums {
  margin: 0; padding: 12px 8px; font-family: 'JetBrains Mono', monospace;
  font-size: 13px; line-height: 1.55; color: var(--cinza); text-align: right;
  user-select: none; background: var(--preto); border-right: 1px solid #2a2a2a;
  min-width: 36px; overflow: hidden;
}
.editor-ta {
  flex: 1; background: transparent; border: 0; color: #F5F1E4;
  font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.55;
  padding: 12px; min-height: 230px; resize: vertical; outline: none;
  white-space: pre; overflow: auto; tab-size: 2; caret-color: var(--laranja);
}
.editor-ta:focus { box-shadow: inset 0 0 0 2px var(--laranja); }

/* ---------- painéis (preview / terminal / lint) ---------- */
.painel { border: 3px solid var(--tinta); margin-top: 12px; overflow: hidden; background: var(--branco); }
.painel-titulo {
  font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 2px;
  text-transform: uppercase; padding: 7px 10px;
  background: var(--preto); color: #fff;
  display: flex; justify-content: space-between; gap: 8px; align-items: center;
}
.painel--azul .painel-titulo { background: var(--azul); }
.painel--erro { border-color: var(--vermelho); }
.painel--erro .painel-titulo { background: var(--vermelho); }
.preview-frame { width: 100%; height: 260px; border: 0; background: #fff; display: block; }
.terminal {
  background: var(--preto); font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px; color: var(--lima); padding: 12px;
  min-height: 44px; white-space: pre-wrap; word-break: break-word; margin: 0;
  border-top: 1px solid #2a2a2a;
}
.terminal-log { color: #F5F1E4; }
.terminal-prefixo { color: var(--laranja); }
.lint-item {
  display: flex; gap: 8px; padding: 10px 12px;
  font-size: 13.5px; line-height: 1.5;
  border-bottom: 1px dashed var(--tracinho); align-items: flex-start;
}
.lint-item:last-child { border-bottom: 0; }
.lint-erro { color: var(--lint-erro); }
.lint-aviso { color: var(--lint-aviso); }
.lint-dica { color: var(--lint-dica); }
.lint-emoji { flex-shrink: 0; }

.banner-ok {
  border: 3px solid var(--tinta); background: var(--lima);
  box-shadow: 4px 4px 0 var(--tinta);
  padding: 13px; margin-top: 14px;
  font-family: 'Archivo Black', sans-serif; color: var(--contraste);
  text-transform: uppercase; text-align: center; font-size: 15px;
  animation: sobe 0.25s ease;
}

/* ---------- encaixe ---------- */
.encaixe-label {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 2px; text-transform: uppercase; color: var(--cinza);
  margin: 14px 0 6px;
}
.encaixe-area {
  min-height: 56px; border: 3px dashed var(--tinta);
  padding: 8px; display: flex; flex-direction: column; gap: 6px;
  background: var(--creme);
}
.encaixe-banco { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.peca {
  text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 12.5px;
  background: var(--preto); border: 3px solid var(--preto); color: #fff;
  padding: 10px 12px; cursor: pointer;
  white-space: pre; overflow-x: auto; width: 100%;
  box-shadow: 3px 3px 0 var(--cinza);
  transition: border-color 0.1s ease, transform 0.06s ease, box-shadow 0.06s ease;
}
.peca:hover { border-color: var(--laranja); }
.peca:active { transform: translate(2px, 2px); box-shadow: 0 0 0 var(--cinza); }
.peca:focus-visible { outline: 3px solid var(--azul); outline-offset: 2px; }
.peca--monte { border-color: var(--azul); color: var(--lima); box-shadow: none; }
.encaixe-vazio { color: var(--cinza); font-size: 12.5px; text-align: center; padding: 8px; }

/* ---------- resultado ---------- */
.placar { font-family: 'Archivo Black', sans-serif; font-size: 64px; text-align: center; color: var(--tinta); margin: 8px 0 0; line-height: 1; }
.placar-sub {
  text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 13px;
  letter-spacing: 2px; color: var(--tinta); text-transform: uppercase; margin: 8px 0 0; font-weight: 700;
}
.placar-xp {
  text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 13px;
  letter-spacing: 2px; text-transform: uppercase; margin: 6px auto 0;
  background: var(--preto); color: var(--lima); display: table; padding: 3px 10px;
}
.trofeu { font-size: 56px; text-align: center; margin: 10px 0 0; }
.stack { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }

.footer-note { text-align: center; font-size: 12px; color: var(--cinza); margin-top: 24px; line-height: 1.5; }
.link-reset {
  background: none; border: none; color: var(--vermelho);
  font-family: inherit; font-size: 12px; cursor: pointer; font-weight: 700;
  text-decoration: underline; padding: 2px 4px;
}
.link-reset:focus-visible { outline: 2px solid var(--azul); outline-offset: 2px; }

/* ---------- temas ---------- */
.temas { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 14px; }
.tema-swatch {
  width: 26px; height: 26px; border: 2px solid var(--tinta); cursor: pointer;
  box-shadow: 2px 2px 0 var(--tinta); padding: 0;
  transition: transform 0.06s ease, box-shadow 0.06s ease;
}
.tema-swatch:hover { transform: translate(1px, 1px); box-shadow: 1px 1px 0 var(--tinta); }
.tema-swatch--ativo { outline: 3px solid var(--tinta); outline-offset: 2px; }
.tema-swatch:focus-visible { outline: 3px solid var(--azul); outline-offset: 2px; }

.parada-dot--feito, .parada-dot--atual { color: var(--contraste); }
.card--cor, .card--cor .card-txt, .card--cor .card-titulo, .card--cor .placar, .card--cor .placar-sub { color: var(--contraste); }

/* Noite — modo escuro
   Paleta calibrada pra contraste AA: texto secundário mais claro,
   azul mais luminoso (era ilegível em texto pequeno) e textura
   de fundo bem mais discreta pra não brigar com o conteúdo. */
.ddc--noite {
  --papel: #131318;
  --tinta: #F7F4EA;
  --branco: #1E1E26;
  --preto: #0B0B0F;
  --laranja: #FF6A26;
  --lima: #C3F851;
  --azul: #9D9DFF;
  --vermelho: #FF7A6E;
  --salmao: #FFA894;
  --cinza: #ABA69A;
  --amarelo-claro: #34301D;
  --creme: #26251C;
  --tracinho: #45454F;
  --lint-erro: #FFA49B;
  --lint-aviso: #FFCC7A;
  --lint-dica: #EAE2A6;
  --textura-linha: rgba(242, 239, 228, 0.055);
  --textura-ponto: rgba(242, 239, 228, 0.06);
  --textura-luz: rgba(255, 255, 255, 0.03);
}

/* ajustes pontuais do Noite: onde texto claro/escuro precisa inverter */
.ddc--noite .btn-azul { color: var(--contraste); }
.ddc--noite .painel--azul .painel-titulo { color: var(--contraste); }
.ddc--noite .painel--erro .painel-titulo { color: var(--contraste); }
.ddc--noite .parada-dot { box-shadow: 3px 3px 0 rgba(247, 244, 234, 0.35); }
.ddc--noite .peca { box-shadow: 3px 3px 0 #45454F; border-color: #2E2E38; }
.ddc--noite .editor-nums { color: #8F8B80; border-right-color: #2E2E38; }
.ddc--noite .terminal { border-top-color: #2E2E38; }

/* Vapor — rosa/roxo/menta */
.ddc--vapor {
  --papel: #FBE8EF;
  --tinta: #23102E;
  --branco: #FFFFFF;
  --preto: #23102E;
  --laranja: #FF2E88;
  --lima: #4DE6B8;
  --azul: #7C3AED;
  --vermelho: #E5254D;
  --salmao: #FFB3C7;
  --cinza: #8A7A8F;
  --amarelo-claro: #FFEFC2;
  --creme: #FFF5FA;
  --textura-linha: rgba(35, 16, 46, 0.11);
  --textura-ponto: rgba(35, 16, 46, 0.12);
  --textura-luz: rgba(255, 255, 255, 0.44);
}

/* Táxi — amarelo/preto */
.ddc--taxi {
  --papel: #F5F1DC;
  --tinta: #0D0D0D;
  --branco: #FFFFFF;
  --preto: #0D0D0D;
  --laranja: #FFB800;
  --lima: #3DDC84;
  --azul: #1F5EFF;
  --vermelho: #FF2E2E;
  --salmao: #FFB3A7;
  --cinza: #6B6659;
  --amarelo-claro: #FFF3B0;
  --creme: #FFFBEA;
  --textura-linha: rgba(13, 13, 13, 0.14);
  --textura-ponto: rgba(13, 13, 13, 0.12);
  --textura-luz: rgba(255, 255, 255, 0.34);
}

/* ---------- animações ---------- */

/* letreiro: rota rolando feito painel de busão + cursor piscando */
.letreiro-rota { overflow: hidden; }
.letreiro-rota-texto { display: inline-block; white-space: nowrap; animation: ddc-marquee 16s linear infinite; }
@keyframes ddc-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

.cursor-bloco {
  display: inline-block; width: 0.42em; height: 0.78em;
  background: var(--laranja); margin-left: 8px;
  animation: ddc-pisca 1s steps(2, start) infinite;
}
@keyframes ddc-pisca { to { visibility: hidden; } }

/* listras da XP em movimento */
.xp-fill { animation: ddc-listras 0.8s linear infinite; }
@keyframes ddc-listras { to { background-position: 14.14px 0; } }

/* botões: hover afunda um pouco, active afunda tudo */
.btn:not(:disabled):hover { transform: translate(2px, 2px); box-shadow: 3px 3px 0 var(--tinta); }
.btn-fantasma:not(:disabled):hover { transform: translate(1px, 1px); box-shadow: none; }
.btn:not(:disabled):active { transform: translate(5px, 5px); box-shadow: 0 0 0 var(--tinta); }
.btn-fantasma:not(:disabled):active { transform: translate(2px, 2px); }

/* CTA da home respirando */
.btn-pulsa { animation: ddc-chama 1.6s ease-in-out infinite; }
@keyframes ddc-chama {
  0%, 100% { box-shadow: 5px 5px 0 var(--tinta); }
  50% { box-shadow: 9px 9px 0 var(--tinta); }
}

/* erro treme, acerto dá um pulo */
.opt--shake { animation: ddc-treme 0.4s ease; }
.painel--erro { animation: ddc-treme 0.4s ease; }
@keyframes ddc-treme {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-7px); }
  40% { transform: translateX(7px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}
.opt--pula { animation: ddc-pula 0.45s ease; }
@keyframes ddc-pula {
  0% { transform: scale(1); }
  40% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* trilha desce desenhando a linha; parada concluída dá um pulo */
.trilha::before { transform-origin: top; animation: ddc-desce 0.9s ease-out; }
@keyframes ddc-desce { from { transform: scaleY(0); } }
.parada-dot--feito { animation: ddc-pula 0.45s ease; }

/* troféu e fogo do streak */
.trofeu { animation: ddc-trofeu 1.6s ease-in-out infinite; }
@keyframes ddc-trofeu {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50% { transform: translateY(-8px) rotate(4deg); }
}
.quiz-streak { display: inline-block; animation: ddc-fogo 0.7s ease-in-out infinite; }
@keyframes ddc-fogo {
  0%, 100% { transform: scale(1) rotate(-2deg); }
  50% { transform: scale(1.15) rotate(2deg); }
}

@media (prefers-reduced-motion: reduce) {
  .ddc *, .ddc *::before, .ddc *::after { animation: none !important; transition: none !important; }
}
`;

/* ============================ STORAGE ============================ */

// fora do Claude o progresso vai no localStorage do navegador.
// Formato atual: { cursos: { fullstack: { scores }, web: { scores } } }
// (migra sozinho do formato antigo, que era { scores } só do fullstack)
async function carregarProgresso() {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    if (!r) return null;
    const p = JSON.parse(r);
    if (p && p.scores && !p.cursos) {
      return { cursos: { fullstack: { scores: p.scores } } };
    }
    return p;
  } catch (e) {
    return null; // chave ainda não existe
  }
}

async function salvarProgresso(p) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch (e) {
    console.error("falha ao salvar:", e);
  }
}

function scoresDoCurso(progresso, cursoId) {
  return (
    (progresso &&
      progresso.cursos &&
      progresso.cursos[cursoId] &&
      progresso.cursos[cursoId].scores) ||
    {}
  );
}

function calcXP(scores, modules) {
  let xp = 0;
  for (const m of modules) {
    const s = scores[m.id] || 0;
    xp += s * 20;
    if (s === m.desafios.length) xp += 15; // bônus de gabaritar
  }
  return xp;
}

/* ============================ COMPONENTES BASE ============================ */

function Letreiro({ rota, destino, sub, mini }) {
  return (
    <motion.div
      className={"letreiro" + (mini ? " letreiro--mini" : "")}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springMedio}
    >
      {rota && (
        <p className="letreiro-rota">
          <span className="letreiro-rota-texto">
            <span>{rota}&nbsp;&nbsp;+++&nbsp;&nbsp;</span>
            <span aria-hidden="true">{rota}&nbsp;&nbsp;+++&nbsp;&nbsp;</span>
          </span>
        </p>
      )}
      <p className="letreiro-dest">
        {destino}
        <span className="cursor-bloco" aria-hidden="true" />
      </p>
      {sub && <p className="letreiro-sub">{sub}</p>}
    </motion.div>
  );
}

function XPBar({ xp }) {
  const nivel = getLevel(xp);
  const base = nivel.min;
  const teto = nivel.prox ? nivel.prox.min : Math.max(xp, base + 1);
  const pct = nivel.prox
    ? Math.min(100, Math.round(((xp - base) / (teto - base)) * 100))
    : 100;
  return (
    <div className="xp-wrap">
      <div className="xp-top">
        <motion.span
          key={nivel.nome}
          className="xp-nivel"
          initial={{ scale: 1.5, rotate: -3 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={springMedio}
          style={{ display: "inline-block" }}
        >
          {nivel.nome}
        </motion.span>
        <span className="xp-pts">
          {xp} XP{nivel.prox ? " · próx: " + nivel.prox.min : " · máx"}
        </span>
      </div>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

function PainelLint({ itens }) {
  if (!itens || !itens.length) return null;
  const icone = { erro: "🚨", aviso: "⚠️", dica: "💡" };
  return (
    <div className="painel">
      <div className="painel-titulo">
        <span>Lint amigável</span>
        <span>{itens.length} ponto(s)</span>
      </div>
      {itens.map((it, i) => (
        <motion.div
          key={i}
          className={"lint-item lint-" + it.nivel}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...springMedio, delay: i * 0.06 }}
        >
          <span className="lint-emoji">{icone[it.nivel] || "💡"}</span>
          <span>{it.msg}</span>
        </motion.div>
      ))}
    </div>
  );
}

function Editor({ valor, onChange, arquivo }) {
  const numRef = useRef(null);
  const linhas = valor.split("\n").length;
  const nums = Array.from(
    { length: Math.max(linhas, 1) },
    (_, i) => i + 1,
  ).join("\n");

  function keyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target;
      const s = el.selectionStart;
      const f = el.selectionEnd;
      const novo = valor.slice(0, s) + "  " + valor.slice(f);
      onChange(novo);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = s + 2;
      });
    }
  }

  return (
    <div className="editor">
      <div className="editor-topo">
        <span className="dot d1" />
        <span className="dot d2" />
        <span className="dot d3" />
        <span className="editor-arquivo">{arquivo}</span>
      </div>
      <div className="editor-corpo">
        <pre className="editor-nums" ref={numRef} aria-hidden="true">
          {nums}
        </pre>
        <textarea
          className="editor-ta"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={keyDown}
          onScroll={(e) => {
            if (numRef.current) numRef.current.scrollTop = e.target.scrollTop;
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label={"Editor de código: " + arquivo}
        />
      </div>
    </div>
  );
}

/* ============================ DESAFIO: QUIZ ============================ */

const LETRAS = ["A", "B", "C", "D"];

function DesafioQuiz({ d, onResolvido }) {
  const [sel, setSel] = useState(null);
  const respondeu = sel !== null;
  const acertou = respondeu && sel === d.correct;

  useEffect(() => {
    if (acertou)
      estouraConfete({ particleCount: 45, spread: 60, origin: { y: 0.75 } });
  }, [acertou]);

  return (
    <div className="card">
      <p className="quiz-q">{d.q}</p>
      {d.code && <code className="code">{d.code}</code>}
      <motion.div
        className="opts"
        variants={listaStagger}
        initial="inicial"
        animate="entra"
      >
        {d.opts.map((o, idx) => {
          let cls = "opt";
          if (respondeu) {
            if (idx === d.correct) cls += " opt--certa opt--pula";
            else if (idx === sel) cls += " opt--errada opt--shake";
            else cls += " opt--apagada";
          }
          return (
            <motion.button
              key={idx}
              className={cls}
              disabled={respondeu}
              onClick={() => setSel(idx)}
              variants={itemSobe}
              whileTap={{ scale: 0.98 }}
            >
              <span className="opt-letra">{LETRAS[idx]}</span>
              <span>{o}</span>
            </motion.button>
          );
        })}
      </motion.div>
      {respondeu && (
        <motion.div
          className={
            "feedback " + (acertou ? "feedback--ok" : "feedback--ruim")
          }
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={springMedio}
        >
          <p className="feedback-titulo">
            {acertou ? "Boa, acertou! ✅" : "Não foi dessa vez ❌"}
          </p>
          <p className="feedback-txt">{d.explain}</p>
        </motion.div>
      )}
      {respondeu && (
        <motion.div
          className="stack"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <button
            className="btn btn-laranja"
            onClick={() => onResolvido(acertou)}
          >
            Próxima →
          </button>
        </motion.div>
      )}
    </div>
  );
}

/* ============================ DESAFIO: ENCAIXE ============================ */

function DesafioEncaixe({ d, onResolvido }) {
  const grupoLayout = useId();
  const [banco, setBanco] = useState(() =>
    embaralhaDiferente(d.pecas.map((p, i) => ({ p, k: i }))),
  );
  const [monte, setMonte] = useState([]);
  const [res, setRes] = useState(null); // { ok, msg }
  const [erros, setErros] = useState(0);
  const [usouGabarito, setUsouGabarito] = useState(false);

  function pegar(idx) {
    const item = banco[idx];
    setBanco(banco.filter((_, i) => i !== idx));
    setMonte([...monte, item]);
    setRes(null);
  }
  function devolver(idx) {
    const item = monte[idx];
    setMonte(monte.filter((_, i) => i !== idx));
    setBanco([...banco, item]);
    setRes(null);
  }

  function conferir() {
    if (monte.length !== d.pecas.length) {
      setRes({
        ok: false,
        msg:
          "Ainda faltam " +
          (d.pecas.length - monte.length) +
          " peça(s) pra encaixar. Toca nelas aí embaixo pra subir.",
      });
      return;
    }
    // compara por TEXTO — peças idênticas são intercambiáveis
    let primeiroErro = -1;
    for (let i = 0; i < d.pecas.length; i++) {
      if (monte[i].p !== d.pecas[i]) {
        primeiroErro = i;
        break;
      }
    }
    if (primeiroErro === -1) {
      setRes({ ok: true, msg: d.explain });
      estouraConfete({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } else {
      setErros((e) => e + 1);
      const certas = primeiroErro;
      setRes({
        ok: false,
        msg:
          certas === 0
            ? "A primeira peça já não encaixa aí. Pensa: o que precisa vir ANTES de tudo nesse código?"
            : "As " +
              certas +
              " primeira(s) estão certas — é a peça " +
              (certas + 1) +
              " que não encaixa nessa posição. Toca nela pra devolver e testa outra.",
      });
    }
  }

  function verGabarito() {
    setMonte(d.pecas.map((p, i) => ({ p, k: "g" + i })));
    setBanco([]);
    setUsouGabarito(true);
    setRes({
      ok: true,
      msg:
        "Essa é a ordem certa. Lê de cima pra baixo entendendo o porquê de cada linha — na próxima sai de você. " +
        d.explain,
    });
  }

  const montado = res && res.ok;

  return (
    <div className="card">
      <LayoutGroup id={grupoLayout}>
        <p className="quiz-q">{d.enunciado}</p>
        <p className="encaixe-label">
          Seu código (toca numa peça pra devolver)
        </p>
        <motion.div
          className="encaixe-area"
          animate={res && !res.ok ? "erra" : "calma"}
          variants={{
            erra: { x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } },
            calma: { x: 0 },
          }}
        >
          {monte.length === 0 && (
            <p className="encaixe-vazio">
              — vazio — toca nas peças aí de baixo pra montar aqui —
            </p>
          )}
          {monte.map((item, i) => (
            <motion.button
              key={item.k}
              layoutId={"peca-" + item.k}
              transition={springMedio}
              whileTap={{ scale: 0.97 }}
              className="peca peca--monte"
              onClick={() => !montado && devolver(i)}
            >
              {item.p}
            </motion.button>
          ))}
        </motion.div>
        {banco.length > 0 && (
          <>
            <p className="encaixe-label">
              Peças embaralhadas (toca pra encaixar)
            </p>
            <div className="encaixe-banco">
              {banco.map((item, i) => (
                <motion.button
                  key={item.k}
                  layoutId={"peca-" + item.k}
                  transition={springMedio}
                  whileTap={{ scale: 0.97 }}
                  className="peca"
                  onClick={() => pegar(i)}
                >
                  {item.p}
                </motion.button>
              ))}
            </div>
          </>
        )}
        {res && (
          <motion.div
            className={
              "feedback " + (res.ok ? "feedback--ok" : "feedback--ruim")
            }
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={springMedio}
          >
            <p className="feedback-titulo">
              {res.ok
                ? usouGabarito
                  ? "Montado com o gabarito"
                  : "Encaixou perfeito! 🧩"
                : "Quase lá..."}
            </p>
            <p className="feedback-txt">{res.msg}</p>
          </motion.div>
        )}
        <div className="toolbar">
          {!montado && (
            <button className="btn btn-laranja" onClick={conferir}>
              Conferir encaixe
            </button>
          )}
          {!montado && erros >= 2 && (
            <button className="btn btn-fantasma" onClick={verGabarito}>
              Mostrar a ordem certa
            </button>
          )}
          {montado && (
            <button
              className="btn btn-lima"
              onClick={() => onResolvido(!usouGabarito)}
            >
              {usouGabarito ? "Seguir (sem pontuar)" : "Fechar desafio ✓"}
            </button>
          )}
        </div>
      </LayoutGroup>
    </div>
  );
}

/* ============================ DESAFIO: CÓDIGO ============================ */

function DesafioCode({ d, onResolvido }) {
  const [codigo, setCodigo] = useState(d.starter);
  const [lints, setLints] = useState([]);
  const [erros, setErros] = useState([]);
  const [logs, setLogs] = useState([]);
  const [src, setSrc] = useState(null);
  const [rodada, setRodada] = useState(0);
  const [faltam, setFaltam] = useState(null); // null = nunca rodou
  const [javaOk, setJavaOk] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [dicaIdx, setDicaIdx] = useState(-1);
  const [verGab, setVerGab] = useState(false);
  const [usouGabarito, setUsouGabarito] = useState(false);
  const [regrasOkWeb, setRegrasOkWeb] = useState(
    !(d.regras && d.regras.length),
  );

  const ehJava = d.lang === "java";
  const ehWeb = d.lang === "html" || d.lang === "js" || d.lang === "ts";

  // escuta o sandbox (só desafios React)
  useEffect(() => {
    if (ehJava) return;
    function onMsg(e) {
      const m = e.data;
      if (!m || m.ddc !== 1) return;
      if (m.tipo === "erro") {
        const t = traduzErro(m.msg);
        setErros((prev) => (prev.includes(t) ? prev : [...prev, t]));
      } else if (m.tipo === "log") {
        setLogs((prev) => [...prev.slice(-7), m.texto]);
      } else if (m.tipo === "tela") {
        setFaltam((prev) => {
          if (!prev) return prev;
          return prev.filter((t) => !(m.texto || "").includes(t));
        });
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [ehJava]);

  const completo = ehJava
    ? javaOk
    : faltam !== null && faltam.length === 0 && regrasOkWeb;

  useEffect(() => {
    if (completo)
      estouraConfete({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
  }, [completo]);

  function rodar() {
    setTentativas((t) => t + 1);
    setErros([]);
    setLogs([]);

    const base =
      d.lang === "html" ? lintHTML(codigo) : lintDelimitadores(codigo);
    const especifico = ehJava
      ? lintJava(codigo)
      : d.lang === "js" || d.lang === "ts"
        ? lintJS(codigo)
        : d.lang === "html"
          ? []
          : lintJSX(codigo);
    const todos = [...base, ...especifico];
    const temErroDuro = todos.some((a) => a.nivel === "erro");

    if (ehJava) {
      const regrasFaltando = (d.regras || []).filter(
        (r) => !new RegExp(r.re).test(codigo),
      );
      const faltas = regrasFaltando.map((r) => ({
        nivel: "dica",
        msg: r.falta,
      }));
      setLints([...todos, ...faltas]);
      if (temErroDuro || regrasFaltando.length) {
        setJavaOk(false);
        return;
      }
      setJavaOk(true);
      return;
    }

    // React/web: dicasAuto e regras viram dica (não bloqueiam o run);
    // erro duro bloqueia. Nas linguagens web as regras também contam pra fechar.
    const autos = (d.dicasAuto || [])
      .filter((r) => !new RegExp(r.re).test(codigo))
      .map((r) => ({ nivel: "dica", msg: r.falta }));
    const regrasFaltando = ehWeb
      ? (d.regras || []).filter((r) => !new RegExp(r.re).test(codigo))
      : [];
    setLints([
      ...todos,
      ...autos,
      ...regrasFaltando.map((r) => ({ nivel: "dica", msg: r.falta })),
    ]);
    if (ehWeb) setRegrasOkWeb(regrasFaltando.length === 0);
    if (temErroDuro) {
      setSrc(null);
      return;
    }
    setFaltam([...d.esperado]);
    setSrc(
      ehWeb
        ? montaSrcDocWeb(codigo, d.lang, d.htmlBase, d.preambulo)
        : montaSrcDoc(codigo, d.preambulo),
    );
    setRodada((k) => k + 1);
  }

  function usarGabarito() {
    setCodigo(d.gabarito);
    setUsouGabarito(true);
    setVerGab(false);
    setLints([]);
    setErros([]);
  }

  return (
    <div className="card">
      <p className="quiz-q">{d.enunciado}</p>
      {d.contexto && <p className="enunciado">{d.contexto}</p>}

      <div className="missao">
        <b>🎯 Missão:</b> {d.missao}
        {!ehJava && d.esperado && (
          <div className="alvos">
            {d.esperado.map((t) => {
              const ok = faltam !== null && !faltam.includes(t);
              return (
                <span key={t} className={"alvo" + (ok ? " alvo--ok" : "")}>
                  {t}
                </span>
              );
            })}
          </div>
        )}
        {(d.regras || []).length > 0 && (
          <div className="alvos">
            {(d.regras || []).map((r) => (
              <span
                key={r.label}
                className={
                  "alvo" + (new RegExp(r.re).test(codigo) ? " alvo--ok" : "")
                }
              >
                {r.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <Editor
        valor={codigo}
        onChange={(v) => {
          setCodigo(v);
          if (ehJava && javaOk) setJavaOk(false);
        }}
        arquivo={d.arquivo}
      />

      <div className="toolbar">
        <button className="btn btn-laranja" onClick={rodar}>
          ▶ Rodar
        </button>
        {d.dicas && d.dicas.length > 0 && (
          <button
            className="btn btn-fantasma"
            onClick={() =>
              setDicaIdx((i) => Math.min(i + 1, d.dicas.length - 1))
            }
          >
            💡 Dica{" "}
            {dicaIdx >= 0
              ? "(" + (dicaIdx + 1) + "/" + d.dicas.length + ")"
              : ""}
          </button>
        )}
        {!completo && tentativas >= 2 && (
          <button
            className="btn btn-fantasma"
            onClick={() => setVerGab((v) => !v)}
          >
            Estou travado
          </button>
        )}
      </div>

      {dicaIdx >= 0 && (
        <motion.div
          key={dicaIdx}
          className="missao missao--dica"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springMedio}
        >
          <b style={{ color: "var(--azul)" }}>💡 Dica {dicaIdx + 1}:</b>{" "}
          {d.dicas[dicaIdx]}
        </motion.div>
      )}

      {verGab && (
        <motion.div
          className="painel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springMedio}
        >
          <div className="painel-titulo">
            <span>Gabarito</span>
            <span>faz parte do aprendizado</span>
          </div>
          <code
            className="code"
            style={{ margin: 0, borderRadius: 0, borderLeft: 0, border: 0 }}
          >
            {d.gabarito}
          </code>
          <div style={{ padding: 10 }}>
            <button className="btn btn-fantasma" onClick={usarGabarito}>
              Colar no editor (não pontua, mas ensina)
            </button>
          </div>
        </motion.div>
      )}

      <PainelLint itens={lints} />

      {erros.length > 0 && (
        <div className="painel painel--erro">
          <div className="painel-titulo">
            <span>Erro na execução</span>
            <span>tradução amigável</span>
          </div>
          {erros.map((e, i) => (
            <div key={i} className="lint-item lint-erro">
              <span className="lint-emoji">🚨</span>
              <span>{e}</span>
            </div>
          ))}
        </div>
      )}

      {!ehJava && src && (
        <motion.div
          className="painel painel--azul"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springMedio}
        >
          <div className="painel-titulo">
            <span>Preview · rodando de verdade</span>
            {d.testa && !completo && (
              <span style={{ color: "var(--lima)" }}>{d.testa}</span>
            )}
          </div>
          <iframe
            key={rodada}
            className="preview-frame"
            sandbox="allow-scripts"
            srcDoc={src}
            title="Preview do seu código React"
          />
        </motion.div>
      )}

      {!ehJava && logs.length > 0 && (
        <div className="painel">
          <div className="painel-titulo">
            <span>Console</span>
          </div>
          <pre className="terminal terminal-log">
            {logs.map((l) => "> " + l).join("\n")}
          </pre>
        </div>
      )}

      {ehJava && javaOk && (
        <div className="painel">
          <div className="painel-titulo">
            <span>Terminal</span>
            <span>simulado* — Java precisa da JVM, não roda no navegador</span>
          </div>
          <pre className="terminal">
            <span className="terminal-prefixo">
              $ javac Main.java && java Main{"\n"}
            </span>
            {d.saida}
          </pre>
        </div>
      )}

      {completo && (
        <>
          <motion.div
            className="banner-ok"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springMedio}
          >
            {ehJava
              ? "Compilou sem erros! ✓"
              : "Funcionou, confere na tela! 🎉"}
          </motion.div>
          <motion.div
            className="stack"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <button
              className="btn btn-lima"
              onClick={() => onResolvido(!usouGabarito)}
            >
              {usouGabarito ? "Seguir (sem pontuar)" : "Fechar desafio ✓"}
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}

/* ============================ TELAS ============================ */

function TelaHome({ progresso, onEscolher }) {
  return (
    <motion.div variants={listaStagger} initial="inicial" animate="entra">
      <Letreiro
        rota="TERMINAL DE PARTIDA · ESCOLHE TUA LINHA"
        destino={"DEV DO\nCORRE"}
        sub="dois cursos · um destino: Faria Lima"
      />
      <motion.div className="card" variants={itemSobe}>
        <p className="card-txt">
          Dois busões saindo do extremo sul. Em cada parada: conceito rápido e
          desafios de três tipos — <strong>quiz</strong>,{" "}
          <strong>quebra-cabeça de encaixar código</strong> e{" "}
          <strong>código de verdade</strong>, que você digita, roda e vê
          acontecendo na tela, com um lint amigável que explica o erro em bom
          português. Acertou 3 de 5, libera o próximo ponto. Escolhe tua linha:
        </p>
      </motion.div>
      {CURSOS.map((c) => {
        const s = scoresDoCurso(progresso, c.id);
        const completos = c.modules.filter((m) => (s[m.id] || 0) >= 3).length;
        const comecou = Object.keys(s).length > 0;
        return (
          <motion.div key={c.id} variants={itemSobe}>
            <button className="curso-card" onClick={() => onEscolher(c.id)}>
              <span className="parada-tag">
                <span>{c.rota}</span>
                {comecou && (
                  <span className="parada-score">
                    {completos}/{c.modules.length} pontos
                  </span>
                )}
              </span>
              <p className="parada-nome">{c.titulo}</p>
              <p className="parada-local">🚌 {c.sub}</p>
              <p className="parada-desc">{c.desc}</p>
              <span className="curso-cta">
                {comecou ? "Continuar o corre →" : "Começar o corre →"}
              </span>
            </button>
          </motion.div>
        );
      })}
      <motion.p className="footer-note" variants={itemSobe}>
        Cada linha guarda o próprio progresso. Pode fechar e voltar depois, o
        busão te espera.
      </motion.p>
    </motion.div>
  );
}

function TelaTrilha({ curso, scores, onAbrir, onReset, onTrocarCurso }) {
  const modules = curso.modules;
  const xp = calcXP(scores, modules);
  const completos = modules.filter((m) => (scores[m.id] || 0) >= 3).length;
  const zerou = completos === modules.length;

  useEffect(() => {
    if (zerou) chuvaDeConfete();
  }, [zerou]);

  return (
    <div>
      <Letreiro mini rota={curso.rota} destino="Escolhe seu ponto" />
      <XPBar xp={xp} />
      <motion.div
        className="trilha"
        variants={listaStagger}
        initial="inicial"
        animate="entra"
      >
        {modules.map((m, i) => {
          const score = scores[m.id];
          const feito = (score || 0) >= 3;
          const liberado = i === 0 || (scores[modules[i - 1].id] || 0) >= 3;
          const atual = liberado && !feito;
          return (
            <motion.div className="parada" key={m.id} variants={itemLado}>
              <span
                className={
                  "parada-dot" +
                  (feito
                    ? " parada-dot--feito"
                    : atual
                      ? " parada-dot--atual"
                      : "")
                }
              >
                {feito ? "✓" : String(i + 1).padStart(2, "0")}
              </span>
              <button
                className="parada-card"
                disabled={!liberado}
                onClick={() => onAbrir(i)}
              >
                <span className="parada-tag">
                  <span>
                    {m.tag}
                    {!liberado ? " · 🔒 fechado" : ""}
                  </span>
                  {score !== undefined && (
                    <span className="parada-score">
                      melhor: {score}/{m.desafios.length}
                    </span>
                  )}
                </span>
                <p className="parada-nome">{m.nome}</p>
                <p className="parada-local">📍 {m.ponto}</p>
                <p className="parada-desc">{m.desc}</p>
              </button>
            </motion.div>
          );
        })}
      </motion.div>
      {zerou && (
        <motion.div
          className="card card--cor"
          style={{ background: "var(--lima)" }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springMedio}
        >
          <p className="trofeu">🏆</p>
          <p
            className="card-titulo"
            style={{
              display: "block",
              textAlign: "center",
              background: "none",
            }}
          >
            Zerou a linha!
          </p>
          <p className="card-txt" style={{ textAlign: "center" }}>
            Do {modules[0].ponto} até a {modules[modules.length - 1].ponto}:{" "}
            <strong>{getLevel(xp).nome}</strong> com {xp} XP. {curso.finalTxt}
          </p>
        </motion.div>
      )}
      <div className="stack">
        <button className="btn btn-fantasma" onClick={onTrocarCurso}>
          ↩ Trocar de linha (outro curso)
        </button>
      </div>
      <p className="footer-note">
        Refazer um desafio atualiza sua melhor pontuação.{" "}
        <button className="link-reset" onClick={onReset}>
          Zerar progresso desta linha
        </button>
      </p>
    </div>
  );
}

function TelaLicao({ modulo, onDesafio, onVoltar }) {
  const [i, setI] = useState(0);
  const l = modulo.lessons[i];
  const ultima = i === modulo.lessons.length - 1;
  return (
    <div>
      <Letreiro
        mini
        rota={modulo.tag + " · " + modulo.ponto}
        destino={modulo.nome}
      />
      <p className="pager">
        Conceito {i + 1} / {modulo.lessons.length}
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <div className="card">
            <p className="card-titulo">{l.t}</p>
            <p className="card-txt">{l.txt}</p>
            {l.code && <code className="code">{l.code}</code>}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="stack">
        {!ultima && (
          <button className="btn btn-laranja" onClick={() => setI(i + 1)}>
            Próximo conceito →
          </button>
        )}
        {ultima && (
          <button className="btn btn-azul" onClick={onDesafio}>
            Começar os desafios 🔥
          </button>
        )}
        {i > 0 && (
          <button className="btn btn-fantasma" onClick={() => setI(i - 1)}>
            ← Voltar um conceito
          </button>
        )}
        <button className="btn btn-fantasma" onClick={onVoltar}>
          Voltar pra trilha
        </button>
      </div>
    </div>
  );
}

const NOME_TIPO = { quiz: "Quiz", encaixe: "Encaixe 🧩", code: "Código ⌨️" };

function TelaDesafios({ modulo, onFim, onVoltar }) {
  const [qi, setQi] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [streak, setStreak] = useState(0);

  const d = modulo.desafios[qi];
  const ultima = qi === modulo.desafios.length - 1;

  function resolvido(pontuou) {
    const novoAcertos = pontuou ? acertos + 1 : acertos;
    if (pontuou) setStreak((s) => s + 1);
    else setStreak(0);
    setAcertos(novoAcertos);
    if (ultima) onFim(novoAcertos);
    else setQi(qi + 1);
  }

  return (
    <div>
      <Letreiro mini rota={modulo.tag + " · desafios"} destino={modulo.nome} />
      <div className="quiz-topo">
        <span>
          Desafio {qi + 1} / {modulo.desafios.length}
        </span>
        <motion.span
          key={"badge-" + qi}
          className="tipo-badge"
          initial={{ scale: 1.4, rotate: -4 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={springMedio}
          style={{ display: "inline-block" }}
        >
          {NOME_TIPO[d.tipo]}
        </motion.span>
        <span>
          <motion.span
            key={"pts-" + acertos}
            initial={{ scale: 1.6 }}
            animate={{ scale: 1 }}
            transition={springMedio}
            style={{ display: "inline-block" }}
          >
            ✔ {acertos}
          </motion.span>
          {streak >= 2 && <span className="quiz-streak"> · 🔥x{streak}</span>}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={qi}
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -36 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {d.tipo === "quiz" && <DesafioQuiz d={d} onResolvido={resolvido} />}
          {d.tipo === "encaixe" && (
            <DesafioEncaixe d={d} onResolvido={resolvido} />
          )}
          {d.tipo === "code" && <DesafioCode d={d} onResolvido={resolvido} />}
        </motion.div>
      </AnimatePresence>
      <div className="stack">
        <button className="btn btn-fantasma" onClick={onVoltar}>
          Abandonar (volta pra trilha)
        </button>
      </div>
    </div>
  );
}

function TelaResultado({
  modulo,
  score,
  xpGanho,
  ehUltimo,
  onRefazer,
  onTrilha,
}) {
  const total = modulo.desafios.length;
  const passou = score >= 3;
  const scoreAnimado = useContagem(score);

  useEffect(() => {
    if (score === total) chuvaDeConfete();
    else if (passou) estouraConfete();
    // dispara uma vez, na entrada da tela
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let msg;
  if (score === total) msg = "GABARITOU! 💛";
  else if (score >= 4) msg = "Mandou muito bem!";
  else if (score >= 3) msg = "Passou! Está no caminho.";
  else msg = "Foi por pouco... revisa e tenta de novo.";
  return (
    <div>
      <Letreiro
        mini
        rota={modulo.tag + " · resultado"}
        destino={modulo.ponto}
      />
      <motion.div
        className="card card--cor"
        style={{ background: passou ? "var(--lima)" : "var(--salmao)" }}
        initial={{ scale: 0.9, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={springMedio}
      >
        <p className="placar">
          {scoreAnimado}/{total}
        </p>
        <p className="placar-sub">{msg}</p>
        {xpGanho > 0 && (
          <motion.p
            className="placar-xp"
            initial={{ scale: 0, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...springMedio, delay: 0.5 }}
          >
            +{xpGanho} XP
          </motion.p>
        )}
        {!passou && (
          <p
            className="card-txt"
            style={{ textAlign: "center", marginTop: 12 }}
          >
            Precisa de 3 acertos pra liberar o próximo ponto. Revisa os
            conceitos e tenta de novo — ninguém aprende de primeira mesmo.
            (Desafio fechado com gabarito não pontua, mas ensina igual.)
          </p>
        )}
        {passou && ehUltimo && (
          <p
            className="card-txt"
            style={{ textAlign: "center", marginTop: 12 }}
          >
            Último ponto concluído! Volta pra trilha pra ver seu troféu. 🏆
          </p>
        )}
      </motion.div>
      <div className="stack">
        <button className="btn btn-laranja" onClick={onTrilha}>
          Voltar pra trilha
        </button>
        <button className="btn btn-fantasma" onClick={onRefazer}>
          Refazer (revisa e tenta de novo)
        </button>
      </div>
    </div>
  );
}

/* ============================ APP ============================ */

export default function DevDoCorre() {
  const [tela, setTela] = useState("carregando");
  const [progresso, setProgresso] = useState({ cursos: {} });
  const [cursoId, setCursoId] = useState(() => {
    try {
      return localStorage.getItem(CURSO_KEY) || "fullstack";
    } catch (e) {
      return "fullstack";
    }
  });
  const [ativo, setAtivo] = useState(0);
  const [ultimoResultado, setUltimoResultado] = useState(null);
  const [temaId, setTemaId] = useState(() => {
    try {
      return localStorage.getItem(TEMA_KEY) || "padrao";
    } catch (e) {
      return "padrao";
    }
  });

  const curso = CURSOS.find((c) => c.id === cursoId) || CURSOS[0];
  const modules = curso.modules;
  const scores = scoresDoCurso(progresso, curso.id);

  useEffect(() => {
    try {
      localStorage.setItem(TEMA_KEY, temaId);
    } catch (e) {
      /* sem storage, segue no tema da sessão */
    }
    const t = TEMAS.find((x) => x.id === temaId) || TEMAS[0];
    document.body.style.background = t.papel;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t.papel);
  }, [temaId]);

  useEffect(() => {
    let vivo = true;
    carregarProgresso().then((p) => {
      if (!vivo) return;
      if (p && p.cursos) setProgresso(p);
      setTela("home");
    });
    return () => {
      vivo = false;
    };
  }, []);

  function escolherCurso(id) {
    setCursoId(id);
    try {
      localStorage.setItem(CURSO_KEY, id);
    } catch (e) {
      /* segue sem salvar */
    }
    setAtivo(0);
    setTela("trilha");
  }

  function abrirModulo(i) {
    setAtivo(i);
    setTela("licao");
  }

  function fimDosDesafios(score) {
    const m = modules[ativo];
    const xpAntes = calcXP(scores, modules);
    const melhor = Math.max(scores[m.id] || 0, score);
    const novosScores = { ...scores, [m.id]: melhor };
    const novo = {
      ...progresso,
      cursos: { ...progresso.cursos, [curso.id]: { scores: novosScores } },
    };
    const xpDepois = calcXP(novosScores, modules);
    setProgresso(novo);
    salvarProgresso(novo);
    setUltimoResultado({ score, xpGanho: xpDepois - xpAntes });
    setTela("resultado");
  }

  async function resetar() {
    const ok =
      typeof window !== "undefined" && window.confirm
        ? window.confirm(
            "Certeza que quer zerar o curso " +
              curso.titulo +
              "? Vai apagar XP e progresso só dessa linha.",
          )
        : true;
    if (!ok) return;
    const novo = {
      ...progresso,
      cursos: { ...progresso.cursos, [curso.id]: { scores: {} } },
    };
    setProgresso(novo);
    await salvarProgresso(novo);
    setTela("home");
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={"ddc" + (temaId === "padrao" ? "" : " ddc--" + temaId)}>
        <style>{CSS}</style>
        <div className="ddc-shell">
          <div className="temas" role="group" aria-label="Tema de cores">
            {TEMAS.map((t) => (
              <button
                key={t.id}
                className={
                  "tema-swatch" + (temaId === t.id ? " tema-swatch--ativo" : "")
                }
                style={{
                  background:
                    "linear-gradient(135deg, " +
                    t.cor +
                    " 50%, " +
                    t.papel +
                    " 50%)",
                }}
                title={t.nome}
                aria-label={"Tema " + t.nome}
                aria-pressed={temaId === t.id}
                onClick={() => setTemaId(t.id)}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tela}
              variants={telaVariants}
              initial="inicial"
              animate="entra"
              exit="sai"
            >
              {tela === "carregando" && (
                <Letreiro
                  rota="AGUARDE..."
                  destino="Chamando o busão"
                  sub="carregando seu progresso"
                />
              )}
              {tela === "home" && (
                <TelaHome progresso={progresso} onEscolher={escolherCurso} />
              )}
              {tela === "trilha" && (
                <TelaTrilha
                  curso={curso}
                  scores={scores}
                  onAbrir={abrirModulo}
                  onReset={resetar}
                  onTrocarCurso={() => setTela("home")}
                />
              )}
              {tela === "licao" && (
                <TelaLicao
                  modulo={modules[ativo]}
                  onDesafio={() => setTela("desafios")}
                  onVoltar={() => setTela("trilha")}
                />
              )}
              {tela === "desafios" && (
                <TelaDesafios
                  key={curso.id + "-" + ativo}
                  modulo={modules[ativo]}
                  onFim={fimDosDesafios}
                  onVoltar={() => setTela("trilha")}
                />
              )}
              {tela === "resultado" && ultimoResultado && (
                <TelaResultado
                  modulo={modules[ativo]}
                  score={ultimoResultado.score}
                  xpGanho={ultimoResultado.xpGanho}
                  ehUltimo={ativo === modules.length - 1}
                  onRefazer={() => setTela("licao")}
                  onTrilha={() => setTela("trilha")}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}

/* ============================ CONTEÚDO ============================ */

/* ---------- LINHA 5X-SUL · React + Java (fullstack) ---------- */

const MODULES_FULLSTACK = [
  {
    id: "react-basico",
    nome: "React: o começo do corre",
    ponto: "Terminal Varginha",
    tag: "PONTO 01",
    desc: "Componente, JSX, props e state. A base de tudo.",
    lessons: [
      {
        t: "O que é React, afinal?",
        txt: 'React é uma biblioteca JavaScript pra montar interface. A ideia central: tudo é COMPONENTE — uma função que recebe dados e devolve JSX (aquela "marcação" parecida com HTML). Você monta a tela juntando componente igual peça de Lego.',
        code: "function Salve() {\n  return <h1>Salve, São Paulo!</h1>;\n}",
      },
      {
        t: "Props: passando dados pra dentro",
        txt: "Props são os parâmetros do componente. O pai manda, o filho recebe. Props são SOMENTE LEITURA — o filho não altera o que recebeu.",
        code: 'function Card({ nome }) {\n  return <p>E aí, {nome}!</p>;\n}\n\n<Card nome="Edu" />',
      },
      {
        t: "State: a memória do componente",
        txt: "useState guarda um valor que muda com o tempo (contador, texto de input, se o modal está aberto...). Quando você chama a função set, o React re-renderiza o componente com o valor novo.",
        code: "const [likes, setLikes] = useState(0);\n\n<button onClick={() => setLikes(likes + 1)}>\n  Curtir ({likes})\n</button>",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Como interpola uma variável dentro do JSX?",
        opts: [
          "<p>{{nome}}</p>",
          "<p>${nome}</p>",
          "<p>{nome}</p>",
          "<p><%= nome %></p>",
        ],
        correct: 2,
        explain:
          "Chave simples { }. Chave dupla é coisa de Vue/Angular, e ${ } é template string do JS puro — dentro do JSX não funciona.",
      },
      {
        tipo: "encaixe",
        enunciado:
          "Monta o componente Perfil que recebe a prop nome e mostra uma saudação:",
        pecas: [
          "function Perfil({ nome }) {",
          "  return (",
          "    <h2>E aí, {nome}!</h2>",
          "  );",
          "}",
        ],
        explain:
          "Função → return → JSX dentro → fecha o return → fecha a função. A prop chega desestruturada no parâmetro: { nome }.",
      },
      {
        tipo: "code",
        lang: "jsx",
        arquivo: "App.jsx",
        enunciado: "Seu primeiro componente rodando DE VERDADE:",
        missao: "fazer aparecer na tela um <h1> escrito Salve, Edu!",
        starter:
          "function App() {\n  // devolve um <h1> com o texto: Salve, Edu!\n\n}",
        esperado: ["Salve, Edu!"],
        dicasAuto: [
          {
            re: "return",
            falta:
              "Todo componente precisa de um return devolvendo o JSX — sem return, não aparece nada.",
          },
          {
            re: "<h1",
            falta: "A missão pede um <h1>. Tag abre <h1> e fecha </h1>.",
          },
        ],
        dicas: [
          "O componente é uma função que RETORNA JSX.",
          "A estrutura toda: return <h1>Salve, Edu!</h1>;",
        ],
        gabarito: "function App() {\n  return <h1>Salve, Edu!</h1>;\n}",
      },
      {
        tipo: "quiz",
        q: "Por que NÃO pode alterar o state na mão, como likes = 5?",
        opts: [
          "Porque dá erro de sintaxe no JS",
          "Porque o React não fica sabendo e a tela não atualiza",
          "Porque state é constante pra sempre",
          "Pode sim, sem problema nenhum",
        ],
        correct: 1,
        explain:
          "O React só re-renderiza quando você usa a função set. Mudando direto, o valor até muda na memória, mas a tela fica pra trás.",
      },
      {
        tipo: "code",
        lang: "jsx",
        arquivo: "App.jsx",
        enunciado: "Botão de curtir com state — o clássico:",
        missao:
          "um botão Curtir (0) que vira Curtir (1), Curtir (2)... a cada clique. O useState já está disponível, nem precisa importar.",
        testa: "👆 clica no botão do preview!",
        starter:
          "function App() {\n  // 1) cria o state:\n  //    const [likes, setLikes] = useState(0)\n  // 2) no clique do botão, soma 1\n\n  return (\n    <button>\n      Curtir (0)\n    </button>\n  );\n}",
        esperado: ["Curtir (0)", "Curtir (1)"],
        dicasAuto: [
          {
            re: "useState",
            falta: "Vai precisar do useState pra guardar os likes.",
          },
          {
            re: "onClick",
            falta: "O botão precisa de um onClick={...} pra reagir ao clique.",
          },
          {
            re: "\\{likes\\}",
            falta:
              "Mostra o valor na tela: Curtir ({likes}) — com chaves pra interpolar.",
          },
        ],
        dicas: [
          "Primeiro o state: const [likes, setLikes] = useState(0);",
          "No botão: onClick={() => setLikes(likes + 1)}",
          "E o texto vira: Curtir ({likes})",
        ],
        gabarito:
          "function App() {\n  const [likes, setLikes] = useState(0);\n\n  return (\n    <button onClick={() => setLikes(likes + 1)}>\n      Curtir ({likes})\n    </button>\n  );\n}",
      },
    ],
  },
  {
    id: "react-inter",
    nome: "React: pegando o ritmo",
    ponto: "Terminal Grajaú",
    tag: "PONTO 02",
    desc: "useEffect, listas com map, condicional e input controlado.",
    lessons: [
      {
        t: "useEffect: efeito colateral",
        txt: "Serve pra sincronizar o componente com o mundo lá fora: buscar dado de API, mexer no título da aba, criar timer. O array de dependências controla QUANDO o efeito roda de novo.",
        code: "useEffect(() => {\n  console.log('montou!');\n}, []); // array vazio = roda 1x, na montagem",
      },
      {
        t: "Lista com map + key",
        txt: "Pra renderizar lista, usa .map(). Cada item precisa de uma key ÚNICA e estável (de preferência o id do dado) — é assim que o React sabe o que entrou, saiu ou mudou.",
        code: "{produtos.map(p => (\n  <li key={p.id}>{p.nome}</li>\n))}",
      },
      {
        t: "Condicional + input controlado",
        txt: "Renderização condicional é ternário ou &&. Input controlado é quando o value vem do state e o onChange atualiza esse state — o React vira o dono da verdade.",
        code: "{logado ? <Painel /> : <Login />}\n\n<input\n  value={busca}\n  onChange={e => setBusca(e.target.value)}\n/>",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "useEffect com array de dependências VAZIO roda quando?",
        opts: [
          "A cada renderização",
          "Só quando o componente monta",
          "Nunca",
          "Só quando o componente desmonta",
        ],
        correct: 1,
        explain:
          "Array vazio = nenhuma dependência pra observar = roda uma vez só, na montagem.",
      },
      {
        tipo: "code",
        lang: "jsx",
        arquivo: "App.jsx",
        enunciado: "Renderiza a lista de corres com .map():",
        missao:
          "mostrar os 3 itens do array na tela, cada um numa <li> com key.",
        starter:
          "const corres = ['Estudar React', 'Treinar Java', 'Lançar o app'];\n\nfunction App() {\n  return (\n    <ul>\n      {/* usa corres.map(...) aqui, com key! */}\n    </ul>\n  );\n}",
        esperado: ["Estudar React", "Treinar Java", "Lançar o app"],
        dicasAuto: [
          {
            re: "\\.map\\(",
            falta:
              "Usa corres.map(item => ...) pra transformar cada texto numa <li>.",
          },
          {
            re: "key=",
            falta:
              "Cada <li> precisa da prop key — aqui pode ser o próprio item: key={item}.",
          },
        ],
        dicas: [
          "Dentro do <ul>: {corres.map(item => ...)}",
          "Cada item vira: <li key={item}>{item}</li>",
        ],
        gabarito:
          "const corres = ['Estudar React', 'Treinar Java', 'Lançar o app'];\n\nfunction App() {\n  return (\n    <ul>\n      {corres.map(item => (\n        <li key={item}>{item}</li>\n      ))}\n    </ul>\n  );\n}",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta o input controlado — o React como dono da verdade:",
        pecas: [
          "function Busca() {",
          "  const [texto, setTexto] = useState('');",
          "  return (",
          "    <input",
          "      value={texto}",
          "      onChange={e => setTexto(e.target.value)}",
          "    />",
          "  );",
          "}",
        ],
        explain:
          "Primeiro o state, depois o input com value ligado no state e onChange atualizando. value + onChange = controlado.",
      },
      {
        tipo: "quiz",
        q: "Quando esse parágrafo aparece na tela?",
        code: "{erro && <p>Falha ao carregar!</p>}",
        opts: [
          "Sempre",
          "Quando erro for truthy",
          "Quando erro for false",
          "Nunca, a sintaxe é inválida",
        ],
        correct: 1,
        explain:
          "O && só renderiza o lado direito se o esquerdo for truthy. Atalho clássico de condicional no JSX.",
      },
      {
        tipo: "code",
        lang: "jsx",
        arquivo: "App.jsx",
        enunciado: "Renderização condicional na prática:",
        missao:
          "se online for true, mostrar Online 🟢 — senão, Sem conexão 🔴. Testa trocando o valor de online depois!",
        starter:
          "function App() {\n  const online = true;\n\n  // mostra <p>Online 🟢</p> se online,\n  // senão <p>Sem conexão 🔴</p>\n  return (\n    <div>\n\n    </div>\n  );\n}",
        esperado: ["Online"],
        dicasAuto: [
          {
            re: "\\?|&&",
            falta:
              "Usa ternário {online ? isso : aquilo} ou o operador && dentro do JSX.",
          },
        ],
        dicas: [
          "Dentro da <div>: {online ? <p>Online 🟢</p> : <p>Sem conexão 🔴</p>}",
        ],
        gabarito:
          "function App() {\n  const online = true;\n\n  return (\n    <div>\n      {online ? <p>Online 🟢</p> : <p>Sem conexão 🔴</p>}\n    </div>\n  );\n}",
      },
    ],
  },
  {
    id: "react-avancado",
    nome: "React: modo avançado",
    ponto: "Cidade Dutra",
    tag: "PONTO 03",
    desc: "Custom hooks, Context, memorização e performance.",
    lessons: [
      {
        t: "Custom hook: sua lógica reutilizável",
        txt: 'Quando a mesma lógica de state/efeito aparece em vários componentes, você extrai pra um custom hook. Regra de ouro: o nome SEMPRE começa com "use".',
        code: "function useToggle(inicial) {\n  const [on, setOn] = useState(inicial);\n  const toggle = () => setOn(v => !v);\n  return [on, toggle];\n}",
      },
      {
        t: "Context: chega de prop drilling",
        txt: "Quando um dado precisa descer por vários níveis de componente (tema, usuário logado), passar prop por prop fica trabalhoso. Context deixa qualquer descendente ler o valor direto.",
        code: "const TemaContext = createContext();\n\n// lá embaixo na árvore:\nconst tema = useContext(TemaContext);",
      },
      {
        t: "useMemo, useCallback e React.memo",
        txt: "useMemo memoriza um VALOR calculado pesado. useCallback memoriza uma FUNÇÃO (pra não recriar a cada render). React.memo evita re-render de um componente se as props não mudaram. Use quando tiver problema real de performance, não por vício.",
        code: "const total = useMemo(\n  () => calcularPesado(itens),\n  [itens]\n);",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Qual a regra de nomenclatura de um custom hook?",
        opts: [
          "Qualquer nome serve",
          'Tem que começar com "use"',
          "Tem que ser tudo maiúsculo",
          'Tem que terminar com "Hook"',
        ],
        correct: 1,
        explain:
          "useAlgumaCoisa. É essa convenção que permite o React (e o lint) aplicar as regras de hooks direitinho.",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta o custom hook useToggle — liga/desliga reutilizável:",
        pecas: [
          "function useToggle(inicial) {",
          "  const [on, setOn] = useState(inicial);",
          "  const toggle = () => setOn(v => !v);",
          "  return [on, toggle];",
          "}",
        ],
        explain:
          "Primeiro o state, depois a função que inverte, e o hook devolve os dois num array — assim como o useState faz.",
      },
      {
        tipo: "quiz",
        q: "Diferença entre useMemo e useCallback:",
        opts: [
          "São idênticos, só muda o nome",
          "useMemo memoriza um VALOR; useCallback memoriza uma FUNÇÃO",
          "useCallback só funciona em classe",
          "useMemo roda no servidor",
        ],
        correct: 1,
        explain:
          "useMemo guarda o resultado de um cálculo. useCallback guarda a referência de uma função. useCallback(fn, deps) é basicamente useMemo(() => fn, deps).",
      },
      {
        tipo: "code",
        lang: "jsx",
        arquivo: "useContador.jsx",
        enunciado: "Cria seu primeiro custom hook:",
        missao:
          "completar o useContador pra devolver [n, incrementa]. O App já está pronto usando ele — se o hook funcionar, o botão conta.",
        testa: "👆 clica no botão do preview!",
        starter:
          "// complete o hook: devolve [n, incrementa]\nfunction useContador(inicial) {\n\n}\n\nfunction App() {\n  const [n, incrementa] = useContador(0);\n  return (\n    <button onClick={incrementa}>Cliques: {n}</button>\n  );\n}",
        esperado: ["Cliques: 0", "Cliques: 1"],
        dicasAuto: [
          {
            re: "useState",
            falta:
              "Dentro do hook, usa useState(inicial) pra guardar o número — hook pode usar hook.",
          },
          {
            re: "return\\s*\\[",
            falta: "O hook precisa DEVOLVER um array: return [n, incrementa];",
          },
        ],
        dicas: [
          "Dentro do hook: const [n, setN] = useState(inicial);",
          "A função: const incrementa = () => setN(v => v + 1);",
          "E fecha com: return [n, incrementa];",
        ],
        gabarito:
          "function useContador(inicial) {\n  const [n, setN] = useState(inicial);\n  const incrementa = () => setN(v => v + 1);\n  return [n, incrementa];\n}\n\nfunction App() {\n  const [n, incrementa] = useContador(0);\n  return (\n    <button onClick={incrementa}>Cliques: {n}</button>\n  );\n}",
      },
      {
        tipo: "quiz",
        q: "O que o React.memo faz?",
        opts: [
          "Salva o componente no navegador",
          "Evita re-render do componente se as props não mudaram",
          "Deixa o componente assíncrono",
          "Cria uma cópia independente do componente",
        ],
        correct: 1,
        explain:
          "Ele compara as props: se vieram iguais, o React pula a re-renderização daquele componente. Bom pra filho pesado de pai que renderiza toda hora.",
      },
    ],
  },
  {
    id: "java-basico",
    nome: "Java: a fundação",
    ponto: "Interlagos",
    tag: "PONTO 04",
    desc: "Tipos, métodos, loops e coleções. O concreto do prédio.",
    lessons: [
      {
        t: "Tipagem forte, sem mistério",
        txt: "Em Java toda variável tem tipo declarado e o compilador cobra. Primitivos: int, double, boolean, char... String e as coleções são objetos. Isso pega muito erro ANTES de rodar.",
        code: 'int idade = 25;\ndouble preco = 9.90;\nboolean ativo = true;\nString nome = "Edu";',
      },
      {
        t: "Tudo vive dentro de classe",
        txt: "Java é orientado a objeto de ponta a ponta: método não existe solto, sempre dentro de uma classe. Assinatura de método = visibilidade + retorno + nome + parâmetros.",
        code: "public class Calc {\n  public int somar(int a, int b) {\n    return a + b;\n  }\n}",
      },
      {
        t: "Array x ArrayList",
        txt: "Array tem tamanho FIXO. ArrayList (da Collections) cresce dinamicamente e vem cheio de método útil: add, remove, contains, size...",
        code: 'List<String> nomes = new ArrayList<>();\nnomes.add("Edu");\nnomes.add("Bia");\nnomes.size(); // 2',
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Qual desses é um tipo PRIMITIVO em Java?",
        opts: ["String", "int", "ArrayList", "Integer"],
        correct: 1,
        explain:
          "int, double, boolean, char, long... são primitivos. String, Integer e ArrayList são objetos (classes).",
      },
      {
        tipo: "code",
        lang: "java",
        arquivo: "Main.java",
        enunciado: "Seu primeiro Java: variáveis + println.",
        contexto:
          "Aqui o Java não roda de verdade (ele precisa da JVM, não do navegador) — mas o lint confere seu código como um compilador amigável.",
        missao:
          'declarar String nome = "Edu" e int idade = 25, e imprimir: Edu tem 25 anos',
        starter:
          'public class Main {\n  public static void main(String[] args) {\n    // 1) String nome = "Edu";\n    // 2) int idade = 25;\n    // 3) imprime: Edu tem 25 anos\n\n  }\n}',
        regras: [
          {
            re: 'String\\s+nome\\s*=\\s*"',
            label: "String nome",
            falta:
              'Falta declarar a String nome = "Edu"; — com aspas DUPLAS: em Java, aspas simples é só pra char.',
          },
          {
            re: "int\\s+idade\\s*=\\s*\\d",
            label: "int idade",
            falta: "Falta o int idade = 25; — número vai sem aspas.",
          },
          {
            re: "System\\.out\\.println\\(",
            label: "println",
            falta: "Usa System.out.println(...) pra imprimir no console.",
          },
          {
            re: "nome\\s*\\+|\\+\\s*nome",
            label: "concatenar com +",
            falta: 'Junta as partes com + : nome + " tem " + idade + " anos"',
          },
        ],
        saida: "Edu tem 25 anos",
        dicas: [
          "Declara primeiro as duas variáveis, cada uma com ; no final.",
          'A impressão: System.out.println(nome + " tem " + idade + " anos");',
        ],
        gabarito:
          'public class Main {\n  public static void main(String[] args) {\n    String nome = "Edu";\n    int idade = 25;\n    System.out.println(nome + " tem " + idade + " anos");\n  }\n}',
      },
      {
        tipo: "quiz",
        q: "Pra comparar o CONTEÚDO de duas Strings, usa:",
        opts: ["s1 == s2", "s1.equals(s2)", "s1 === s2", "compare(s1, s2)"],
        correct: 1,
        explain:
          "== compara referência (se é o MESMO objeto na memória). .equals() compara o texto de verdade. Clássica pegadinha de entrevista.",
      },
      {
        tipo: "code",
        lang: "java",
        arquivo: "Main.java",
        enunciado: "Loop somando: 1 + 2 + 3 + 4 + 5.",
        missao:
          "usar um for de 1 até 5 acumulando na variável soma. Saída esperada: 15",
        starter:
          "public class Main {\n  public static void main(String[] args) {\n    int soma = 0;\n\n    // for de 1 até 5, acumulando em soma\n\n    System.out.println(soma);\n  }\n}",
        regras: [
          {
            re: "for\\s*\\(",
            label: "for",
            falta:
              "Falta o for. Estrutura: for (int i = 1; i <= 5; i++) { ... }",
          },
          {
            re: "i\\s*<=\\s*5|i\\s*<\\s*6",
            label: "vai até 5",
            falta: "O loop precisa ir até o 5: condição i <= 5 (ou i < 6).",
          },
          {
            re: "soma\\s*\\+=|soma\\s*=\\s*soma\\s*\\+",
            label: "soma acumula",
            falta:
              "Dentro do loop, acumula: soma += i; (que é o mesmo que soma = soma + i).",
          },
        ],
        saida: "15",
        dicas: [
          "for (int i = 1; i <= 5; i++) { ... }",
          "Dentro das chaves do for: soma += i;",
        ],
        gabarito:
          "public class Main {\n  public static void main(String[] args) {\n    int soma = 0;\n\n    for (int i = 1; i <= 5; i++) {\n      soma += i;\n    }\n\n    System.out.println(soma);\n  }\n}",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a classe Calc com o método somar:",
        pecas: [
          "public class Calc {",
          "  public int somar(int a, int b) {",
          "    return a + b;",
          "  }",
          "}",
        ],
        explain:
          "Classe fora, método dentro: visibilidade + tipo de retorno + nome + parâmetros. O return devolve a conta e cada bloco fecha sua chave.",
      },
    ],
  },
  {
    id: "java-poo",
    nome: "Java: POO na prática",
    ponto: "Socorro",
    tag: "PONTO 05",
    desc: "Classe, objeto, herança, interface e polimorfismo.",
    lessons: [
      {
        t: "Classe é o molde, objeto é a peça",
        txt: "A classe define atributos e comportamentos. O objeto é a instância criada com new. O construtor roda na hora do nascimento pra deixar o objeto pronto pro uso.",
        code: 'public class Carro {\n  private String modelo;\n\n  public Carro(String modelo) {\n    this.modelo = modelo;\n  }\n}\n\nCarro c = new Carro("Gol bolinha");',
      },
      {
        t: "Encapsulamento: cada coisa no seu lugar",
        txt: "Atributo fica private e o mundo externo só acessa pelos métodos que VOCÊ liberou (getters/setters ou métodos de negócio). Isso protege o estado interno de ser bagunçado por fora.",
        code: "public class Conta {\n  private double saldo;\n\n  public void depositar(double valor) {\n    if (valor > 0) saldo += valor;\n  }\n}",
      },
      {
        t: "Herança, interface e polimorfismo",
        txt: "extends herda de UMA classe. implements assina o contrato de uma interface (pode várias). Polimorfismo: a variável pode ser do tipo pai, mas quem manda é o método sobrescrito do tipo REAL do objeto.",
        code: "class Moto extends Veiculo { }\nclass Pix implements Pagamento { }\n\nAnimal a = new Cachorro();\na.fazerSom(); // late! roda o do Cachorro",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Encapsulamento é:",
        opts: [
          "Deixar todos os atributos public",
          "Esconder os detalhes internos (private) e expor só o necessário via métodos",
          "Criar o máximo de classes possível",
          "Usar static em tudo",
        ],
        correct: 1,
        explain:
          "A classe protege o próprio estado. Quem está de fora interage pelos métodos liberados — e a classe valida o que entra.",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a classe Carro com atributo privado e construtor:",
        pecas: [
          "public class Carro {",
          "  private String modelo;",
          "  public Carro(String modelo) {",
          "    this.modelo = modelo;",
          "  }",
          "}",
        ],
        explain:
          "Atributo private primeiro, depois o construtor com o mesmo nome da classe. O this.modelo diferencia o atributo do parâmetro que chegou.",
      },
      {
        tipo: "code",
        lang: "java",
        arquivo: "Conta.java",
        enunciado: "Encapsulamento na prática — a classe Conta:",
        missao:
          "atributo private double saldo + método public void depositar(double valor) que só soma se valor > 0.",
        starter:
          "public class Conta {\n  // 1) atributo private double saldo\n\n  // 2) public void depositar(double valor)\n  //    que só soma no saldo se valor > 0\n\n}",
        regras: [
          {
            re: "private\\s+double\\s+saldo",
            label: "private saldo",
            falta:
              "O saldo tem que ser private double saldo; — encapsulado, ninguém mexe direto de fora.",
          },
          {
            re: "public\\s+void\\s+depositar\\s*\\(\\s*double",
            label: "depositar()",
            falta:
              "Declara o método: public void depositar(double valor) { ... }",
          },
          {
            re: "if\\s*\\(",
            label: "valida com if",
            falta:
              "Protege com if (valor > 0) — conta não aceita depósito negativo.",
          },
          {
            re: "saldo\\s*\\+=|saldo\\s*=\\s*saldo\\s*\\+",
            label: "soma no saldo",
            falta: "Dentro do if, soma: saldo += valor;",
          },
        ],
        saida: "new Conta() → depositar(150.0) → saldo interno: 150.0 ✓",
        dicas: [
          "O atributo: private double saldo; (uma linha só, dentro da classe).",
          "O método: public void depositar(double valor) { if (valor > 0) { saldo += valor; } }",
        ],
        gabarito:
          "public class Conta {\n  private double saldo;\n\n  public void depositar(double valor) {\n    if (valor > 0) {\n      saldo += valor;\n    }\n  }\n}",
      },
      {
        tipo: "quiz",
        q: "Cachorro sobrescreve fazerSom(). O que roda aqui?",
        code: "Animal a = new Cachorro();\na.fazerSom();",
        opts: [
          "O método da classe Animal",
          "O método sobrescrito do Cachorro",
          "Erro de compilação",
          "Nada, o método some",
        ],
        correct: 1,
        explain:
          "Isso é polimorfismo: o tipo REAL do objeto (Cachorro) decide qual versão do método roda em tempo de execução.",
      },
      {
        tipo: "quiz",
        q: "Diferença entre extends e implements:",
        opts: [
          "São sinônimos",
          "extends herda de uma CLASSE; implements assina o contrato de uma INTERFACE",
          "implements herda os atributos privados",
          "extends só serve pra interface",
        ],
        correct: 1,
        explain:
          "extends = herança de classe (uma só). implements = compromisso de implementar os métodos da interface (pode implementar várias).",
      },
    ],
  },
  {
    id: "spring-boot",
    nome: "Spring Boot: o backend",
    ponto: "Largo Treze",
    tag: "PONTO 06",
    desc: "API REST, camadas, annotations e injeção de dependência.",
    lessons: [
      {
        t: "API REST: o balcão do backend",
        txt: "Sua API expõe endpoints HTTP. @RestController marca a classe que atende as requisições e devolve JSON. @GetMapping busca, @PostMapping cria, @PutMapping atualiza, @DeleteMapping apaga.",
        code: '@RestController\n@RequestMapping("/api/produtos")\npublic class ProdutoController {\n\n  @GetMapping\n  public List<Produto> listar() { ... }\n\n  @PostMapping\n  public Produto criar(@RequestBody Produto p) { ... }\n}',
      },
      {
        t: "Camadas: cada uma com sua função",
        txt: "Controller recebe a requisição e devolve resposta. Service guarda a regra de negócio. Repository conversa com o banco. Separar assim deixa o código testável e organizado — igual você já viu no vt_wf, só que com cada coisa no seu lugar.",
        code: "// Controller  →  Service  →  Repository  →  Banco\n\npublic interface ProdutoRepository\n    extends JpaRepository<Produto, Long> { }",
      },
      {
        t: "Injeção de dependência",
        txt: "Você não dá new nos objetos de infraestrutura: declara o que precisa e o Spring cria e entrega pronto. O jeito recomendado é injeção via construtor.",
        code: "@Service\npublic class ProdutoService {\n  private final ProdutoRepository repo;\n\n  public ProdutoService(ProdutoRepository repo) {\n    this.repo = repo; // o Spring injeta\n  }\n}",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "O que a annotation @RestController faz?",
        opts: [
          "Cria o banco de dados automaticamente",
          "Marca a classe que responde requisições HTTP devolvendo JSON",
          "Gera a interface gráfica do sistema",
          "Roda os testes unitários",
        ],
        correct: 1,
        explain:
          "Ela transforma a classe num controlador REST: os métodos viram endpoints e o retorno é serializado pra JSON automaticamente.",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta o controller com endpoint GET que lista produtos:",
        pecas: [
          "@RestController",
          '@RequestMapping("/api/produtos")',
          "public class ProdutoController {",
          "  @GetMapping",
          "  public List<Produto> listar() {",
          "    return service.listarTodos();",
          "  }",
          "}",
        ],
        explain:
          "Annotations em cima da classe primeiro, depois a classe, o @GetMapping em cima do método, e o método delegando pro service. Cada camada no seu lugar.",
      },
      {
        tipo: "code",
        lang: "java",
        arquivo: "ProdutoController.java",
        enunciado: "Cria o endpoint POST — o de criar produto:",
        missao:
          "um método com @PostMapping que recebe um Produto via @RequestBody e devolve ele.",
        starter:
          '@RestController\n@RequestMapping("/api/produtos")\npublic class ProdutoController {\n\n  // endpoint POST que recebe um Produto\n  // no corpo da requisição e devolve ele\n\n}',
        regras: [
          {
            re: "@PostMapping",
            label: "@PostMapping",
            falta:
              "Falta a annotation @PostMapping em cima do método — é ela que faz o endpoint aceitar POST.",
          },
          {
            re: "@RequestBody",
            label: "@RequestBody",
            falta:
              "O Produto chega no CORPO da requisição: recebe com @RequestBody Produto p.",
          },
          {
            re: "public\\s+Produto\\s+\\w+\\s*\\(",
            label: "método público",
            falta:
              "Declara o método público devolvendo Produto: public Produto criar(@RequestBody Produto p) { ... }",
          },
          {
            re: "return",
            label: "return",
            falta:
              "Devolve o produto no final: return p; — o Spring serializa pra JSON sozinho.",
          },
        ],
        saida: "POST /api/produtos → 201 Created (JSON no corpo)",
        dicas: [
          "A annotation vai numa linha, o método na de baixo.",
          "Assinatura completa: public Produto criar(@RequestBody Produto p) { return p; }",
        ],
        gabarito:
          '@RestController\n@RequestMapping("/api/produtos")\npublic class ProdutoController {\n\n  @PostMapping\n  public Produto criar(@RequestBody Produto p) {\n    return p;\n  }\n}',
      },
      {
        tipo: "quiz",
        q: "Na arquitetura em camadas, quem conversa com o banco?",
        opts: [
          "O Controller",
          "O Repository",
          "O front-end",
          "A annotation @GetMapping",
        ],
        correct: 1,
        explain:
          "Controller recebe → Service aplica a regra de negócio → Repository acessa o banco. Cada camada com sua função.",
      },
      {
        tipo: "quiz",
        q: "A annotation @PathVariable serve pra:",
        opts: [
          "Pegar um valor da URL, tipo o id em /produtos/{id}",
          "Criar variável global no projeto",
          "Definir a porta do servidor",
          "Validar a senha do usuário",
        ],
        correct: 0,
        explain:
          'Ela liga o pedaço dinâmico da URL ao parâmetro do método: @GetMapping("/{id}") + @PathVariable Long id.',
      },
    ],
  },
  {
    id: "fullstack",
    nome: "Boss final: fullstack",
    ponto: "Faria Lima",
    tag: "PONTO FINAL",
    desc: "React + Spring conversando: fetch, JSON e CORS.",
    lessons: [
      {
        t: "O fluxo completo do app",
        txt: "React (fetch) → HTTP → Controller → Service → Repository → Banco. A resposta volta o caminho contrário, virando JSON no meio do caminho. Front e back são projetos separados que se falam por HTTP.",
        code: "// React (porta 5173)  ⇄  Spring (porta 8080)\n// GET /api/produtos  →  200 OK + JSON",
      },
      {
        t: "Consumindo a API no React",
        txt: "fetch (ou axios) dentro de um useEffect pra carregar na montagem. res.json() converte o corpo da resposta em objeto JS, e aí é só jogar no state.",
        code: "useEffect(() => {\n  fetch('http://localhost:8080/api/produtos')\n    .then(res => res.json())\n    .then(setProdutos)\n    .catch(err => setErro(err.message));\n}, []);",
      },
      {
        t: "CORS: o segurança na porta",
        txt: "O navegador bloqueia requisição de uma origem (localhost:5173) pra outra (localhost:8080) se o backend não autorizar. Resolve liberando a origem no Spring — @CrossOrigin no controller ou uma config global de CORS.",
        code: '@CrossOrigin(origins = "http://localhost:5173")\n@RestController\npublic class ProdutoController { ... }',
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "O React consome a API Java através de:",
        opts: [
          "Importando a classe Java direto no JS",
          "Requisições HTTP (fetch/axios) pros endpoints",
          "Copiando o banco pra dentro do front",
          "JDBC rodando no navegador",
        ],
        correct: 1,
        explain:
          "Front e back são mundos separados. A ponte é HTTP: o React chama os endpoints e recebe JSON de volta.",
      },
      {
        tipo: "code",
        lang: "jsx",
        arquivo: "App.jsx",
        enunciado: 'BOSS: consome a "API" e lista os produtos na tela.',
        contexto:
          "A função buscarProdutos() já existe e devolve uma Promise — igual um fetch de verdade, só que sem backend. Sua parte é o useEffect.",
        missao:
          "buscar os dados na montagem e jogar no state — os 3 produtos têm que aparecer na lista.",
        starter:
          "// buscarProdutos() já existe e devolve uma Promise\n// (igual um fetch, só que sem backend)\n\nfunction App() {\n  const [produtos, setProdutos] = useState([]);\n\n  // useEffect: chama buscarProdutos()\n  // e joga o resultado no state\n\n  return (\n    <ul>\n      {produtos.map(p => <li key={p.id}>{p.nome}</li>)}\n    </ul>\n  );\n}",
        preambulo:
          "function buscarProdutos() {\n  return new Promise(resolve => setTimeout(() => resolve([\n    { id: 1, nome: 'Fone bluetooth' },\n    { id: 2, nome: 'Teclado gamer' },\n    { id: 3, nome: 'Mouse sem fio' }\n  ]), 700));\n}",
        esperado: ["Fone bluetooth", "Teclado gamer", "Mouse sem fio"],
        dicasAuto: [
          {
            re: "useEffect",
            falta:
              "A busca vai dentro de um useEffect(() => { ... }, []) — efeito de montagem.",
          },
          {
            re: "buscarProdutos\\(\\)",
            falta: "Chama a função: buscarProdutos().then(...)",
          },
          {
            re: "setProdutos",
            falta:
              "Quando os dados chegarem, joga no state: .then(setProdutos).",
          },
          {
            re: "\\[\\]\\s*\\)",
            falta:
              "Não esquece o array de dependências vazio [] no final do useEffect — senão vira loop infinito de requisição!",
          },
        ],
        dicas: [
          "Estrutura: useEffect(() => { ... }, []);",
          "Dentro dele: buscarProdutos().then(setProdutos);",
          "O .then(setProdutos) é atalho pra .then(dados => setProdutos(dados)).",
        ],
        gabarito:
          "function App() {\n  const [produtos, setProdutos] = useState([]);\n\n  useEffect(() => {\n    buscarProdutos().then(setProdutos);\n  }, []);\n\n  return (\n    <ul>\n      {produtos.map(p => <li key={p.id}>{p.nome}</li>)}\n    </ul>\n  );\n}",
      },
      {
        tipo: "quiz",
        q: "Apareceu erro de CORS no console do navegador. O que rolou?",
        opts: [
          "O banco de dados caiu",
          "O navegador bloqueou porque o back não autorizou a origem do front",
          "Erro de sintaxe no JSX",
          "A internet caiu no meio da requisição",
        ],
        correct: 1,
        explain:
          "CORS é o navegador te protegendo. A correção é no BACKEND: liberar a origem com @CrossOrigin ou config global.",
      },
      {
        tipo: "encaixe",
        enunciado:
          "Encaixa o fluxo de uma requisição, do clique até o dado voltar:",
        pecas: [
          "React dispara o fetch pro endpoint",
          "Controller recebe a requisição HTTP",
          "Service aplica a regra de negócio",
          "Repository consulta o banco de dados",
          "A resposta volta pro front virando JSON",
        ],
        explain:
          "Front chama → Controller recebe → Service pensa → Repository busca → e a resposta refaz o caminho virando JSON. Esse é o esqueleto de TODO app fullstack.",
      },
      {
        tipo: "quiz",
        q: "Quem transforma o objeto Java em JSON na resposta da API?",
        opts: [
          "Você, montando a string na mão sempre",
          "O Spring (via Jackson) serializa automaticamente",
          "O navegador do usuário",
          "O MySQL",
        ],
        correct: 1,
        explain:
          "Com @RestController, o retorno do método passa pelo Jackson e vira JSON sozinho. Você devolve o objeto, o Spring cuida do resto.",
      },
    ],
  },
];

/* ---------- LINHA 6X-SUL · HTML + CSS + JS + mini TypeScript ---------- */

const MODULES_WEB = [
  {
    id: "html-base",
    nome: "HTML: o esqueleto de tudo",
    ponto: "Terminal Parelheiros",
    tag: "PONTO 01",
    desc: "Tags, títulos, parágrafos, listas, links e imagens.",
    lessons: [
      {
        t: "O que é HTML, afinal?",
        txt: "HTML é a ESTRUTURA da página — o esqueleto. Ele diz O QUE existe na tela: um título, um parágrafo, uma lista, uma imagem. Tudo é feito de TAGS: quase toda tag abre <assim> e fecha </assim>, e o conteúdo vai no meio.",
        code: "<h1>Dev do Corre</h1>\n<p>Direto do extremo sul.</p>",
      },
      {
        t: "Títulos, parágrafos e listas",
        txt: "Títulos vão de <h1> (o mais importante, um por página) até <h6>. Parágrafo é <p>. Lista com bolinha é <ul> e lista numerada é <ol> — as duas com itens <li> dentro.",
        code: "<h2>Corres da semana</h2>\n<ul>\n  <li>Estudar HTML</li>\n  <li>Pagar o boleto</li>\n</ul>",
      },
      {
        t: "Links e imagens",
        txt: 'Link é <a href="url">texto</a>. Imagem é <img src="url" alt="descrição"> — o alt descreve a imagem pra quem usa leitor de tela e aparece se ela não carregar. A <img> é uma tag VAZIA: não tem fechamento.',
        code: '<a href="https://google.com">Pesquisar</a>\n<img src="busao.png" alt="Ônibus da linha 5X-Sul" />',
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Qual o papel do HTML numa página web?",
        opts: [
          "Dar o visual: cores, fontes e espaçamento",
          "Dar a ESTRUTURA: dizer o que existe na página",
          "Dar a lógica: reagir a cliques e calcular coisas",
          "Guardar os dados no servidor",
        ],
        correct: 1,
        explain:
          "HTML é o esqueleto (estrutura), CSS é a roupa (visual) e JavaScript é o movimento (lógica). Cada um no seu corre.",
      },
      {
        tipo: "encaixe",
        enunciado:
          "Monta a estrutura básica: um main com título e parágrafo dentro:",
        pecas: [
          "<main>",
          "  <h1>Dev do Corre</h1>",
          "  <p>Do extremo sul pro mundo.</p>",
          "</main>",
        ],
        explain:
          "Abre o <main>, conteúdo indentado dentro (título primeiro, depois o parágrafo), e fecha o </main>. Tag que abre, fecha.",
      },
      {
        tipo: "code",
        lang: "html",
        arquivo: "index.html",
        enunciado: "Tua primeira página, rodando DE VERDADE:",
        missao:
          "fazer aparecer um título h1 escrito Salve, quebrada! e um parágrafo p com um texto teu embaixo.",
        starter:
          "<!-- escreve teu HTML aqui embaixo -->\n<!-- 1) um titulo h1 com: Salve, quebrada! -->\n<!-- 2) um paragrafo p com um texto teu -->\n\n",
        esperado: ["Salve, quebrada!"],
        regras: [
          {
            re: "<h1[\\s>]",
            label: "<h1>",
            falta: "Falta o título: <h1>Salve, quebrada!</h1>",
          },
          {
            re: "<p[\\s>]",
            label: "<p>",
            falta: "Falta o parágrafo: <p>algum texto teu</p>",
          },
        ],
        dicas: [
          "Tag abre e fecha: <h1>texto</h1>.",
          "O <p> vai logo embaixo do <h1>, cada um na sua linha.",
        ],
        gabarito:
          "<h1>Salve, quebrada!</h1>\n<p>Primeira página no ar, direto do extremo sul.</p>",
      },
      {
        tipo: "quiz",
        q: "Pra que serve o atributo alt da <img>?",
        opts: [
          "Deixa a imagem maior quando passa o mouse",
          "Descreve a imagem pra leitores de tela e aparece se ela não carregar",
          "É o link pra onde a imagem leva",
          "Define a pasta onde a imagem fica salva",
        ],
        correct: 1,
        explain:
          "O alt é acessibilidade pura: quem não enxerga a imagem (pessoa ou robô do Google) lê a descrição. E se o src quebrar, é ele que aparece.",
      },
      {
        tipo: "code",
        lang: "html",
        arquivo: "index.html",
        enunciado: "Lista de corres da semana:",
        missao:
          "uma lista ul com 3 itens li: Estudar HTML, Treinar CSS e Dominar o JS.",
        starter:
          "<h2>Corres da semana</h2>\n<!-- monta a lista com 3 itens aqui -->\n\n",
        esperado: ["Estudar HTML", "Treinar CSS", "Dominar o JS"],
        regras: [
          {
            re: "<ul[\\s>]",
            label: "<ul>",
            falta: "A lista começa com <ul> e fecha com </ul>.",
          },
          {
            re: "<li[\\s>]",
            label: "<li>",
            falta: "Cada item da lista é um <li>texto</li>, dentro da <ul>.",
          },
        ],
        dicas: [
          "Estrutura: <ul> por fora, e dentro um <li> pra cada item.",
          "São 3 <li>: um pra cada corre da missão.",
        ],
        gabarito:
          "<h2>Corres da semana</h2>\n<ul>\n  <li>Estudar HTML</li>\n  <li>Treinar CSS</li>\n  <li>Dominar o JS</li>\n</ul>",
      },
    ],
  },
  {
    id: "html-forms",
    nome: "HTML: semântica e formulários",
    ponto: "Jardim Ângela",
    tag: "PONTO 02",
    desc: "Tags semânticas, formulários, inputs e acessibilidade.",
    lessons: [
      {
        t: "Semântica: div pra tudo é cilada",
        txt: "Existem tags que DIZEM o que são: <header> (topo), <nav> (menu), <main> (conteúdo principal), <section> (seção) e <footer> (rodapé). O visual é igual ao da div — mas leitor de tela, Google e outros devs entendem tua página na hora.",
        code: "<header>logo e menu</header>\n<main>\n  <section>conteúdo</section>\n</main>\n<footer>contato</footer>",
      },
      {
        t: "Formulários: a porta de entrada",
        txt: "Formulário é onde o usuário digita coisa: <form> embrulha tudo, <input> é o campo (o type muda o teclado e a validação: text, email, password, number...) e <label> dá nome ao campo.",
        code: '<form>\n  <label for="nome">Seu nome</label>\n  <input id="nome" type="text" />\n</form>',
      },
      {
        t: "label + id: a dupla da acessibilidade",
        txt: "O for do <label> aponta pro id do <input>. Com isso, clicar no texto já foca o campo — e o leitor de tela anuncia o nome certo. Atributos úteis: placeholder (dica dentro do campo) e required (obriga preencher).",
        code: '<label for="email">Seu e-mail</label>\n<input\n  id="email"\n  type="email"\n  placeholder="voce@exemplo.com"\n  required\n/>',
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Por que usar <main>, <header> e <nav> em vez de <div> pra tudo?",
        opts: [
          "Porque carregam mais rápido que a div",
          "Porque leitor de tela e buscadores entendem a estrutura da página",
          "Porque a div vai ser descontinuada",
          "Porque só elas aceitam CSS",
        ],
        correct: 1,
        explain:
          "É semântica: a tag DIZ o que ela é. Acessibilidade e SEO agradecem — e o visual você controla com CSS do mesmo jeito.",
      },
      {
        tipo: "encaixe",
        enunciado:
          "Monta o formulário acessível: label, input e botão, nessa ordem:",
        pecas: [
          "<form>",
          '  <label for="nome">Seu nome</label>',
          '  <input id="nome" type="text" />',
          '  <button type="button">Enviar</button>',
          "</form>",
        ],
        explain:
          'O <form> embrulha tudo. O for="nome" do label aponta pro id="nome" do input — é esse par que liga os dois.',
      },
      {
        tipo: "code",
        lang: "html",
        arquivo: "cadastro.html",
        enunciado: "Formulário da newsletter do corre:",
        missao:
          "um form com label escrito Seu e-mail, um input do tipo email e um botão escrito Cadastrar.",
        starter:
          "<h2>Newsletter do corre</h2>\n<!-- form: label + campo de e-mail + botao Cadastrar -->\n\n",
        esperado: ["Seu e-mail", "Cadastrar"],
        regras: [
          {
            re: "<form[\\s>]",
            label: "<form>",
            falta: "Embrulha tudo num <form> ... </form>.",
          },
          {
            re: "<label[\\s>]",
            label: "<label>",
            falta:
              "Falta o <label>Seu e-mail</label> — é ele que dá nome ao campo.",
          },
          {
            re: "type=\"email\"|type='email'",
            label: "type email",
            falta:
              'O campo é <input type="email"> — o navegador já valida o formato sozinho.',
          },
          {
            re: "<button[\\s>]",
            label: "<button>",
            falta: "Falta o <button>Cadastrar</button>.",
          },
        ],
        dicas: [
          "Ordem dentro do form: label, input, button.",
          'Capricho extra: liga o label no input com for="email" e id="email".',
        ],
        gabarito:
          '<h2>Newsletter do corre</h2>\n<form>\n  <label for="email">Seu e-mail</label>\n  <input id="email" type="email" placeholder="voce@exemplo.com" />\n  <button type="button">Cadastrar</button>\n</form>',
      },
      {
        tipo: "quiz",
        q: "Qual type de input esconde o que a pessoa digita?",
        opts: [
          'type="hidden"',
          'type="password"',
          'type="secret"',
          'type="text"',
        ],
        correct: 1,
        explain:
          'type="password" mostra bolinha no lugar das letras. O hidden é outra coisa: um campo invisível que vai junto no envio do form.',
      },
      {
        tipo: "quiz",
        q: "O que acontece quando o for do label aponta pro id do input?",
        opts: [
          "Nada, é só organização",
          "Clicar no label foca o campo, e o leitor de tela anuncia o nome certo",
          "O campo vira obrigatório",
          "O label fica em negrito automaticamente",
        ],
        correct: 1,
        explain:
          "Essa ligação é acessibilidade de verdade: área de clique maior e nome anunciado pro leitor de tela. Custa nada e muda tudo.",
      },
    ],
  },
  {
    id: "css-base",
    nome: "CSS: dando o visual",
    ponto: "Capão Redondo",
    tag: "PONTO 03",
    desc: "Seletores, cores, box model e as primeiras regras.",
    lessons: [
      {
        t: "A anatomia de uma regra CSS",
        txt: "CSS é o VISUAL. Uma regra tem: seletor (quem vai mudar), e dentro das chaves os pares propriedade: valor; — cada um fechando com ponto e vírgula. Seletores básicos: a tag (h1), a classe (.destaque) e o id (#topo).",
        code: "h1 {\n  color: #FF4D00;\n  font-size: 32px;\n}\n\n.destaque { background: yellow; }",
      },
      {
        t: "Box model: tudo é caixa",
        txt: 'TODO elemento é uma caixa com 4 camadas, de dentro pra fora: conteúdo → padding (respiro interno) → border (a moldura) → margin (distância pros vizinhos). Dominar isso resolve 80% dos "por que esse espaço tá aí?".',
        code: ".card {\n  padding: 16px;   /* respiro interno */\n  border: 2px solid black;\n  margin: 12px;    /* distancia pros vizinhos */\n}",
      },
      {
        t: "Cores e unidades",
        txt: "Cor pode ser nome (orange), hexadecimal (#FF4D00) ou rgb(255, 77, 0). Tamanho: px é fixo, % é relativo ao pai, e rem é relativo à fonte base da página (ótimo pra acessibilidade — acompanha o zoom do usuário).",
        code: "p {\n  color: #0D0D0D;\n  font-size: 1rem;  /* = 16px por padrao */\n  width: 80%;\n}",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: 'Qual seletor pega TODOS os elementos com class="destaque"?',
        opts: ["#destaque", "destaque", ".destaque", "<destaque>"],
        correct: 2,
        explain:
          "Ponto (.) é classe, cerquilha (#) é id. Classe pode repetir em vários elementos; id é único na página.",
      },
      {
        tipo: "code",
        lang: "html",
        arquivo: "index.html",
        enunciado: "Teu primeiro CSS — estiliza o título:",
        missao:
          "deixar o h1 laranja (#FF4D00) e centralizado, mexendo só dentro do bloco style.",
        starter:
          "<style>\n  h1 {\n    /* 1) pinta de #FF4D00 (propriedade de cor do texto) */\n    /* 2) centraliza o texto (propriedade de alinhamento) */\n  }\n</style>\n\n<h1>Corre estiloso</h1>",
        esperado: ["Corre estiloso"],
        regras: [
          {
            re: "color\\s*:\\s*#?\\w",
            label: "color",
            falta:
              "Dentro do h1 { }: color: #FF4D00; — sempre propriedade: valor;",
          },
          {
            re: "text-align\\s*:\\s*center",
            label: "centralizado",
            falta: "Pra centralizar texto: text-align: center;",
          },
        ],
        dicas: [
          "Cada linha de CSS: propriedade: valor; (com ; no final).",
          "As duas propriedades: color: #FF4D00; e text-align: center;",
        ],
        gabarito:
          "<style>\n  h1 {\n    color: #FF4D00;\n    text-align: center;\n  }\n</style>\n\n<h1>Corre estiloso</h1>",
      },
      {
        tipo: "quiz",
        q: "No box model, o padding é:",
        opts: [
          "A distância entre o elemento e os vizinhos",
          "O respiro INTERNO, entre o conteúdo e a borda",
          "A grossura da borda",
          "A sombra do elemento",
        ],
        correct: 1,
        explain:
          "De dentro pra fora: conteúdo → padding → border → margin. Padding é dentro da caixa; margin é fora, empurrando os vizinhos.",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a regra CSS do card — seletor de classe e box model:",
        pecas: [
          ".card {",
          "  background: white;",
          "  padding: 16px;",
          "  border: 2px solid black;",
          "}",
        ],
        explain:
          "Seletor .card (classe), abre chave, cada propriedade: valor; numa linha, e fecha a chave. Essa é a anatomia de TODA regra CSS.",
      },
      {
        tipo: "code",
        lang: "html",
        arquivo: "index.html",
        enunciado: "Botão estiloso — o combo clássico:",
        missao:
          "estilizar o botão com fundo (background), cantos arredondados (border-radius) e um respiro interno (padding).",
        starter:
          "<style>\n  button {\n    /* fundo, cantos arredondados e respiro interno */\n    border: none;\n    font-size: 16px;\n    cursor: pointer;\n  }\n</style>\n\n<button>Cola no corre</button>",
        esperado: ["Cola no corre"],
        regras: [
          {
            re: "background(-color)?\\s*:",
            label: "background",
            falta: "Dá um fundo: background: #FF4D00; (ou a cor que quiser).",
          },
          {
            re: "border-radius\\s*:",
            label: "border-radius",
            falta: "Cantos arredondados: border-radius: 8px;",
          },
          {
            re: "padding\\s*:",
            label: "padding",
            falta:
              "Respiro interno: padding: 12px 20px; (vertical e horizontal).",
          },
        ],
        dicas: [
          "Tudo dentro do button { } que já existe no style.",
          "Exemplo completo: background: #FF4D00; border-radius: 8px; padding: 12px 20px;",
        ],
        gabarito:
          "<style>\n  button {\n    background: #FF4D00;\n    border-radius: 8px;\n    padding: 12px 20px;\n    border: none;\n    font-size: 16px;\n    cursor: pointer;\n  }\n</style>\n\n<button>Cola no corre</button>",
      },
    ],
  },
  {
    id: "css-layout",
    nome: "CSS: flexbox e responsivo",
    ponto: "Campo Limpo",
    tag: "PONTO 04",
    desc: "Flexbox, grid e a página que funciona em qualquer tela.",
    lessons: [
      {
        t: "Flexbox: alinhar sem sofrimento",
        txt: "display: flex no PAI enfileira os filhos. justify-content distribui no eixo principal (horizontal, por padrão), align-items alinha no eixo cruzado, e gap dá o espacinho entre eles. O combo justify + align centraliza qualquer coisa.",
        code: ".pai {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 12px;\n}",
      },
      {
        t: "Grid: layout em duas dimensões",
        txt: "Flexbox é uma fileira (uma dimensão). Grid é tabela (duas): você define as colunas com grid-template-columns e os filhos se encaixam. 1fr = uma fração do espaço livre.",
        code: ".galeria {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  gap: 12px;\n}",
      },
      {
        t: "Responsivo: mobile first",
        txt: "Media query aplica CSS só quando a tela cumpre a condição. Mobile first é escrever o CSS base pro celular e ir MELHORANDO pra telas maiores com min-width — a maioria dos teus usuários está no busão, no celular.",
        code: "/* base: celular */\n.galeria { grid-template-columns: 1fr; }\n\n@media (min-width: 700px) {\n  .galeria { grid-template-columns: 1fr 1fr 1fr; }\n}",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Com display: flex no pai, qual combo centraliza os filhos na horizontal E na vertical?",
        opts: [
          "text-align: center + vertical-align: middle",
          "justify-content: center + align-items: center",
          "margin: auto + padding: auto",
          "center: both",
        ],
        correct: 1,
        explain:
          'justify-content cuida do eixo principal, align-items do eixo cruzado. Esse combo é o "centraliza tudo" mais usado do CSS moderno.',
      },
      {
        tipo: "code",
        lang: "html",
        arquivo: "index.html",
        enunciado: "Navbar com flexbox — os links lado a lado:",
        missao:
          "transformar a nav em flex e espalhar os links (justify-content ou gap).",
        starter:
          '<style>\n  nav {\n    /* vira flex e espalha os links */\n    background: #FFF3B0;\n    padding: 12px;\n  }\n  a { text-decoration: none; color: #0D0D0D; font-weight: bold; }\n</style>\n\n<nav>\n  <a href="#">Início</a>\n  <a href="#">Sobre</a>\n  <a href="#">Contato</a>\n</nav>',
        esperado: ["Início", "Sobre", "Contato"],
        regras: [
          {
            re: "display\\s*:\\s*flex",
            label: "display: flex",
            falta:
              "No seletor nav: display: flex; — é isso que enfileira os links.",
          },
          {
            re: "justify-content\\s*:|gap\\s*:",
            label: "espaçamento",
            falta:
              "Espalha com justify-content: space-between; (ou dá um gap: 24px;).",
          },
        ],
        dicas: [
          "As propriedades vão dentro do nav { }.",
          "display: flex; justify-content: space-between; resolve.",
        ],
        gabarito:
          '<style>\n  nav {\n    display: flex;\n    justify-content: space-between;\n    background: #FFF3B0;\n    padding: 12px;\n  }\n  a { text-decoration: none; color: #0D0D0D; font-weight: bold; }\n</style>\n\n<nav>\n  <a href="#">Início</a>\n  <a href="#">Sobre</a>\n  <a href="#">Contato</a>\n</nav>',
      },
      {
        tipo: "quiz",
        q: "O que uma @media (min-width: 700px) { ... } faz?",
        opts: [
          "Limita a página a 700px de largura",
          "Aplica aquele CSS só quando a tela tem 700px ou mais",
          "Redimensiona as imagens pra 700px",
          "Esconde a página em telas pequenas",
        ],
        correct: 1,
        explain:
          'Media query é um "se": SE a tela for maior ou igual a 700px, aplica essas regras. É a base do layout responsivo.',
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a galeria em grid com 3 colunas iguais:",
        pecas: [
          ".galeria {",
          "  display: grid;",
          "  grid-template-columns: 1fr 1fr 1fr;",
          "  gap: 12px;",
          "}",
        ],
        explain:
          "Primeiro vira grid, depois define as colunas (três frações iguais) e o gap dá o respiro entre os cards.",
      },
      {
        tipo: "quiz",
        q: '"Mobile first" significa:',
        opts: [
          "Fazer um app nativo antes do site",
          "Escrever o CSS base pro celular e melhorar pra telas maiores com min-width",
          "Esconder conteúdo no celular",
          "Testar só no iPhone",
        ],
        correct: 1,
        explain:
          "O CSS base atende a tela menor (a maioria dos acessos), e as media queries com min-width vão ADICIONANDO melhorias pra desktop.",
      },
    ],
  },
  {
    id: "js-base",
    nome: "JS: a lógica do corre",
    ponto: "Santo Amaro",
    tag: "PONTO 05",
    desc: "Variáveis, tipos, funções, condicionais e console.",
    lessons: [
      {
        t: "Variáveis: const e let",
        txt: "JavaScript é o MOVIMENTO da página. Variável guarda valor: const pra quem não vai ser reatribuído (uso padrão) e let pra quem muda. O var é dos tempos antigos — evita. Tipos básicos: string, number e boolean.",
        code: "const nome = 'Edu';    // texto (string)\nlet saldo = 150;       // numero\nconst noCorre = true;  // booleano",
      },
      {
        t: "Funções e condicionais",
        txt: "Função é um bloco reutilizável: recebe parâmetros, faz o trabalho e devolve com return. O if/else decide o caminho — e compara sempre com === (igualdade estrita, sem gambiarra de conversão).",
        code: "function podePagar(saldo, preco) {\n  if (saldo >= preco) {\n    return 'Pode pagar';\n  }\n  return 'Vai ficar devendo';\n}",
      },
      {
        t: "console.log e template strings",
        txt: "console.log imprime no console — teu melhor amigo pra depurar. Template string usa CRASE (`) e interpola valores com ${ }: bem mais limpo que somar strings com +.",
        code: "const nome = 'Edu';\nconst idade = 25;\nconsole.log(`${nome} tem ${idade} anos`);",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Diferença entre const e let:",
        opts: [
          "const é mais rápida",
          "const não pode ser REATRIBUÍDA; let pode",
          "let só funciona dentro de função",
          "São idênticas, só muda o nome",
        ],
        correct: 1,
        explain:
          'const nome = "Edu" e depois nome = "Bia"? Erro. Com let, pode. Regra prática: começa tudo com const e só troca pra let quando precisar reatribuir.',
      },
      {
        tipo: "code",
        lang: "js",
        arquivo: "script.js",
        enunciado: "Teu primeiro JavaScript — variáveis e console:",
        missao:
          'criar const nome = "Edu" e const idade = 25, e imprimir no console: Edu tem 25 anos — usando template string (crase + interpolação).',
        starter:
          '// 1) cria a const nome com o valor "Edu"\n// 2) cria a const idade com o valor 25\n// 3) imprime a frase no console usando crase e interpolacao\n\n',
        esperado: ["Edu tem 25 anos"],
        regras: [
          {
            re: "(const|let)\\s+nome",
            label: "nome",
            falta: "Cria a variável: const nome = 'Edu';",
          },
          {
            re: "(const|let)\\s+idade",
            label: "idade",
            falta: "Cria a variável: const idade = 25; (número vai sem aspas).",
          },
          {
            re: "\\$\\{",
            label: "template string",
            falta:
              "Template string: `${nome} tem ${idade} anos` — repara que é CRASE (`), não aspas.",
          },
        ],
        dicas: [
          "Cada linha termina com ; — const nome = 'Edu';",
          "A impressão: console.log(`${nome} tem ${idade} anos`);",
        ],
        gabarito:
          "const nome = 'Edu';\nconst idade = 25;\nconsole.log(`${nome} tem ${idade} anos`);",
      },
      {
        tipo: "quiz",
        q: "Qual a diferença entre == e === ?",
        opts: [
          "Nenhuma, é estilo",
          "=== compara valor E tipo, sem converter nada; == converte antes de comparar",
          "=== é só pra números",
          "== é mais moderno",
        ],
        correct: 1,
        explain:
          '"5" == 5 dá true (converte!), "5" === 5 dá false. O === é previsível — usa ele por padrão e evita sustos.',
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a função que decide se pode dirigir:",
        pecas: [
          "function podeDirigir(idade) {",
          "  if (idade >= 18) {",
          "    return 'Pode dirigir';",
          "  }",
          "  return 'Ainda não';",
          "}",
        ],
        explain:
          "Função → if com a condição → return do caso verdadeiro → fecha o if → return do caso contrário. Se o if deu return, o resto nem roda.",
      },
      {
        tipo: "code",
        lang: "js",
        arquivo: "script.js",
        enunciado: "Tua primeira função de verdade:",
        missao:
          "criar a função dobro(n) que devolve n * 2, e imprimir no console o dobro de 21 — tem que sair 42.",
        starter:
          "// 1) cria a funcao dobro, que recebe n e devolve n * 2\n// 2) imprime no console o resultado pra 21\n\n",
        esperado: ["42"],
        regras: [
          {
            re: "function\\s+dobro|const\\s+dobro",
            label: "função dobro",
            falta: "Declara: function dobro(n) { ... }",
          },
          {
            re: "return",
            label: "return",
            falta: "A função precisa DEVOLVER o resultado: return n * 2;",
          },
          {
            re: "dobro\\(21\\)",
            label: "dobro(21)",
            falta: "Chama a função com 21: console.log(dobro(21));",
          },
        ],
        dicas: [
          "A função: function dobro(n) { return n * 2; }",
          "E embaixo: console.log(dobro(21));",
        ],
        gabarito:
          "function dobro(n) {\n  return n * 2;\n}\n\nconsole.log(dobro(21));",
      },
    ],
  },
  {
    id: "js-dom",
    nome: "JS: DOM e eventos",
    ponto: "Brooklin",
    tag: "PONTO 06",
    desc: "querySelector, addEventListener e a página ganhando vida.",
    lessons: [
      {
        t: "O DOM: tua página vista pelo JS",
        txt: "O navegador transforma o HTML numa árvore de objetos: o DOM. O JS enxerga e mexe nessa árvore pelo document. Pra pegar um elemento: document.querySelector() — aceita qualquer seletor CSS (#id, .classe, tag).",
        code: "const titulo = document.querySelector('#titulo');\nconst botao = document.querySelector('.btn');",
      },
      {
        t: "Eventos: reagindo ao usuário",
        txt: "addEventListener escuta o que acontece: click, input, submit, keydown... Você passa o nome do evento e a função que roda quando ele dispara.",
        code: "botao.addEventListener('click', () => {\n  console.log('clicou!');\n});",
      },
      {
        t: "Mudando a página",
        txt: "textContent troca o TEXTO de um elemento (seguro). innerHTML interpreta HTML — cuidado com texto vindo do usuário. classList liga/desliga classes CSS: add, remove e toggle.",
        code: "titulo.textContent = 'Novo título';\ncard.classList.toggle('escuro');",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "document.querySelector('#placar') pega o quê?",
        opts: [
          "Todos os elementos da classe placar",
          'O elemento com id="placar"',
          "A tag <placar>",
          "O primeiro parágrafo da página",
        ],
        correct: 1,
        explain:
          "O querySelector usa a MESMA sintaxe dos seletores CSS: # é id, . é classe, sem nada é tag.",
      },
      {
        tipo: "code",
        lang: "js",
        arquivo: "script.js",
        enunciado: "O clássico: botão contador, agora em JS puro.",
        contexto:
          "O HTML já está na página (olha o preview). Teu trabalho é só o JavaScript.",
        missao:
          "a cada clique no botão, o placar sobe: Cliques: 0 → Cliques: 1 → Cliques: 2...",
        testa: "👆 clica no botão do preview!",
        htmlBase:
          '<p id="placar">Cliques: 0</p><button id="botao">Clica aí</button>',
        starter:
          "// 1) pega o placar e o botao (id placar / id botao)\n// 2) cria let cliques = 0\n// 3) escuta o clique do botao: soma 1 e atualiza o texto do placar\n\n",
        esperado: ["Cliques: 0", "Cliques: 1"],
        regras: [
          {
            re: "querySelector|getElementById",
            label: "pegar elemento",
            falta:
              "Pega os elementos com document.querySelector('#placar') e ('#botao').",
          },
          {
            re: "addEventListener",
            label: "escutar clique",
            falta:
              "Escuta o clique: botao.addEventListener('click', () => { ... });",
          },
          {
            re: "textContent|innerText|innerHTML",
            label: "atualizar texto",
            falta:
              "Atualiza o placar: placar.textContent = `Cliques: ${cliques}`;",
          },
        ],
        dicas: [
          "Os elementos: const placar = document.querySelector('#placar'); const botao = document.querySelector('#botao');",
          "O contador: let cliques = 0; (let, porque vai mudar!)",
          "No listener: cliques++; placar.textContent = `Cliques: ${cliques}`;",
        ],
        gabarito:
          "const placar = document.querySelector('#placar');\nconst botao = document.querySelector('#botao');\nlet cliques = 0;\n\nbotao.addEventListener('click', () => {\n  cliques++;\n  placar.textContent = `Cliques: ${cliques}`;\n});",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta o botão de modo escuro — evento + classList:",
        pecas: [
          "const botao = document.querySelector('#tema');",
          "botao.addEventListener('click', () => {",
          "  document.body.classList.toggle('escuro');",
          "});",
        ],
        explain:
          "Primeiro pega o botão, depois escuta o clique, e dentro do listener o toggle liga/desliga a classe no body. Três linhas, modo escuro pronto.",
      },
      {
        tipo: "quiz",
        q: "Diferença entre textContent e innerHTML:",
        opts: [
          "São idênticos",
          "textContent trata tudo como TEXTO puro; innerHTML interpreta as tags — perigoso com dado do usuário",
          "innerHTML é mais rápido, sempre prefira",
          "textContent só funciona em parágrafos",
        ],
        correct: 1,
        explain:
          "Se o usuário digitar <script> e você jogar no innerHTML, o navegador executa (isso é XSS). Texto vindo de gente de fora → textContent sempre.",
      },
      {
        tipo: "code",
        lang: "js",
        arquivo: "script.js",
        enunciado: "Clicou, mudou — trocando o texto da página:",
        contexto: "O HTML já está no preview. Só o JS na sua mão.",
        missao: "ao clicar no botão, o h1 muda pra: Mudou, na moral!",
        testa: "👆 clica no botão do preview!",
        htmlBase:
          '<h1 id="titulo">Sem clique ainda</h1><button id="muda">Muda o título</button>',
        starter:
          "// 1) pega o titulo (id titulo) e o botao (id muda)\n// 2) no clique, troca o texto do titulo pra: Mudou, na moral!\n\n",
        esperado: ["Sem clique ainda", "Mudou, na moral!"],
        regras: [
          {
            re: "addEventListener",
            label: "escutar clique",
            falta:
              "Escuta o clique do botão com addEventListener('click', ...).",
          },
          {
            re: "textContent|innerText|innerHTML",
            label: "trocar texto",
            falta: "Troca o texto: titulo.textContent = 'Mudou, na moral!';",
          },
        ],
        dicas: [
          "const titulo = document.querySelector('#titulo'); const botao = document.querySelector('#muda');",
          "Dentro do listener: titulo.textContent = 'Mudou, na moral!';",
        ],
        gabarito:
          "const titulo = document.querySelector('#titulo');\nconst botao = document.querySelector('#muda');\n\nbotao.addEventListener('click', () => {\n  titulo.textContent = 'Mudou, na moral!';\n});",
      },
    ],
  },
  {
    id: "js-avancado",
    nome: "JS: modo avançado",
    ponto: "Berrini",
    tag: "PONTO 07",
    desc: "map, filter, desestruturação, spread e async/await.",
    lessons: [
      {
        t: "Arrays turbinados: map, filter, reduce",
        txt: "map TRANSFORMA cada item e devolve um array novo. filter PENEIRA: só passa quem cumpre a condição. reduce REDUZ tudo a um valor só (soma, total...). Nenhum deles altera o array original.",
        code: "const precos = [10, 25, 8];\nprecos.map(p => p * 2);      // [20, 50, 16]\nprecos.filter(p => p > 9);   // [10, 25]\nprecos.reduce((t, p) => t + p, 0); // 43",
      },
      {
        t: "Desestruturação e spread",
        txt: "Desestruturar é tirar valores de dentro de objeto/array direto pra variáveis. O spread (...) espalha: serve pra copiar e juntar sem mexer no original — você já viu ele no setState do React.",
        code: "const { nome, idade } = pessoa;\nconst [primeiro] = lista;\n\nconst copia = { ...pessoa, cidade: 'SP' };",
      },
      {
        t: "Async: Promise e async/await",
        txt: "Buscar coisa na rede demora — a Promise representa esse valor futuro. Com async/await o código assíncrono fica LENDO como código normal: o await pausa ali até a resposta chegar.",
        code: "async function carrega() {\n  const res = await fetch('/api/perfil');\n  const dados = await res.json();\n  console.log(dados.nome);\n}",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Diferença entre map e filter:",
        opts: [
          "map TRANSFORMA cada item; filter PENEIRA quem passa na condição",
          "map remove itens; filter duplica",
          "São iguais, filter é mais novo",
          "filter só funciona com números",
        ],
        correct: 0,
        explain:
          "map devolve um array do MESMO tamanho com cada item transformado. filter devolve só os aprovados no teste. Os dois criam array novo.",
      },
      {
        tipo: "code",
        lang: "js",
        arquivo: "script.js",
        enunciado: "Filtra os corres que pagam bem:",
        missao:
          "do array de trampos, imprimir no console o NOME dos que pagam mais de 100 (na ordem do array).",
        starter:
          "const trampos = [\n  { nome: 'Site da lanchonete', valor: 350 },\n  { nome: 'Ajuste no blog', valor: 80 },\n  { nome: 'Loja virtual', valor: 900 },\n];\n\n// filtra valor > 100 e imprime o nome de cada um\n\n",
        esperado: ["Site da lanchonete", "Loja virtual"],
        regras: [
          {
            re: "\\.filter\\(",
            label: ".filter()",
            falta: "Peneira primeiro: trampos.filter(t => t.valor > 100)",
          },
          {
            re: "\\.forEach\\(|\\.map\\(",
            label: "percorrer",
            falta:
              "Depois percorre imprimindo: .forEach(t => console.log(t.nome));",
          },
        ],
        dicas: [
          "Dá pra encadear: trampos.filter(...).forEach(...)",
          "Completo: trampos.filter(t => t.valor > 100).forEach(t => console.log(t.nome));",
        ],
        gabarito:
          "const trampos = [\n  { nome: 'Site da lanchonete', valor: 350 },\n  { nome: 'Ajuste no blog', valor: 80 },\n  { nome: 'Loja virtual', valor: 900 },\n];\n\ntrampos\n  .filter(t => t.valor > 100)\n  .forEach(t => console.log(t.nome));",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a função async que busca o perfil na API:",
        pecas: [
          "async function carregaPerfil() {",
          "  const resposta = await fetch('/api/perfil');",
          "  const dados = await resposta.json();",
          "  console.log(dados.nome);",
          "}",
        ],
        explain:
          "async na função libera o await dentro. Primeiro espera a resposta chegar, depois espera o JSON ser lido, e aí usa o dado. Cada await é uma pausa.",
      },
      {
        tipo: "quiz",
        q: "Uma Promise é:",
        opts: [
          "Um tipo de loop",
          "Um valor FUTURO: algo que ainda não chegou, mas vai chegar (ou falhar)",
          "Uma variável global",
          "Um erro do JavaScript",
        ],
        correct: 1,
        explain:
          "Ela representa uma operação em andamento (tipo um fetch). Quando resolve, o .then (ou o await) recebe o valor; quando falha, cai no catch.",
      },
      {
        tipo: "code",
        lang: "js",
        arquivo: "script.js",
        enunciado: "Desestruturação — abrindo o objeto:",
        contexto:
          'O objeto pessoa já existe (veio "da API"). Não precisa criar ele.',
        missao:
          "desestruturar nome e idade de dentro de pessoa e imprimir: Edu tem 25 anos",
        preambulo:
          "const pessoa = { nome: 'Edu', idade: 25, quebrada: 'extremo sul' };",
        starter:
          "// 1) tira nome e idade de dentro de pessoa (desestruturacao)\n// 2) imprime a frase no console com template string\n\n",
        esperado: ["Edu tem 25 anos"],
        regras: [
          {
            re: "(const|let)\\s*\\{",
            label: "desestruturação",
            falta: "Desestrutura assim: const { nome, idade } = pessoa;",
          },
          {
            re: "\\$\\{",
            label: "template string",
            falta: "Monta a frase com crase: `${nome} tem ${idade} anos`",
          },
        ],
        dicas: [
          "const { nome, idade } = pessoa; — as chaves puxam as propriedades pelo nome.",
          "console.log(`${nome} tem ${idade} anos`);",
        ],
        gabarito:
          "const { nome, idade } = pessoa;\nconsole.log(`${nome} tem ${idade} anos`);",
      },
    ],
  },
  {
    id: "ts-mini",
    nome: "TypeScript: o mini corre",
    ponto: "Faria Lima",
    tag: "PONTO FINAL",
    desc: "Tipos, interfaces e funções tipadas — a base do TS.",
    lessons: [
      {
        t: "Por que TypeScript?",
        txt: "TypeScript é o JavaScript + TIPOS: tudo que você sabe de JS vale. O TS confere os tipos ANTES de rodar e pega erro bobo na hora de escrever (não na produção). No final ele compila pra JS puro — é JS que vai pro navegador.",
        code: "let saldo: number = 150;\nsaldo = 'muito';\n// Erro: Type 'string' is not\n// assignable to type 'number'",
      },
      {
        t: "Tipos básicos: a anotação",
        txt: "A anotação vai depois do nome, com dois pontos: string, number, boolean, e arrays com tipo[]. Na maioria das vezes o TS INFERE sozinho pelo valor — mas saber anotar é a base.",
        code: "const nome: string = 'Edu';\nconst idade: number = 25;\nconst ativo: boolean = true;\nconst notas: number[] = [8, 9, 10];",
      },
      {
        t: "Interface e função tipada",
        txt: "interface descreve a CARA de um objeto: quais propriedades e de que tipo. Em função, você tipa os parâmetros e o retorno — quem chamar errado é avisado na hora. O ? marca propriedade opcional.",
        code: "interface Produto {\n  nome: string;\n  preco: number;\n  desconto?: number; // opcional\n}\n\nfunction total(p: Produto): number {\n  return p.preco - (p.desconto || 0);\n}",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "O que é TypeScript?",
        opts: [
          "Uma linguagem que substitui o JavaScript no navegador",
          "Um superset do JS: adiciona tipos e compila pra JavaScript puro",
          "Um framework tipo React",
          "Um banco de dados tipado",
        ],
        correct: 1,
        explain:
          "Todo JS válido é TS válido. O TS adiciona a camada de tipos, confere tudo em tempo de escrita, e no build vira JS normal.",
      },
      {
        tipo: "code",
        lang: "ts",
        arquivo: "main.ts",
        enunciado: "Primeiras variáveis TIPADAS:",
        contexto:
          "TypeScript rodando de verdade: os tipos são conferidos e depois removidos na compilação — o que executa no navegador é JS puro.",
        missao:
          "declarar nome (com anotação : string) e idade (com anotação : number), e imprimir: Edu tem 25 anos",
        starter:
          '// 1) const nome com anotacao de tipo texto, valendo "Edu"\n// 2) const idade com anotacao de tipo numero, valendo 25\n// 3) console.log da frase com template string\n\n',
        esperado: ["Edu tem 25 anos"],
        regras: [
          {
            re: ":\\s*string",
            label: ": string",
            falta: "A anotação vai depois do nome: const nome: string = 'Edu';",
          },
          {
            re: ":\\s*number",
            label: ": number",
            falta: "Idade é número: const idade: number = 25;",
          },
          {
            re: "\\$\\{",
            label: "template string",
            falta: "A frase: `${nome} tem ${idade} anos` — com crase.",
          },
        ],
        dicas: [
          "Formato: const variavel: tipo = valor;",
          "Completo: const nome: string = 'Edu'; const idade: number = 25;",
        ],
        gabarito:
          "const nome: string = 'Edu';\nconst idade: number = 25;\nconsole.log(`${nome} tem ${idade} anos`);",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a interface Produto — o contrato do objeto:",
        pecas: [
          "interface Produto {",
          "  nome: string;",
          "  preco: number;",
          "  emEstoque: boolean;",
          "}",
        ],
        explain:
          "interface + nome + chaves, e dentro cada propriedade com seu tipo. Qualquer objeto que se diga Produto vai ter que ter essa cara.",
      },
      {
        tipo: "code",
        lang: "ts",
        arquivo: "main.ts",
        enunciado: "Função tipada de ponta a ponta:",
        missao:
          "criar precoComDesconto com os DOIS parâmetros tipados como number e o RETORNO tipado como number, devolvendo preco - desconto. Imprime o resultado pra 120 com desconto 30 — sai 90.",
        starter:
          "// 1) function precoComDesconto(preco, desconto) - tipa os dois parametros e o retorno\n// 2) devolve preco menos desconto\n// 3) imprime no console o resultado pra 120 e 30\n\n",
        esperado: ["90"],
        regras: [
          {
            re: "preco\\s*:\\s*number",
            label: "parâmetro tipado",
            falta: "Tipa o parâmetro: (preco: number, desconto: number)",
          },
          {
            re: "\\)\\s*:\\s*number",
            label: "retorno tipado",
            falta:
              "O tipo do retorno vai DEPOIS dos parênteses: function f(...): number { ... }",
          },
          {
            re: "return",
            label: "return",
            falta: "Devolve a conta: return preco - desconto;",
          },
        ],
        dicas: [
          "Assinatura completa: function precoComDesconto(preco: number, desconto: number): number",
          "E embaixo: console.log(precoComDesconto(120, 30));",
        ],
        gabarito:
          "function precoComDesconto(preco: number, desconto: number): number {\n  return preco - desconto;\n}\n\nconsole.log(precoComDesconto(120, 30));",
      },
      {
        tipo: "quiz",
        q: "O que acontece com os tipos quando o TypeScript compila?",
        opts: [
          "Vão junto e o navegador confere em tempo real",
          "São REMOVIDOS: o que roda é JavaScript puro — os tipos só existem em tempo de desenvolvimento",
          "Viram comentários no código final",
          "São enviados pro servidor validar",
        ],
        correct: 1,
        explain:
          "Os tipos são a rede de segurança de quem ESCREVE o código. Na compilação eles somem — o navegador só conhece JavaScript.",
      },
    ],
  },
];

/* ---------- AS LINHAS (cursos disponíveis) ---------- */

const CURSOS = [
  {
    id: "web",
    rota: "LINHA 6X-SUL · SENTIDO WEB",
    titulo: "HTML + CSS + JS",
    sub: "do básico ao avançado · + TypeScript",
    desc: "A base da web inteira, do zero: HTML, CSS e JavaScript até o modo avançado — e um mini módulo de TypeScript de bônus no ponto final.",
    finalTxt:
      "HTML, CSS, JS e até TypeScript no currículo. Agora é abrir o VS Code e construir teus próprios sites. 🚀",
    modules: MODULES_WEB,
  },
  {
    id: "fullstack",
    rota: "LINHA 5X-SUL · SENTIDO FULLSTACK",
    titulo: "React + Java",
    sub: "do zero ao deploy fullstack",
    desc: "React no front, Java + Spring no back. Sete pontos do Terminal Varginha até a Faria Lima, terminando com front e back conversando.",
    finalTxt:
      "Agora é abrir o VS Code e o IntelliJ e construir o app de verdade. 🚀",
    modules: MODULES_FULLSTACK,
  },
];
