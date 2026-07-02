import React, { useState, useEffect, useRef } from 'react';

/* =====================================================================
   DEV DO CORRE v2 — do extremo sul até a Faria Lima
   Agora com 3 tipos de desafio:
   · QUIZ     — múltipla escolha
   · ENCAIXE  — quebra-cabeça: monta o código peça por peça
   · CÓDIGO   — digita de verdade, roda, vê na tela, com lint gente boa
   React roda AO VIVO num sandbox. Java é validado com lint amigável
   (a saída é simulada — Java precisa da JVM, não roda no navegador).
   ===================================================================== */

const STORAGE_KEY = 'dev_do_corre_v1';

const LEVELS = [
  { min: 0, nome: 'Estagiário do Corre' },
  { min: 160, nome: 'Jr. da Quebrada' },
  { min: 320, nome: 'Pleno de Respeito' },
  { min: 500, nome: 'Sênior Brabo' },
  { min: 700, nome: 'Tech Lead do Extremo Sul' },
];

function getLevel(xp) {
  let atual = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) atual = l;
  const idx = LEVELS.indexOf(atual);
  const prox = LEVELS[idx + 1] || null;
  return { ...atual, prox };
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
  const pares = { ')': '(', '}': '{', ']': '[' };
  const abre = { '(': ')', '{': '}', '[': ']' };
  const nomes = { '(': 'parêntese', '{': 'chave', '[': 'colchete' };
  const stack = [];
  let linha = 1;
  let emString = null;

  for (let i = 0; i < codigo.length; i++) {
    const c = codigo[i];
    if (c === '\n') {
      if (emString && emString.ch !== '`') {
        avisos.push({
          nivel: 'erro',
          msg: 'Linha ' + emString.linha + ': abriu uma string com ' + emString.ch + ' e pulou de linha sem fechar. Fecha as aspas antes do fim da linha.',
        });
        emString = null;
      }
      linha++;
      continue;
    }
    if (emString) {
      if (c === '\\') { i++; continue; }
      if (c === emString.ch) emString = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { emString = { ch: c, linha }; continue; }
    if (c === '/' && codigo[i + 1] === '/') {
      while (i < codigo.length && codigo[i] !== '\n') i++;
      i--;
      continue;
    }
    if (c === '/' && codigo[i + 1] === '*') {
      i += 2;
      while (i < codigo.length - 1 && !(codigo[i] === '*' && codigo[i + 1] === '/')) {
        if (codigo[i] === '\n') linha++;
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
          nivel: 'erro',
          msg: 'Linha ' + linha + ': tem um ' + c + ' sobrando (ou fora de ordem). Confere se ele tem um par aberto antes.',
        });
      }
    }
  }
  if (emString) {
    avisos.push({ nivel: 'erro', msg: 'Linha ' + emString.linha + ': string aberta que nunca fecha.' });
  }
  for (const s of stack) {
    avisos.push({
      nivel: 'erro',
      msg: 'Linha ' + s.linha + ': o ' + nomes[s.c] + ' ' + s.c + ' abriu e nunca fechou. Todo ' + s.c + ' precisa do seu par ' + abre[s.c] + '.',
    });
  }
  return avisos;
}

// Erros clássicos de quem tá começando no Java, explicados na boa.
function lintJava(codigo) {
  const avisos = [];
  const linhas = codigo.split('\n');
  linhas.forEach((l, idx) => {
    const n = idx + 1;
    const t = l.trim();
    if (!t || t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) return;

    if (/\bsystem\.out/.test(l)) {
      avisos.push({ nivel: 'erro', msg: 'Linha ' + n + ': Java diferencia maiúscula de minúscula — é System, com S maiúsculo.' });
    }
    if (/System\.out\.(printLn|Println|PrintLn|PRINTLN)/.test(l)) {
      avisos.push({ nivel: 'erro', msg: 'Linha ' + n + ': o método é println, tudo minúsculo (print line).' });
    }
    if (/\bstring\s+\w/.test(l)) {
      avisos.push({ nivel: 'erro', msg: 'Linha ' + n + ': String é uma classe, então começa com S maiúsculo.' });
    }
    if (/\b(Int|INT)\s+\w+\s*=/.test(l)) {
      avisos.push({ nivel: 'erro', msg: 'Linha ' + n + ': o tipo é int, minúsculo — os primitivos são todos minúsculos.' });
    }
    if (/String\s+\w+\s*=\s*'[^']*'/.test(l)) {
      avisos.push({ nivel: 'erro', msg: 'Linha ' + n + ': String usa aspas DUPLAS " ". Aspas simples em Java é só pra char (um caractere só).' });
    }

    // heurística do ponto e vírgula — aviso suave, sem bloquear
    const terminaOk = /[;{},]$/.test(t) || /\)\s*\{$/.test(t);
    const ehEstrutura = /^(public|private|protected|static|class|interface|if|else|for|while|do|switch|case|default|try|catch|finally|@|package|import|return$)/.test(t);
    const pareceComando = /(System\.out|=|\+\+|--|return\s+\S|^\w+\.\w+\(|^\w+\()/.test(t) && !/^(if|for|while|switch|catch)\b/.test(t);
    if (!terminaOk && !ehEstrutura && pareceComando) {
      avisos.push({ nivel: 'aviso', msg: 'Linha ' + n + ': essa linha parece um comando — em Java, comando termina com ; (ponto e vírgula).' });
    }
  });
  return avisos;
}

// Deslizes clássicos de JSX.
function lintJSX(codigo) {
  const avisos = [];
  const linhas = codigo.split('\n');
  linhas.forEach((l, idx) => {
    const n = idx + 1;
    if (/<\w[^>]*\bclass=/.test(l)) {
      avisos.push({ nivel: 'erro', msg: 'Linha ' + n + ': no JSX é className, não class (class é palavra reservada do JavaScript).' });
    }
    if (/\bonclick=/.test(l)) {
      avisos.push({ nivel: 'erro', msg: 'Linha ' + n + ': eventos no React são camelCase — onClick, com C maiúsculo.' });
    }
    if (/\bonchange=/.test(l)) {
      avisos.push({ nivel: 'erro', msg: 'Linha ' + n + ': é onChange, com C maiúsculo.' });
    }
    if (/\buseState\s*\(/.test(l) && /^(var|let)\s+\w+\s*=\s*useState/.test(l.trim())) {
      avisos.push({ nivel: 'aviso', msg: 'Linha ' + n + ': o useState devolve um ARRAY — o costume é desestruturar: const [valor, setValor] = useState(...).' });
    }
  });
  return avisos;
}

// Traduz o "erro de IDE" pro português do dia a dia.
function traduzErro(msg) {
  msg = String(msg || '');
  let m;
  if (msg === 'SEM_APP') {
    return 'Não achei um componente chamado App. O desafio precisa de um function App() { ... } — é ele que o jogo renderiza na tela.';
  }
  if ((m = msg.match(/ReferenceError:?\s*(\w+) is not defined/)) || (m = msg.match(/(\w+) is not defined/))) {
    return 'Você usou "' + m[1] + '", mas essa variável/função não existe (ainda). Ou faltou criar, ou o nome tá escrito diferente — e maiúscula/minúscula conta!';
  }
  if ((m = msg.match(/([\w.$]+) is not a function/))) {
    return '"' + m[1] + '" não é uma função. Confere se o nome tá certo — ou se essa variável tá guardando outra coisa sem você perceber.';
  }
  if (/Adjacent JSX elements/i.test(msg)) {
    return 'O return do JSX só aceita UM elemento pai. Embrulha tudo numa <div> ... </div> (ou num fragmento <> ... </>).';
  }
  if ((m = msg.match(/Expected corresponding JSX closing tag for <(\w+)>/))) {
    return 'A tag <' + m[1] + '> abriu e não fechou. Toda tag JSX fecha: </' + m[1] + '> — ou se ela é vazia, auto-fecha com />.';
  }
  if (/Unterminated string/i.test(msg)) {
    return 'Tem uma string (texto entre aspas) que abriu e não fechou em algum canto.';
  }
  if ((m = msg.match(/Unexpected token[^(]*\((\d+):\d+\)/))) {
    return 'O código tropeçou em algo inesperado perto da linha ' + m[1] + ' do seu código. Normalmente é chave/parêntese fora do lugar, vírgula sobrando, ou algo que não fechou na linha de cima.';
  }
  if (/Unexpected token/i.test(msg)) {
    return 'Tem um caractere fora do lugar — geralmente chave, parêntese ou vírgula. Olha com carinho o começo e o fim de cada linha.';
  }
  if (/Cannot read propert/i.test(msg)) {
    return 'Você tentou acessar algo dentro de um valor que tá undefined ou null. Confere se a variável foi preenchida ANTES de usar.';
  }
  if (/Maximum update depth|Too many re-renders/i.test(msg)) {
    return 'Loop infinito de renderização! Provavelmente você tá chamando a função set direto no corpo do componente (ou num useEffect sem array de dependências).';
  }
  return 'O erro cru foi: "' + msg + '". Lê com calma — geralmente ele mesmo entrega a pista. Se travar, pede uma dica aí embaixo. 💛';
}

/* ---------- SANDBOX: React rodando de verdade num iframe ---------- */

function escapaScript(s) {
  return String(s).replace(/<\/script/gi, '<\\/script');
}

function montaSrcDoc(codigo, preambulo) {
  const user = escapaScript((preambulo ? preambulo + '\n\n' : '') + codigo);
  return [
    '<!DOCTYPE html><html><head><meta charset="utf-8"/>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.development.js"></' + 'script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.development.js"></' + 'script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></' + 'script>',
    '<style>',
    'body{font-family:system-ui,-apple-system,sans-serif;background:#ffffff;color:#17171c;padding:14px;margin:0;font-size:15px}',
    'button{font-size:15px;padding:8px 14px;border-radius:8px;border:2px solid #17171c;background:#ffd23f;cursor:pointer;font-weight:700}',
    'button:active{transform:translateY(1px)}',
    'input{font-size:15px;padding:8px 10px;border-radius:8px;border:2px solid #9a98ac}',
    'ul{padding-left:22px} li{margin:4px 0} h1,h2{margin:6px 0}',
    '</style></head><body><div id="root"></div>',
    '<script>',
    'window.onerror=function(m){parent.postMessage({ddc:1,tipo:"erro",msg:String(m)},"*");return true;};',
    'var _log=console.log;',
    'console.log=function(){var a=Array.prototype.slice.call(arguments).map(function(x){try{return typeof x==="object"?JSON.stringify(x):String(x)}catch(e){return String(x)}});parent.postMessage({ddc:1,tipo:"log",texto:a.join(" ")},"*");_log.apply(console,arguments);};',
    'window.addEventListener("load",function(){',
    '  var root=document.getElementById("root");',
    '  function manda(){parent.postMessage({ddc:1,tipo:"tela",texto:root.innerText||""},"*");}',
    '  try{new MutationObserver(function(){setTimeout(manda,60);}).observe(root,{childList:true,subtree:true,characterData:true});}catch(e){}',
    '  setTimeout(manda,400);setTimeout(manda,1200);setTimeout(manda,2500);',
    '});',
    '</' + 'script>',
    '<script type="text/babel" data-presets="react">',
    'const { useState, useEffect, useMemo, useCallback, useRef, useContext, createContext } = React;',
    user,
    ';(function(){',
    '  try{',
    '    if(typeof App==="undefined"){parent.postMessage({ddc:1,tipo:"erro",msg:"SEM_APP"},"*");return;}',
    '    ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));',
    '  }catch(e){parent.postMessage({ddc:1,tipo:"erro",msg:String((e&&e.message)||e)},"*");}',
    '})();',
    '</' + 'script></body></html>',
  ].join('\n');
}

/* ============================ ESTILO ============================ */

const CSS = String.raw`
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');

.ddc {
  --ink: #14141d;
  --asfalto: #1e1e2a;
  --asfalto-2: #262635;
  --linha: #34344a;
  --amarelo: #ffd23f;
  --rosa: #ff4d8d;
  --verde: #3ddc84;
  --vermelho: #ff5c5c;
  --papel: #f2f0e9;
  --cinza: #9a98ac;

  min-height: 100vh;
  background:
    radial-gradient(1200px 500px at 80% -10%, rgba(255, 77, 141, 0.08), transparent 60%),
    radial-gradient(900px 500px at 10% 110%, rgba(255, 210, 63, 0.06), transparent 60%),
    var(--ink);
  color: var(--papel);
  font-family: 'Space Grotesk', system-ui, sans-serif;
  display: flex;
  justify-content: center;
  padding: 20px 14px 48px;
  box-sizing: border-box;
}
.ddc *, .ddc *::before, .ddc *::after { box-sizing: border-box; }
.ddc-shell { width: 100%; max-width: 560px; }

/* ---------- letreiro de busão (assinatura) ---------- */
.letreiro {
  position: relative;
  background: #0b0b11;
  border: 3px solid #000;
  border-radius: 10px;
  padding: 18px 16px 14px;
  overflow: hidden;
  box-shadow: 0 6px 0 #000;
}
.letreiro::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, transparent 34%, #0b0b11 38%);
  background-size: 5px 5px;
  pointer-events: none;
}
.letreiro-rota {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 3px;
  color: var(--rosa); margin: 0 0 6px; text-transform: uppercase;
}
.letreiro-dest {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(30px, 9vw, 46px);
  line-height: 0.95; color: var(--amarelo); margin: 0;
  text-transform: uppercase; letter-spacing: 1px; white-space: pre-line;
}
.letreiro-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 2px; color: var(--papel);
  opacity: 0.75; margin: 8px 0 0; text-transform: uppercase;
}
.letreiro--mini { padding: 10px 14px 8px; }
.letreiro--mini .letreiro-dest { font-size: 18px; letter-spacing: 0.5px; }

/* ---------- botões ---------- */
.btn {
  font-family: 'Archivo Black', sans-serif;
  text-transform: uppercase; letter-spacing: 1px; font-size: 15px;
  border: 3px solid #000; border-radius: 10px;
  padding: 14px 18px; cursor: pointer; width: 100%;
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}
.btn:focus-visible { outline: 3px solid var(--rosa); outline-offset: 3px; }
.btn-amarelo { background: var(--amarelo); color: #14141d; box-shadow: 0 5px 0 #000; }
.btn-rosa { background: var(--rosa); color: #14141d; box-shadow: 0 5px 0 #000; }
.btn-verde { background: var(--verde); color: #14141d; box-shadow: 0 5px 0 #000; }
.btn-fantasma {
  background: transparent; color: var(--papel);
  border-color: var(--linha); box-shadow: none;
  font-family: 'Space Grotesk', sans-serif; font-weight: 700;
  font-size: 13px; padding: 10px 14px; text-transform: none; letter-spacing: 0;
}
.btn:not(:disabled):active { transform: translateY(4px); box-shadow: 0 1px 0 #000; }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.toolbar { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.toolbar .btn { width: auto; flex: 1; min-width: 120px; font-size: 13px; padding: 11px 12px; }

/* ---------- barra de XP ---------- */
.xp-wrap { background: var(--asfalto); border: 2px solid var(--linha); border-radius: 10px; padding: 10px 12px; margin: 14px 0; }
.xp-top {
  display: flex; justify-content: space-between; align-items: baseline;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;
}
.xp-nivel { color: var(--amarelo); font-weight: 700; }
.xp-pts { color: var(--cinza); }
.xp-bar { height: 10px; background: #0b0b11; border-radius: 6px; overflow: hidden; border: 1px solid #000; }
.xp-fill {
  height: 100%;
  background: repeating-linear-gradient(45deg, var(--amarelo), var(--amarelo) 8px, #e5b414 8px, #e5b414 16px);
  transition: width 0.5s ease;
}

/* ---------- trilha (linha de busão) ---------- */
.trilha { position: relative; margin-top: 8px; padding-left: 34px; }
.trilha::before {
  content: ''; position: absolute; left: 13px; top: 10px; bottom: 24px;
  width: 0; border-left: 4px dashed var(--amarelo); opacity: 0.55;
}
.parada { position: relative; margin-bottom: 14px; }
.parada-dot {
  position: absolute; left: -34px; top: 16px;
  width: 30px; height: 30px; border-radius: 50%;
  border: 3px solid #000; display: flex; align-items: center; justify-content: center;
  font-family: 'Archivo Black', sans-serif; font-size: 13px;
  background: var(--asfalto-2); color: var(--cinza); z-index: 1;
}
.parada-dot--feito { background: var(--verde); color: #14141d; }
.parada-dot--atual { background: var(--amarelo); color: #14141d; animation: pulsa 1.6s ease-in-out infinite; }
@keyframes pulsa {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 210, 63, 0.5); }
  50% { box-shadow: 0 0 0 9px rgba(255, 210, 63, 0); }
}
.parada-card {
  width: 100%; text-align: left;
  background: var(--asfalto); border: 2px solid var(--linha); border-radius: 12px;
  padding: 14px; color: var(--papel); cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  transition: transform 0.08s ease, border-color 0.15s ease;
}
.parada-card:not(:disabled):hover { border-color: var(--amarelo); transform: translateX(3px); }
.parada-card:focus-visible { outline: 3px solid var(--rosa); outline-offset: 2px; }
.parada-card:disabled { opacity: 0.5; cursor: not-allowed; }
.parada-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 2px; color: var(--rosa); text-transform: uppercase;
  display: flex; justify-content: space-between; gap: 8px;
}
.parada-nome { font-family: 'Archivo Black', sans-serif; font-size: 16px; margin: 5px 0 2px; text-transform: uppercase; }
.parada-local { font-size: 12px; color: var(--amarelo); font-weight: 700; margin-bottom: 4px; }
.parada-desc { font-size: 13px; color: var(--cinza); margin: 0; line-height: 1.4; }
.parada-score { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--verde); font-weight: 700; }

/* ---------- cartões ---------- */
.card { background: var(--asfalto); border: 2px solid var(--linha); border-radius: 12px; padding: 18px 16px; margin: 14px 0; }
.card-titulo {
  font-family: 'Archivo Black', sans-serif; font-size: 19px;
  margin: 0 0 10px; text-transform: uppercase; color: var(--amarelo); line-height: 1.15;
}
.card-txt { font-size: 15px; line-height: 1.6; margin: 0; color: var(--papel); }

.code {
  display: block; background: #0b0b11;
  border: 2px solid #000; border-left: 5px solid var(--rosa);
  border-radius: 8px; padding: 12px 14px; margin-top: 12px;
  font-family: 'JetBrains Mono', monospace; font-size: 12.5px; line-height: 1.6;
  color: #d8f7c2; white-space: pre-wrap; word-break: break-word;
}

.pager {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  letter-spacing: 2px; color: var(--cinza); text-transform: uppercase;
  text-align: center; margin: 10px 0 4px;
}

/* ---------- desafios ---------- */
.quiz-topo {
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  letter-spacing: 1.5px; text-transform: uppercase; color: var(--cinza);
  margin: 14px 2px 8px;
}
.quiz-streak { color: var(--rosa); font-weight: 700; }
.tipo-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 1.5px;
  border: 1.5px solid var(--rosa); color: var(--rosa);
  border-radius: 5px; padding: 2px 7px; text-transform: uppercase;
}
.quiz-q { font-family: 'Archivo Black', sans-serif; font-size: 18px; line-height: 1.3; margin: 0 0 6px; }
.enunciado { font-size: 14.5px; line-height: 1.55; color: var(--papel); margin: 6px 0 0; }

.missao {
  background: rgba(255, 210, 63, 0.07);
  border: 2px dashed var(--amarelo); border-radius: 10px;
  padding: 10px 12px; font-size: 13.5px; margin-top: 12px;
  color: var(--papel); line-height: 1.5;
}
.missao b { color: var(--amarelo); }
.alvos { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.alvo {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  border: 1.5px solid var(--linha); border-radius: 6px;
  padding: 3px 8px; color: var(--cinza); background: #0b0b11;
}
.alvo--ok { border-color: var(--verde); color: var(--verde); }
.alvo--ok::before { content: '✓ '; }

.opts { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
.opt {
  text-align: left; background: var(--asfalto-2);
  border: 2px solid var(--linha); border-radius: 10px;
  padding: 13px 14px; color: var(--papel);
  font-family: 'Space Grotesk', sans-serif; font-size: 14.5px; font-weight: 500;
  cursor: pointer; display: flex; gap: 10px; align-items: flex-start;
  transition: border-color 0.12s ease, transform 0.08s ease;
}
.opt:not(:disabled):hover { border-color: var(--amarelo); }
.opt:not(:disabled):active { transform: scale(0.99); }
.opt:focus-visible { outline: 3px solid var(--rosa); outline-offset: 2px; }
.opt:disabled { cursor: default; }
.opt-letra {
  font-family: 'Archivo Black', sans-serif; font-size: 12px;
  background: #0b0b11; border: 2px solid var(--linha); border-radius: 6px;
  min-width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.opt--certa { border-color: var(--verde); background: rgba(61, 220, 132, 0.12); }
.opt--certa .opt-letra { border-color: var(--verde); color: var(--verde); }
.opt--errada { border-color: var(--vermelho); background: rgba(255, 92, 92, 0.12); }
.opt--errada .opt-letra { border-color: var(--vermelho); color: var(--vermelho); }
.opt--apagada { opacity: 0.45; }

.feedback { border-radius: 12px; border: 2px solid; padding: 14px; margin-top: 14px; animation: sobe 0.25s ease; }
@keyframes sobe { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.feedback--ok { border-color: var(--verde); background: rgba(61, 220, 132, 0.08); }
.feedback--ruim { border-color: var(--vermelho); background: rgba(255, 92, 92, 0.08); }
.feedback-titulo { font-family: 'Archivo Black', sans-serif; font-size: 15px; text-transform: uppercase; margin: 0 0 6px; }
.feedback--ok .feedback-titulo { color: var(--verde); }
.feedback--ruim .feedback-titulo { color: var(--vermelho); }
.feedback-txt { font-size: 14px; line-height: 1.55; margin: 0; color: var(--papel); }

/* ---------- editor de código ---------- */
.editor { border: 2px solid #000; border-radius: 10px; overflow: hidden; background: #0b0b11; margin-top: 12px; }
.editor-topo {
  display: flex; align-items: center; gap: 6px;
  background: #15151d; padding: 8px 10px; border-bottom: 2px solid #000;
}
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.d1 { background: #ff5c5c; } .d2 { background: #ffd23f; } .d3 { background: #3ddc84; }
.editor-arquivo {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  color: var(--cinza); margin-left: 6px; letter-spacing: 1px;
}
.editor-corpo { display: flex; align-items: stretch; }
.editor-nums {
  margin: 0; padding: 12px 8px; font-family: 'JetBrains Mono', monospace;
  font-size: 13px; line-height: 1.55; color: #4a4a5e; text-align: right;
  user-select: none; background: #0b0b11; border-right: 1px solid #22222e;
  min-width: 36px; overflow: hidden;
}
.editor-ta {
  flex: 1; background: transparent; border: 0; color: #e8f7d8;
  font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.55;
  padding: 12px; min-height: 230px; resize: vertical; outline: none;
  white-space: pre; overflow: auto; tab-size: 2; caret-color: var(--amarelo);
}
.editor-ta:focus { box-shadow: inset 0 0 0 2px var(--rosa); border-radius: 0 0 8px 0; }

/* ---------- painéis (preview / terminal / lint) ---------- */
.painel { border: 2px solid var(--linha); border-radius: 10px; margin-top: 12px; overflow: hidden; background: var(--asfalto); }
.painel-titulo {
  font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 2px;
  text-transform: uppercase; padding: 7px 10px;
  background: var(--asfalto-2); color: var(--cinza);
  border-bottom: 2px solid var(--linha);
  display: flex; justify-content: space-between; gap: 8px; align-items: center;
}
.preview-frame { width: 100%; height: 260px; border: 0; background: #fff; display: block; }
.terminal {
  background: #050507; font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px; color: var(--verde); padding: 12px;
  min-height: 44px; white-space: pre-wrap; word-break: break-word; margin: 0;
}
.terminal-log { color: #e8f7d8; }
.terminal-prefixo { color: var(--rosa); }
.lint-item {
  display: flex; gap: 8px; padding: 10px 12px;
  font-size: 13.5px; line-height: 1.5;
  border-bottom: 1px dashed var(--linha); align-items: flex-start;
}
.lint-item:last-child { border-bottom: 0; }
.lint-erro { color: #ffb1b1; }
.lint-aviso { color: #ffd9a8; }
.lint-dica { color: #ffe9a8; }
.lint-emoji { flex-shrink: 0; }

.banner-ok {
  border: 2px solid var(--verde); background: rgba(61, 220, 132, 0.1);
  border-radius: 10px; padding: 13px; margin-top: 12px;
  font-family: 'Archivo Black', sans-serif; color: var(--verde);
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
  min-height: 56px; border: 2px dashed var(--amarelo); border-radius: 10px;
  padding: 8px; display: flex; flex-direction: column; gap: 6px;
  background: rgba(255, 210, 63, 0.04);
}
.encaixe-banco { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.peca {
  text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 12.5px;
  background: #0b0b11; border: 2px solid var(--linha); color: #e8f7d8;
  border-radius: 8px; padding: 10px 12px; cursor: pointer;
  white-space: pre; overflow-x: auto; width: 100%;
  transition: border-color 0.1s ease, transform 0.08s ease;
}
.peca:hover { border-color: var(--rosa); }
.peca:active { transform: scale(0.99); }
.peca:focus-visible { outline: 3px solid var(--rosa); outline-offset: 2px; }
.peca--monte { border-color: #4a4a66; background: #101018; }
.encaixe-vazio { color: var(--cinza); font-size: 12.5px; text-align: center; padding: 8px; }

/* ---------- resultado ---------- */
.placar { font-family: 'Archivo Black', sans-serif; font-size: 56px; text-align: center; color: var(--amarelo); margin: 8px 0 0; }
.placar-sub {
  text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px;
  letter-spacing: 2px; color: var(--cinza); text-transform: uppercase; margin: 4px 0 0;
}
.trofeu { font-size: 64px; text-align: center; margin: 10px 0 0; }
.stack { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }

.footer-note { text-align: center; font-size: 12px; color: var(--cinza); margin-top: 22px; line-height: 1.5; }
.link-reset {
  background: none; border: none; color: var(--rosa);
  font-family: inherit; font-size: 12px; cursor: pointer;
  text-decoration: underline; padding: 2px 4px;
}
.link-reset:focus-visible { outline: 2px solid var(--rosa); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .ddc *, .ddc *::before, .ddc *::after { animation: none !important; transition: none !important; }
}
`;

/* ============================ STORAGE ============================ */

const temStorage = () => typeof window !== 'undefined' && window.storage;

async function carregarProgresso() {
  if (!temStorage()) return null;
  try {
    const r = await window.storage.get(STORAGE_KEY);
    return r && r.value ? JSON.parse(r.value) : null;
  } catch (e) {
    return null; // chave ainda não existe, segue o baile
  }
}

async function salvarProgresso(p) {
  if (!temStorage()) return;
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(p));
  } catch (e) {
    console.error('não rolou salvar:', e);
  }
}

async function apagarProgresso() {
  if (!temStorage()) return;
  try {
    await window.storage.delete(STORAGE_KEY);
  } catch (e) { /* já era */ }
}

function calcXP(scores) {
  let xp = 0;
  for (const m of MODULES) {
    const s = scores[m.id] || 0;
    xp += s * 20;
    if (s === m.desafios.length) xp += 15; // bônus de gabaritar
  }
  return xp;
}

/* ============================ COMPONENTES BASE ============================ */

function Letreiro({ rota, destino, sub, mini }) {
  return (
    <div className={'letreiro' + (mini ? ' letreiro--mini' : '')}>
      {rota && <p className="letreiro-rota">{rota}</p>}
      <p className="letreiro-dest">{destino}</p>
      {sub && <p className="letreiro-sub">{sub}</p>}
    </div>
  );
}

function XPBar({ xp }) {
  const nivel = getLevel(xp);
  const base = nivel.min;
  const teto = nivel.prox ? nivel.prox.min : Math.max(xp, base + 1);
  const pct = nivel.prox ? Math.min(100, Math.round(((xp - base) / (teto - base)) * 100)) : 100;
  return (
    <div className="xp-wrap">
      <div className="xp-top">
        <span className="xp-nivel">{nivel.nome}</span>
        <span className="xp-pts">{xp} XP{nivel.prox ? ' · próx: ' + nivel.prox.min : ' · máx'}</span>
      </div>
      <div className="xp-bar"><div className="xp-fill" style={{ width: pct + '%' }} /></div>
    </div>
  );
}

function PainelLint({ itens }) {
  if (!itens || !itens.length) return null;
  const icone = { erro: '🚨', aviso: '⚠️', dica: '💡' };
  return (
    <div className="painel">
      <div className="painel-titulo"><span>Lint parceiro</span><span>{itens.length} ponto(s)</span></div>
      {itens.map((it, i) => (
        <div key={i} className={'lint-item lint-' + it.nivel}>
          <span className="lint-emoji">{icone[it.nivel] || '💡'}</span>
          <span>{it.msg}</span>
        </div>
      ))}
    </div>
  );
}

function Editor({ valor, onChange, arquivo }) {
  const numRef = useRef(null);
  const linhas = valor.split('\n').length;
  const nums = Array.from({ length: Math.max(linhas, 1) }, (_, i) => i + 1).join('\n');

  function keyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target;
      const s = el.selectionStart;
      const f = el.selectionEnd;
      const novo = valor.slice(0, s) + '  ' + valor.slice(f);
      onChange(novo);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = s + 2;
      });
    }
  }

  return (
    <div className="editor">
      <div className="editor-topo">
        <span className="dot d1" /><span className="dot d2" /><span className="dot d3" />
        <span className="editor-arquivo">{arquivo}</span>
      </div>
      <div className="editor-corpo">
        <pre className="editor-nums" ref={numRef} aria-hidden="true">{nums}</pre>
        <textarea
          className="editor-ta"
          value={valor}
          onChange={e => onChange(e.target.value)}
          onKeyDown={keyDown}
          onScroll={e => { if (numRef.current) numRef.current.scrollTop = e.target.scrollTop; }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label={'Editor de código: ' + arquivo}
        />
      </div>
    </div>
  );
}

/* ============================ DESAFIO: QUIZ ============================ */

const LETRAS = ['A', 'B', 'C', 'D'];

function DesafioQuiz({ d, onResolvido }) {
  const [sel, setSel] = useState(null);
  const respondeu = sel !== null;
  const acertou = respondeu && sel === d.correct;

  return (
    <div className="card">
      <p className="quiz-q">{d.q}</p>
      {d.code && <code className="code">{d.code}</code>}
      <div className="opts">
        {d.opts.map((o, idx) => {
          let cls = 'opt';
          if (respondeu) {
            if (idx === d.correct) cls += ' opt--certa';
            else if (idx === sel) cls += ' opt--errada';
            else cls += ' opt--apagada';
          }
          return (
            <button key={idx} className={cls} disabled={respondeu} onClick={() => setSel(idx)}>
              <span className="opt-letra">{LETRAS[idx]}</span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
      {respondeu && (
        <div className={'feedback ' + (acertou ? 'feedback--ok' : 'feedback--ruim')}>
          <p className="feedback-titulo">{acertou ? 'Aí sim, moleque! ✅' : 'Ih, vacilou... ❌'}</p>
          <p className="feedback-txt">{d.explain}</p>
        </div>
      )}
      {respondeu && (
        <div className="stack">
          <button className="btn btn-amarelo" onClick={() => onResolvido(acertou)}>Próxima →</button>
        </div>
      )}
    </div>
  );
}

/* ============================ DESAFIO: ENCAIXE ============================ */

function DesafioEncaixe({ d, onResolvido }) {
  const [banco, setBanco] = useState(() => embaralhaDiferente(d.pecas.map((p, i) => ({ p, k: i }))));
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
      setRes({ ok: false, msg: 'Ainda faltam ' + (d.pecas.length - monte.length) + ' peça(s) pra encaixar. Toca nelas aí embaixo pra subir.' });
      return;
    }
    // compara por TEXTO — peças idênticas são intercambiáveis
    let primeiroErro = -1;
    for (let i = 0; i < d.pecas.length; i++) {
      if (monte[i].p !== d.pecas[i]) { primeiroErro = i; break; }
    }
    if (primeiroErro === -1) {
      setRes({ ok: true, msg: d.explain });
    } else {
      setErros(e => e + 1);
      const certas = primeiroErro;
      setRes({
        ok: false,
        msg: certas === 0
          ? 'A primeira peça já não encaixa aí. Pensa: o que precisa vir ANTES de tudo nesse código?'
          : 'As ' + certas + ' primeira(s) tão certinhas 👊 — é a peça ' + (certas + 1) + ' que não encaixa nessa posição. Toca nela pra devolver e testa outra.',
      });
    }
  }

  function verGabarito() {
    setMonte(d.pecas.map((p, i) => ({ p, k: 'g' + i })));
    setBanco([]);
    setUsouGabarito(true);
    setRes({ ok: true, msg: 'Essa é a ordem certa. Lê de cima pra baixo entendendo o porquê de cada linha — na próxima sai de você. ' + d.explain });
  }

  const montado = res && res.ok;

  return (
    <div className="card">
      <p className="quiz-q">{d.enunciado}</p>
      <p className="encaixe-label">Seu código (toca numa peça pra devolver)</p>
      <div className="encaixe-area">
        {monte.length === 0 && <p className="encaixe-vazio">— vazio — toca nas peças aí de baixo pra montar aqui —</p>}
        {monte.map((item, i) => (
          <button key={item.k} className="peca peca--monte" onClick={() => !montado && devolver(i)}>{item.p}</button>
        ))}
      </div>
      {banco.length > 0 && (
        <>
          <p className="encaixe-label">Peças embaralhadas (toca pra encaixar)</p>
          <div className="encaixe-banco">
            {banco.map((item, i) => (
              <button key={item.k} className="peca" onClick={() => pegar(i)}>{item.p}</button>
            ))}
          </div>
        </>
      )}
      {res && (
        <div className={'feedback ' + (res.ok ? 'feedback--ok' : 'feedback--ruim')}>
          <p className="feedback-titulo">{res.ok ? (usouGabarito ? 'Montado com colinha 😅' : 'Encaixou perfeito! 🧩') : 'Quase lá...'}</p>
          <p className="feedback-txt">{res.msg}</p>
        </div>
      )}
      <div className="toolbar">
        {!montado && <button className="btn btn-amarelo" onClick={conferir}>Conferir encaixe</button>}
        {!montado && erros >= 2 && (
          <button className="btn btn-fantasma" onClick={verGabarito}>😮‍💨 Mostra a ordem certa</button>
        )}
        {montado && (
          <button className="btn btn-verde" onClick={() => onResolvido(!usouGabarito)}>
            {usouGabarito ? 'Seguir (sem pontuar)' : 'Fechar desafio ✓'}
          </button>
        )}
      </div>
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

  const ehJava = d.lang === 'java';

  // escuta o sandbox (só desafios React)
  useEffect(() => {
    if (ehJava) return;
    function onMsg(e) {
      const m = e.data;
      if (!m || m.ddc !== 1) return;
      if (m.tipo === 'erro') {
        const t = traduzErro(m.msg);
        setErros(prev => (prev.includes(t) ? prev : [...prev, t]));
      } else if (m.tipo === 'log') {
        setLogs(prev => [...prev.slice(-7), m.texto]);
      } else if (m.tipo === 'tela') {
        setFaltam(prev => {
          if (!prev) return prev;
          return prev.filter(t => !(m.texto || '').includes(t));
        });
      }
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [ehJava]);

  const completo = ehJava ? javaOk : (faltam !== null && faltam.length === 0);

  function rodar() {
    setTentativas(t => t + 1);
    setErros([]);
    setLogs([]);

    const base = lintDelimitadores(codigo);
    const especifico = ehJava ? lintJava(codigo) : lintJSX(codigo);
    const todos = [...base, ...especifico];
    const temErroDuro = todos.some(a => a.nivel === 'erro');

    if (ehJava) {
      const regrasFaltando = (d.regras || []).filter(r => !new RegExp(r.re).test(codigo));
      const faltas = regrasFaltando.map(r => ({ nivel: 'dica', msg: r.falta }));
      setLints([...todos, ...faltas]);
      if (temErroDuro || regrasFaltando.length) {
        setJavaOk(false);
        return;
      }
      setJavaOk(true);
      return;
    }

    // React: dicasAuto viram dica (não bloqueiam); erro duro bloqueia o run
    const autos = (d.dicasAuto || [])
      .filter(r => !new RegExp(r.re).test(codigo))
      .map(r => ({ nivel: 'dica', msg: r.falta }));
    setLints([...todos, ...autos]);
    if (temErroDuro) {
      setSrc(null);
      return;
    }
    setFaltam([...d.esperado]);
    setSrc(montaSrcDoc(codigo, d.preambulo));
    setRodada(k => k + 1);
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
        {!ehJava && (
          <div className="alvos">
            {d.esperado.map(t => {
              const ok = faltam !== null && !faltam.includes(t);
              return <span key={t} className={'alvo' + (ok ? ' alvo--ok' : '')}>{t}</span>;
            })}
          </div>
        )}
        {ehJava && (
          <div className="alvos">
            {(d.regras || []).map(r => (
              <span key={r.label} className={'alvo' + (new RegExp(r.re).test(codigo) ? ' alvo--ok' : '')}>{r.label}</span>
            ))}
          </div>
        )}
      </div>

      <Editor
        valor={codigo}
        onChange={v => {
          setCodigo(v);
          if (ehJava && javaOk) setJavaOk(false);
        }}
        arquivo={d.arquivo}
      />

      <div className="toolbar">
        <button className="btn btn-amarelo" onClick={rodar}>▶ Rodar</button>
        {d.dicas && d.dicas.length > 0 && (
          <button className="btn btn-fantasma" onClick={() => setDicaIdx(i => Math.min(i + 1, d.dicas.length - 1))}>
            💡 Dica {dicaIdx >= 0 ? '(' + (dicaIdx + 1) + '/' + d.dicas.length + ')' : ''}
          </button>
        )}
        {!completo && tentativas >= 2 && (
          <button className="btn btn-fantasma" onClick={() => setVerGab(v => !v)}>😮‍💨 Tô travado</button>
        )}
      </div>

      {dicaIdx >= 0 && (
        <div className="missao" style={{ borderColor: 'var(--rosa)' }}>
          <b style={{ color: 'var(--rosa)' }}>💡 Dica {dicaIdx + 1}:</b> {d.dicas[dicaIdx]}
        </div>
      )}

      {verGab && (
        <div className="painel">
          <div className="painel-titulo"><span>Gabarito</span><span>sem crise, é aprendizado</span></div>
          <code className="code" style={{ margin: 0, borderRadius: 0, borderLeft: 0, border: 0 }}>{d.gabarito}</code>
          <div style={{ padding: 10 }}>
            <button className="btn btn-fantasma" onClick={usarGabarito}>Colar no editor (não pontua, mas ensina)</button>
          </div>
        </div>
      )}

      <PainelLint itens={lints} />

      {erros.length > 0 && (
        <div className="painel">
          <div className="painel-titulo"><span>Deu ruim no run</span><span>tradução amigável</span></div>
          {erros.map((e, i) => (
            <div key={i} className="lint-item lint-erro"><span className="lint-emoji">🚨</span><span>{e}</span></div>
          ))}
        </div>
      )}

      {!ehJava && src && (
        <div className="painel">
          <div className="painel-titulo">
            <span>Preview · rodando de verdade</span>
            {d.testa && !completo && <span style={{ color: 'var(--amarelo)' }}>{d.testa}</span>}
          </div>
          <iframe
            key={rodada}
            className="preview-frame"
            sandbox="allow-scripts"
            srcDoc={src}
            title="Preview do seu código React"
          />
        </div>
      )}

      {!ehJava && logs.length > 0 && (
        <div className="painel">
          <div className="painel-titulo"><span>Console</span></div>
          <pre className="terminal terminal-log">{logs.map(l => '> ' + l).join('\n')}</pre>
        </div>
      )}

      {ehJava && javaOk && (
        <div className="painel">
          <div className="painel-titulo">
            <span>Terminal</span>
            <span>simulado* — Java precisa da JVM, não roda no navegador 😅</span>
          </div>
          <pre className="terminal"><span className="terminal-prefixo">$ javac Main.java && java Main{'\n'}</span>{d.saida}</pre>
        </div>
      )}

      {completo && (
        <>
          <div className="banner-ok">{ehJava ? 'Compilou limpinho! ✓' : 'Funcionou, olha na tela! 🎉'}</div>
          <div className="stack">
            <button className="btn btn-verde" onClick={() => onResolvido(!usouGabarito)}>
              {usouGabarito ? 'Seguir (sem pontuar)' : 'Fechar desafio ✓'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================ TELAS ============================ */

function TelaHome({ temProgresso, onStart }) {
  return (
    <div>
      <Letreiro
        rota="LINHA 5X-SUL · SENTIDO FULLSTACK"
        destino={'DEV DO\nCORRE'}
        sub="React + Java · do zero ao deploy"
      />
      <div className="card">
        <p className="card-txt">
          Sete pontos de busão entre o <strong>Terminal Varginha</strong> e a{' '}
          <strong>Faria Lima</strong>. Em cada parada: conceito rápido e desafios de
          três tipos — <strong>quiz</strong>, <strong>quebra-cabeça de encaixar código</strong> e{' '}
          <strong>código de verdade</strong>, que você digita, roda e vê acontecendo na tela,
          com um lint parceiro que explica o erro na moral (bem mais gente boa que a IDE).
          Acertou 3 de 5, libera o próximo ponto.
        </p>
      </div>
      <div className="stack">
        <button className="btn btn-amarelo" onClick={onStart}>
          {temProgresso ? 'Continuar o corre' : 'Começar o corre'}
        </button>
      </div>
      <p className="footer-note">Seu progresso fica salvo. Pode fechar e voltar depois, o busão te espera.</p>
    </div>
  );
}

function TelaTrilha({ progresso, onAbrir, onReset }) {
  const xp = calcXP(progresso.scores);
  const completos = MODULES.filter(m => (progresso.scores[m.id] || 0) >= 3).length;
  const zerou = completos === MODULES.length;
  return (
    <div>
      <Letreiro mini rota="Trilha da linha" destino="Escolhe teu ponto" />
      <XPBar xp={xp} />
      <div className="trilha">
        {MODULES.map((m, i) => {
          const score = progresso.scores[m.id];
          const feito = (score || 0) >= 3;
          const liberado = i === 0 || (progresso.scores[MODULES[i - 1].id] || 0) >= 3;
          const atual = liberado && !feito;
          return (
            <div className="parada" key={m.id}>
              <span className={'parada-dot' + (feito ? ' parada-dot--feito' : atual ? ' parada-dot--atual' : '')}>
                {feito ? '✓' : i + 1}
              </span>
              <button className="parada-card" disabled={!liberado} onClick={() => onAbrir(i)}>
                <span className="parada-tag">
                  <span>{m.tag}{!liberado ? ' · 🔒 fechado' : ''}</span>
                  {score !== undefined && <span className="parada-score">melhor: {score}/{m.desafios.length}</span>}
                </span>
                <p className="parada-nome">{m.nome}</p>
                <p className="parada-local">📍 {m.ponto}</p>
                <p className="parada-desc">{m.desc}</p>
              </button>
            </div>
          );
        })}
      </div>
      {zerou && (
        <div className="card" style={{ borderColor: 'var(--verde)' }}>
          <p className="trofeu">🏆</p>
          <p className="card-titulo" style={{ textAlign: 'center', color: 'var(--verde)' }}>Zerou a linha!</p>
          <p className="card-txt" style={{ textAlign: 'center' }}>
            Do Terminal Varginha até a Faria Lima: <strong>{getLevel(xp).nome}</strong> com {xp} XP.
            Agora é abrir o VS Code e o IntelliJ e construir o app de verdade. Tamo junto. 🤝
          </p>
        </div>
      )}
      <p className="footer-note">
        Refazer um desafio atualiza sua melhor pontuação.{' '}
        <button className="link-reset" onClick={onReset}>Zerar progresso</button>
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
      <Letreiro mini rota={modulo.tag + ' · ' + modulo.ponto} destino={modulo.nome} />
      <p className="pager">Conceito {i + 1} / {modulo.lessons.length}</p>
      <div className="card">
        <p className="card-titulo">{l.t}</p>
        <p className="card-txt">{l.txt}</p>
        {l.code && <code className="code">{l.code}</code>}
      </div>
      <div className="stack">
        {!ultima && (
          <button className="btn btn-amarelo" onClick={() => setI(i + 1)}>Próximo conceito →</button>
        )}
        {ultima && (
          <button className="btn btn-rosa" onClick={onDesafio}>Partiu desafios 🔥</button>
        )}
        {i > 0 && (
          <button className="btn btn-fantasma" onClick={() => setI(i - 1)}>← Voltar um conceito</button>
        )}
        <button className="btn btn-fantasma" onClick={onVoltar}>Voltar pra trilha</button>
      </div>
    </div>
  );
}

const NOME_TIPO = { quiz: 'Quiz', encaixe: 'Encaixe 🧩', code: 'Código ⌨️' };

function TelaDesafios({ modulo, onFim, onVoltar }) {
  const [qi, setQi] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [streak, setStreak] = useState(0);

  const d = modulo.desafios[qi];
  const ultima = qi === modulo.desafios.length - 1;

  function resolvido(pontuou) {
    const novoAcertos = pontuou ? acertos + 1 : acertos;
    if (pontuou) setStreak(s => s + 1);
    else setStreak(0);
    setAcertos(novoAcertos);
    if (ultima) onFim(novoAcertos);
    else setQi(qi + 1);
  }

  return (
    <div>
      <Letreiro mini rota={modulo.tag + ' · desafios'} destino={modulo.nome} />
      <div className="quiz-topo">
        <span>Desafio {qi + 1} / {modulo.desafios.length}</span>
        <span className="tipo-badge">{NOME_TIPO[d.tipo]}</span>
        <span>✔ {acertos}{streak >= 2 && <span className="quiz-streak"> · 🔥x{streak}</span>}</span>
      </div>
      {d.tipo === 'quiz' && <DesafioQuiz key={qi} d={d} onResolvido={resolvido} />}
      {d.tipo === 'encaixe' && <DesafioEncaixe key={qi} d={d} onResolvido={resolvido} />}
      {d.tipo === 'code' && <DesafioCode key={qi} d={d} onResolvido={resolvido} />}
      <div className="stack">
        <button className="btn btn-fantasma" onClick={onVoltar}>Abandonar (volta pra trilha)</button>
      </div>
    </div>
  );
}

function TelaResultado({ modulo, score, xpGanho, ehUltimo, onRefazer, onTrilha }) {
  const total = modulo.desafios.length;
  const passou = score >= 3;
  let msg;
  if (score === total) msg = 'GABARITOU, MONSTRO! 💛';
  else if (score >= 4) msg = 'Mandou muito bem!';
  else if (score >= 3) msg = 'Passou! Tá no caminho.';
  else msg = 'Foi por pouco... bora revisar e voltar.';
  return (
    <div>
      <Letreiro mini rota={modulo.tag + ' · resultado'} destino={modulo.ponto} />
      <div className="card" style={{ borderColor: passou ? 'var(--verde)' : 'var(--vermelho)' }}>
        <p className="placar">{score}/{total}</p>
        <p className="placar-sub">{msg}</p>
        {xpGanho > 0 && <p className="placar-sub" style={{ color: 'var(--amarelo)' }}>+{xpGanho} XP</p>}
        {!passou && (
          <p className="card-txt" style={{ textAlign: 'center', marginTop: 12 }}>
            Precisa de 3 acertos pra liberar o próximo ponto. Revisa os conceitos e cola de novo —
            ninguém aprende de primeira mesmo. (Desafio fechado com gabarito não pontua, mas ensina igual.)
          </p>
        )}
        {passou && ehUltimo && (
          <p className="card-txt" style={{ textAlign: 'center', marginTop: 12 }}>
            Último ponto concluído! Volta pra trilha pra ver teu troféu. 🏆
          </p>
        )}
      </div>
      <div className="stack">
        <button className="btn btn-amarelo" onClick={onTrilha}>Voltar pra trilha</button>
        <button className="btn btn-fantasma" onClick={onRefazer}>Refazer (revisa e tenta de novo)</button>
      </div>
    </div>
  );
}

/* ============================ APP ============================ */

export default function DevDoCorre() {
  const [tela, setTela] = useState('carregando');
  const [progresso, setProgresso] = useState({ scores: {} });
  const [ativo, setAtivo] = useState(0);
  const [ultimoResultado, setUltimoResultado] = useState(null);

  useEffect(() => {
    let vivo = true;
    carregarProgresso().then(p => {
      if (!vivo) return;
      if (p && p.scores) setProgresso(p);
      setTela('home');
    });
    return () => { vivo = false; };
  }, []);

  function abrirModulo(i) {
    setAtivo(i);
    setTela('licao');
  }

  function fimDosDesafios(score) {
    const m = MODULES[ativo];
    const xpAntes = calcXP(progresso.scores);
    const melhor = Math.max(progresso.scores[m.id] || 0, score);
    const novo = { ...progresso, scores: { ...progresso.scores, [m.id]: melhor } };
    const xpDepois = calcXP(novo.scores);
    setProgresso(novo);
    salvarProgresso(novo);
    setUltimoResultado({ score, xpGanho: xpDepois - xpAntes });
    setTela('resultado');
  }

  async function resetar() {
    const ok = typeof window !== 'undefined' && window.confirm
      ? window.confirm('Certeza que quer zerar tudo? Vai apagar XP e progresso.')
      : true;
    if (!ok) return;
    await apagarProgresso();
    setProgresso({ scores: {} });
    setTela('home');
  }

  const temProgresso = Object.keys(progresso.scores).length > 0;

  return (
    <div className="ddc">
      <style>{CSS}</style>
      <div className="ddc-shell">
        {tela === 'carregando' && (
          <Letreiro rota="AGUARDA..." destino="Chamando o busão" sub="carregando seu progresso" />
        )}
        {tela === 'home' && (
          <TelaHome temProgresso={temProgresso} onStart={() => setTela('trilha')} />
        )}
        {tela === 'trilha' && (
          <TelaTrilha progresso={progresso} onAbrir={abrirModulo} onReset={resetar} />
        )}
        {tela === 'licao' && (
          <TelaLicao
            modulo={MODULES[ativo]}
            onDesafio={() => setTela('desafios')}
            onVoltar={() => setTela('trilha')}
          />
        )}
        {tela === 'desafios' && (
          <TelaDesafios
            key={ativo}
            modulo={MODULES[ativo]}
            onFim={fimDosDesafios}
            onVoltar={() => setTela('trilha')}
          />
        )}
        {tela === 'resultado' && ultimoResultado && (
          <TelaResultado
            modulo={MODULES[ativo]}
            score={ultimoResultado.score}
            xpGanho={ultimoResultado.xpGanho}
            ehUltimo={ativo === MODULES.length - 1}
            onRefazer={() => setTela('licao')}
            onTrilha={() => setTela('trilha')}
          />
        )}
      </div>
    </div>
  );
}

/* ============================ CONTEÚDO ============================ */

const MODULES = [
  {
    id: 'react-basico',
    nome: 'React: o começo do corre',
    ponto: 'Terminal Varginha',
    tag: 'PONTO 01',
    desc: 'Componente, JSX, props e state. A base de tudo.',
    lessons: [
      {
        t: 'O que é React, na moral?',
        txt: 'React é uma biblioteca JavaScript pra montar interface. A ideia central: tudo é COMPONENTE — uma função que recebe dados e devolve JSX (aquela "marcação" parecida com HTML). Você monta a tela juntando componente igual peça de Lego.',
        code: 'function Salve() {\n  return <h1>Salve, quebrada!</h1>;\n}',
      },
      {
        t: 'Props: passando o bagulho pra dentro',
        txt: 'Props são os parâmetros do componente. O pai manda, o filho recebe. Props são SOMENTE LEITURA — o filho não altera o que recebeu.',
        code: 'function Card({ nome }) {\n  return <p>E aí, {nome}!</p>;\n}\n\n<Card nome="Edu" />',
      },
      {
        t: 'State: a memória do componente',
        txt: 'useState guarda um valor que muda com o tempo (contador, texto de input, se o modal tá aberto...). Quando você chama a função set, o React re-renderiza o componente com o valor novo.',
        code: 'const [likes, setLikes] = useState(0);\n\n<button onClick={() => setLikes(likes + 1)}>\n  Curtir ({likes})\n</button>',
      },
    ],
    desafios: [
      {
        tipo: 'quiz',
        q: 'Como interpola uma variável dentro do JSX?',
        opts: ['<p>{{nome}}</p>', '<p>${nome}</p>', '<p>{nome}</p>', '<p><%= nome %></p>'],
        correct: 2,
        explain: 'Chave simples { }. Chave dupla é papo de Vue/Angular, e ${ } é template string do JS puro — dentro do JSX não rola.',
      },
      {
        tipo: 'encaixe',
        enunciado: 'Monta o componente Perfil que recebe a prop nome e dá um salve:',
        pecas: [
          'function Perfil({ nome }) {',
          '  return (',
          '    <h2>E aí, {nome}!</h2>',
          '  );',
          '}',
        ],
        explain: 'Função → return → JSX dentro → fecha o return → fecha a função. A prop chega desestruturada no parâmetro: { nome }.',
      },
      {
        tipo: 'code',
        lang: 'jsx',
        arquivo: 'App.jsx',
        enunciado: 'Teu primeiro componente rodando DE VERDADE:',
        missao: 'fazer aparecer na tela um <h1> escrito Salve, Edu!',
        starter: 'function App() {\n  // devolve um <h1> com o texto: Salve, Edu!\n\n}',
        esperado: ['Salve, Edu!'],
        dicasAuto: [
          { re: 'return', falta: 'Todo componente precisa de um return devolvendo o JSX — sem return, não aparece nada.' },
          { re: '<h1', falta: 'A missão pede um <h1>. Tag abre <h1> e fecha </h1>.' },
        ],
        dicas: [
          'O componente é uma função que RETORNA JSX.',
          'A estrutura toda: return <h1>Salve, Edu!</h1>;',
        ],
        gabarito: 'function App() {\n  return <h1>Salve, Edu!</h1>;\n}',
      },
      {
        tipo: 'quiz',
        q: 'Por que NÃO pode alterar o state na mão, tipo likes = 5?',
        opts: [
          'Porque dá erro de sintaxe no JS',
          'Porque o React não fica sabendo e a tela não atualiza',
          'Porque state é constante pra sempre',
          'Pode sim, sem problema nenhum',
        ],
        correct: 1,
        explain: 'O React só re-renderiza quando você usa a função set. Mudando direto, o valor até muda na memória, mas a tela fica pra trás.',
      },
      {
        tipo: 'code',
        lang: 'jsx',
        arquivo: 'App.jsx',
        enunciado: 'Botão de curtir com state — o clássico:',
        missao: 'um botão Curtir (0) que vira Curtir (1), Curtir (2)... a cada clique. O useState já tá disponível, nem precisa importar.',
        testa: '👆 clica no botão do preview!',
        starter: 'function App() {\n  // 1) cria o state:\n  //    const [likes, setLikes] = useState(0)\n  // 2) no clique do botão, soma 1\n\n  return (\n    <button>\n      Curtir (0)\n    </button>\n  );\n}',
        esperado: ['Curtir (0)', 'Curtir (1)'],
        dicasAuto: [
          { re: 'useState', falta: 'Vai precisar do useState pra guardar os likes.' },
          { re: 'onClick', falta: 'O botão precisa de um onClick={...} pra reagir ao clique.' },
          { re: '\\{likes\\}', falta: 'Mostra o valor na tela: Curtir ({likes}) — com chaves pra interpolar.' },
        ],
        dicas: [
          'Primeiro o state: const [likes, setLikes] = useState(0);',
          'No botão: onClick={() => setLikes(likes + 1)}',
          'E o texto vira: Curtir ({likes})',
        ],
        gabarito: 'function App() {\n  const [likes, setLikes] = useState(0);\n\n  return (\n    <button onClick={() => setLikes(likes + 1)}>\n      Curtir ({likes})\n    </button>\n  );\n}',
      },
    ],
  },
  {
    id: 'react-inter',
    nome: 'React: pegando a manha',
    ponto: 'Terminal Grajaú',
    tag: 'PONTO 02',
    desc: 'useEffect, listas com map, condicional e input controlado.',
    lessons: [
      {
        t: 'useEffect: efeito colateral',
        txt: 'Serve pra sincronizar o componente com o mundo lá fora: buscar dado de API, mexer no título da aba, criar timer. O array de dependências controla QUANDO o efeito roda de novo.',
        code: "useEffect(() => {\n  console.log('montou!');\n}, []); // array vazio = roda 1x, na montagem",
      },
      {
        t: 'Lista com map + key',
        txt: 'Pra renderizar lista, usa .map(). Cada item precisa de uma key ÚNICA e estável (de preferência o id do dado) — é assim que o React sabe o que entrou, saiu ou mudou.',
        code: '{produtos.map(p => (\n  <li key={p.id}>{p.nome}</li>\n))}',
      },
      {
        t: 'Condicional + input controlado',
        txt: 'Renderização condicional é ternário ou &&. Input controlado é quando o value vem do state e o onChange atualiza esse state — o React vira o dono da verdade.',
        code: '{logado ? <Painel /> : <Login />}\n\n<input\n  value={busca}\n  onChange={e => setBusca(e.target.value)}\n/>',
      },
    ],
    desafios: [
      {
        tipo: 'quiz',
        q: 'useEffect com array de dependências VAZIO roda quando?',
        opts: ['A cada renderização', 'Só quando o componente monta', 'Nunca', 'Só quando o componente desmonta'],
        correct: 1,
        explain: 'Array vazio = nenhuma dependência pra observar = roda uma vez só, na montagem.',
      },
      {
        tipo: 'code',
        lang: 'jsx',
        arquivo: 'App.jsx',
        enunciado: 'Renderiza a lista de corres com .map():',
        missao: 'mostrar os 3 itens do array na tela, cada um numa <li> com key.',
        starter: "const corres = ['Estudar React', 'Treinar Java', 'Lançar o app'];\n\nfunction App() {\n  return (\n    <ul>\n      {/* usa corres.map(...) aqui, com key! */}\n    </ul>\n  );\n}",
        esperado: ['Estudar React', 'Treinar Java', 'Lançar o app'],
        dicasAuto: [
          { re: '\\.map\\(', falta: 'Usa corres.map(item => ...) pra transformar cada texto numa <li>.' },
          { re: 'key=', falta: 'Cada <li> precisa da prop key — aqui pode ser o próprio item: key={item}.' },
        ],
        dicas: [
          'Dentro do <ul>: {corres.map(item => ...)}',
          'Cada item vira: <li key={item}>{item}</li>',
        ],
        gabarito: "const corres = ['Estudar React', 'Treinar Java', 'Lançar o app'];\n\nfunction App() {\n  return (\n    <ul>\n      {corres.map(item => (\n        <li key={item}>{item}</li>\n      ))}\n    </ul>\n  );\n}",
      },
      {
        tipo: 'encaixe',
        enunciado: 'Monta o input controlado — o React como dono da verdade:',
        pecas: [
          'function Busca() {',
          "  const [texto, setTexto] = useState('');",
          '  return (',
          '    <input',
          '      value={texto}',
          '      onChange={e => setTexto(e.target.value)}',
          '    />',
          '  );',
          '}',
        ],
        explain: 'Primeiro o state, depois o input com value ligado no state e onChange atualizando. value + onChange = controlado.',
      },
      {
        tipo: 'quiz',
        q: 'Quando esse parágrafo aparece na tela?',
        code: '{erro && <p>Deu ruim!</p>}',
        opts: ['Sempre', 'Quando erro for truthy', 'Quando erro for false', 'Nunca, a sintaxe é inválida'],
        correct: 1,
        explain: 'O && só renderiza o lado direito se o esquerdo for truthy. Atalho clássico de condicional no JSX.',
      },
      {
        tipo: 'code',
        lang: 'jsx',
        arquivo: 'App.jsx',
        enunciado: 'Renderização condicional na prática:',
        missao: 'se online for true, mostrar Tá on 🟢 — senão, Caiu a net 🔴. Testa trocando o valor de online depois!',
        starter: "function App() {\n  const online = true;\n\n  // mostra <p>Tá on 🟢</p> se online,\n  // senão <p>Caiu a net 🔴</p>\n  return (\n    <div>\n\n    </div>\n  );\n}",
        esperado: ['Tá on'],
        dicasAuto: [
          { re: '\\?|&&', falta: 'Usa ternário {online ? isso : aquilo} ou o operador && dentro do JSX.' },
        ],
        dicas: [
          'Dentro da <div>: {online ? <p>Tá on 🟢</p> : <p>Caiu a net 🔴</p>}',
        ],
        gabarito: "function App() {\n  const online = true;\n\n  return (\n    <div>\n      {online ? <p>Tá on 🟢</p> : <p>Caiu a net 🔴</p>}\n    </div>\n  );\n}",
      },
    ],
  },
  {
    id: 'react-avancado',
    nome: 'React: modo brabo',
    ponto: 'Cidade Dutra',
    tag: 'PONTO 03',
    desc: 'Custom hooks, Context, memorização e performance.',
    lessons: [
      {
        t: 'Custom hook: sua lógica reutilizável',
        txt: 'Quando a mesma lógica de state/efeito aparece em vários componentes, você extrai pra um custom hook. Regra de ouro: o nome SEMPRE começa com "use".',
        code: 'function useToggle(inicial) {\n  const [on, setOn] = useState(inicial);\n  const toggle = () => setOn(v => !v);\n  return [on, toggle];\n}',
      },
      {
        t: 'Context: chega de prop drilling',
        txt: 'Quando um dado precisa descer por vários níveis de componente (tema, usuário logado), passar prop por prop vira sofrência. Context deixa qualquer descendente ler o valor direto.',
        code: 'const TemaContext = createContext();\n\n// lá embaixo na árvore:\nconst tema = useContext(TemaContext);',
      },
      {
        t: 'useMemo, useCallback e React.memo',
        txt: 'useMemo memoriza um VALOR calculado pesado. useCallback memoriza uma FUNÇÃO (pra não recriar a cada render). React.memo evita re-render de um componente se as props não mudaram. Use quando tiver problema real de performance, não por vício.',
        code: 'const total = useMemo(\n  () => calcularPesado(itens),\n  [itens]\n);',
      },
    ],
    desafios: [
      {
        tipo: 'quiz',
        q: 'Qual a regra de nomenclatura de um custom hook?',
        opts: ['Qualquer nome serve', 'Tem que começar com "use"', 'Tem que ser tudo maiúsculo', 'Tem que terminar com "Hook"'],
        correct: 1,
        explain: 'useAlgumaCoisa. É essa convenção que permite o React (e o lint) aplicar as regras de hooks direitinho.',
      },
      {
        tipo: 'encaixe',
        enunciado: 'Monta o custom hook useToggle — liga/desliga reutilizável:',
        pecas: [
          'function useToggle(inicial) {',
          '  const [on, setOn] = useState(inicial);',
          '  const toggle = () => setOn(v => !v);',
          '  return [on, toggle];',
          '}',
        ],
        explain: 'Primeiro o state, depois a função que inverte, e o hook devolve os dois num array — igualzinho o useState faz.',
      },
      {
        tipo: 'quiz',
        q: 'Diferença entre useMemo e useCallback:',
        opts: [
          'São idênticos, só muda o nome',
          'useMemo memoriza um VALOR; useCallback memoriza uma FUNÇÃO',
          'useCallback só funciona em classe',
          'useMemo roda no servidor',
        ],
        correct: 1,
        explain: 'useMemo guarda o resultado de um cálculo. useCallback guarda a referência de uma função. useCallback(fn, deps) é basicamente useMemo(() => fn, deps).',
      },
      {
        tipo: 'code',
        lang: 'jsx',
        arquivo: 'useContador.jsx',
        enunciado: 'Cria teu primeiro custom hook:',
        missao: 'completar o useContador pra devolver [n, incrementa]. O App já tá pronto usando ele — se o hook funcionar, o botão conta.',
        testa: '👆 clica no botão do preview!',
        starter: '// complete o hook: devolve [n, incrementa]\nfunction useContador(inicial) {\n\n}\n\nfunction App() {\n  const [n, incrementa] = useContador(0);\n  return (\n    <button onClick={incrementa}>Cliques: {n}</button>\n  );\n}',
        esperado: ['Cliques: 0', 'Cliques: 1'],
        dicasAuto: [
          { re: 'useState', falta: 'Dentro do hook, usa useState(inicial) pra guardar o número — hook pode usar hook.' },
          { re: 'return\\s*\\[', falta: 'O hook precisa DEVOLVER um array: return [n, incrementa];' },
        ],
        dicas: [
          'Dentro do hook: const [n, setN] = useState(inicial);',
          'A função: const incrementa = () => setN(v => v + 1);',
          'E fecha com: return [n, incrementa];',
        ],
        gabarito: 'function useContador(inicial) {\n  const [n, setN] = useState(inicial);\n  const incrementa = () => setN(v => v + 1);\n  return [n, incrementa];\n}\n\nfunction App() {\n  const [n, incrementa] = useContador(0);\n  return (\n    <button onClick={incrementa}>Cliques: {n}</button>\n  );\n}',
      },
      {
        tipo: 'quiz',
        q: 'O que o React.memo faz?',
        opts: [
          'Salva o componente no navegador',
          'Evita re-render do componente se as props não mudaram',
          'Deixa o componente assíncrono',
          'Cria uma cópia independente do componente',
        ],
        correct: 1,
        explain: 'Ele compara as props: se vieram iguais, o React pula a re-renderização daquele componente. Bom pra filho pesado de pai que renderiza toda hora.',
      },
    ],
  },
  {
    id: 'java-basico',
    nome: 'Java: a fundação',
    ponto: 'Interlagos',
    tag: 'PONTO 04',
    desc: 'Tipos, métodos, loops e coleções. O concreto do prédio.',
    lessons: [
      {
        t: 'Tipagem forte, sem mistério',
        txt: 'Em Java toda variável tem tipo declarado e o compilador cobra. Primitivos: int, double, boolean, char... String e as coleções são objetos. Isso pega muito erro ANTES de rodar.',
        code: 'int idade = 25;\ndouble preco = 9.90;\nboolean ativo = true;\nString nome = "Edu";',
      },
      {
        t: 'Tudo vive dentro de classe',
        txt: 'Java é orientado a objeto até o talo: método não existe solto, sempre dentro de uma classe. Assinatura de método = visibilidade + retorno + nome + parâmetros.',
        code: 'public class Calc {\n  public int somar(int a, int b) {\n    return a + b;\n  }\n}',
      },
      {
        t: 'Array x ArrayList',
        txt: 'Array tem tamanho FIXO. ArrayList (da Collections) cresce dinamicamente e vem cheio de método útil: add, remove, contains, size...',
        code: 'List<String> nomes = new ArrayList<>();\nnomes.add("Edu");\nnomes.add("Bia");\nnomes.size(); // 2',
      },
    ],
    desafios: [
      {
        tipo: 'quiz',
        q: 'Qual desses é um tipo PRIMITIVO em Java?',
        opts: ['String', 'int', 'ArrayList', 'Integer'],
        correct: 1,
        explain: 'int, double, boolean, char, long... são primitivos. String, Integer e ArrayList são objetos (classes).',
      },
      {
        tipo: 'code',
        lang: 'java',
        arquivo: 'Main.java',
        enunciado: 'Teu primeiro Java: variáveis + println.',
        contexto: 'Aqui o Java não roda de verdade (ele precisa da JVM, não do navegador) — mas o lint confere teu código igual um compilador gente boa.',
        missao: 'declarar String nome = "Edu" e int idade = 25, e imprimir: Edu tem 25 anos',
        starter: 'public class Main {\n  public static void main(String[] args) {\n    // 1) String nome = "Edu";\n    // 2) int idade = 25;\n    // 3) imprime: Edu tem 25 anos\n\n  }\n}',
        regras: [
          { re: 'String\\s+nome\\s*=\\s*"', label: 'String nome', falta: 'Falta declarar a String nome = "Edu"; — com aspas DUPLAS: em Java, aspas simples é só pra char.' },
          { re: 'int\\s+idade\\s*=\\s*\\d', label: 'int idade', falta: 'Falta o int idade = 25; — número vai sem aspas, que número é número.' },
          { re: 'System\\.out\\.println\\(', label: 'println', falta: 'Usa System.out.println(...) pra imprimir no console.' },
          { re: 'nome\\s*\\+|\\+\\s*nome', label: 'concatenar com +', falta: 'Junta as partes com + : nome + " tem " + idade + " anos"' },
        ],
        saida: 'Edu tem 25 anos',
        dicas: [
          'Declara primeiro as duas variáveis, cada uma com ; no final.',
          'A impressão: System.out.println(nome + " tem " + idade + " anos");',
        ],
        gabarito: 'public class Main {\n  public static void main(String[] args) {\n    String nome = "Edu";\n    int idade = 25;\n    System.out.println(nome + " tem " + idade + " anos");\n  }\n}',
      },
      {
        tipo: 'quiz',
        q: 'Pra comparar o CONTEÚDO de duas Strings, usa:',
        opts: ['s1 == s2', 's1.equals(s2)', 's1 === s2', 'compare(s1, s2)'],
        correct: 1,
        explain: '== compara referência (se é o MESMO objeto na memória). .equals() compara o texto de verdade. Clássica pegadinha de entrevista.',
      },
      {
        tipo: 'code',
        lang: 'java',
        arquivo: 'Main.java',
        enunciado: 'Loop somando: 1 + 2 + 3 + 4 + 5.',
        missao: 'usar um for de 1 até 5 acumulando na variável soma. Saída esperada: 15',
        starter: 'public class Main {\n  public static void main(String[] args) {\n    int soma = 0;\n\n    // for de 1 até 5, acumulando em soma\n\n    System.out.println(soma);\n  }\n}',
        regras: [
          { re: 'for\\s*\\(', label: 'for', falta: 'Cadê o for? Estrutura: for (int i = 1; i <= 5; i++) { ... }' },
          { re: 'i\\s*<=\\s*5|i\\s*<\\s*6', label: 'vai até 5', falta: 'O loop precisa ir até o 5: condição i <= 5 (ou i < 6).' },
          { re: 'soma\\s*\\+=|soma\\s*=\\s*soma\\s*\\+', label: 'soma acumula', falta: 'Dentro do loop, acumula: soma += i; (que é o mesmo que soma = soma + i).' },
        ],
        saida: '15',
        dicas: [
          'for (int i = 1; i <= 5; i++) { ... }',
          'Dentro das chaves do for: soma += i;',
        ],
        gabarito: 'public class Main {\n  public static void main(String[] args) {\n    int soma = 0;\n\n    for (int i = 1; i <= 5; i++) {\n      soma += i;\n    }\n\n    System.out.println(soma);\n  }\n}',
      },
      {
        tipo: 'encaixe',
        enunciado: 'Monta a classe Calc com o método somar:',
        pecas: [
          'public class Calc {',
          '  public int somar(int a, int b) {',
          '    return a + b;',
          '  }',
          '}',
        ],
        explain: 'Classe fora, método dentro: visibilidade + tipo de retorno + nome + parâmetros. O return devolve a conta e cada bloco fecha sua chave.',
      },
    ],
  },
  {
    id: 'java-poo',
    nome: 'Java: POO na veia',
    ponto: 'Socorro',
    tag: 'PONTO 05',
    desc: 'Classe, objeto, herança, interface e polimorfismo.',
    lessons: [
      {
        t: 'Classe é o molde, objeto é a peça',
        txt: 'A classe define atributos e comportamentos. O objeto é a instância criada com new. O construtor roda na hora do nascimento pra deixar o objeto pronto pro uso.',
        code: 'public class Carro {\n  private String modelo;\n\n  public Carro(String modelo) {\n    this.modelo = modelo;\n  }\n}\n\nCarro c = new Carro("Gol bolinha");',
      },
      {
        t: 'Encapsulamento: cada um no seu quadrado',
        txt: 'Atributo fica private e o mundo externo só acessa pelos métodos que VOCÊ liberou (getters/setters ou métodos de negócio). Isso protege o estado interno de ser bagunçado por fora.',
        code: 'public class Conta {\n  private double saldo;\n\n  public void depositar(double valor) {\n    if (valor > 0) saldo += valor;\n  }\n}',
      },
      {
        t: 'Herança, interface e polimorfismo',
        txt: 'extends herda de UMA classe. implements assina o contrato de uma interface (pode várias). Polimorfismo: a variável pode ser do tipo pai, mas quem manda é o método sobrescrito do tipo REAL do objeto.',
        code: 'class Moto extends Veiculo { }\nclass Pix implements Pagamento { }\n\nAnimal a = new Cachorro();\na.fazerSom(); // late! roda o do Cachorro',
      },
    ],
    desafios: [
      {
        tipo: 'quiz',
        q: 'Encapsulamento é:',
        opts: [
          'Deixar todos os atributos public',
          'Esconder os detalhes internos (private) e expor só o necessário via métodos',
          'Criar o máximo de classes possível',
          'Usar static em tudo',
        ],
        correct: 1,
        explain: 'A classe protege o próprio estado. Quem tá de fora interage pelos métodos liberados — e a classe valida o que entra.',
      },
      {
        tipo: 'encaixe',
        enunciado: 'Monta a classe Carro com atributo privado e construtor:',
        pecas: [
          'public class Carro {',
          '  private String modelo;',
          '  public Carro(String modelo) {',
          '    this.modelo = modelo;',
          '  }',
          '}',
        ],
        explain: 'Atributo private primeiro, depois o construtor com o mesmo nome da classe. O this.modelo diferencia o atributo do parâmetro que chegou.',
      },
      {
        tipo: 'code',
        lang: 'java',
        arquivo: 'Conta.java',
        enunciado: 'Encapsulamento na prática — a classe Conta:',
        missao: 'atributo private double saldo + método public void depositar(double valor) que só soma se valor > 0.',
        starter: 'public class Conta {\n  // 1) atributo private double saldo\n\n  // 2) public void depositar(double valor)\n  //    que só soma no saldo se valor > 0\n\n}',
        regras: [
          { re: 'private\\s+double\\s+saldo', label: 'private saldo', falta: 'O saldo tem que ser private double saldo; — encapsulado, ninguém mexe direto de fora.' },
          { re: 'public\\s+void\\s+depositar\\s*\\(\\s*double', label: 'depositar()', falta: 'Declara o método: public void depositar(double valor) { ... }' },
          { re: 'if\\s*\\(', label: 'valida com if', falta: 'Protege com if (valor > 0) — conta não aceita depósito negativo, né.' },
          { re: 'saldo\\s*\\+=|saldo\\s*=\\s*saldo\\s*\\+', label: 'soma no saldo', falta: 'Dentro do if, soma: saldo += valor;' },
        ],
        saida: 'new Conta() → depositar(150.0) → saldo interno: 150.0 ✓',
        dicas: [
          'O atributo: private double saldo; (uma linha só, dentro da classe).',
          'O método: public void depositar(double valor) { if (valor > 0) { saldo += valor; } }',
        ],
        gabarito: 'public class Conta {\n  private double saldo;\n\n  public void depositar(double valor) {\n    if (valor > 0) {\n      saldo += valor;\n    }\n  }\n}',
      },
      {
        tipo: 'quiz',
        q: 'Cachorro sobrescreve fazerSom(). O que roda aqui?',
        code: 'Animal a = new Cachorro();\na.fazerSom();',
        opts: [
          'O método da classe Animal',
          'O método sobrescrito do Cachorro',
          'Erro de compilação',
          'Nada, o método some',
        ],
        correct: 1,
        explain: 'Isso é polimorfismo: o tipo REAL do objeto (Cachorro) decide qual versão do método roda em tempo de execução.',
      },
      {
        tipo: 'quiz',
        q: 'Diferença entre extends e implements:',
        opts: [
          'São sinônimos',
          'extends herda de uma CLASSE; implements assina o contrato de uma INTERFACE',
          'implements herda os atributos privados',
          'extends só serve pra interface',
        ],
        correct: 1,
        explain: 'extends = herança de classe (uma só). implements = compromisso de implementar os métodos da interface (pode implementar várias).',
      },
    ],
  },
  {
    id: 'spring-boot',
    nome: 'Spring Boot: o backend',
    ponto: 'Largo Treze',
    tag: 'PONTO 06',
    desc: 'API REST, camadas, annotations e injeção de dependência.',
    lessons: [
      {
        t: 'API REST: o balcão do backend',
        txt: 'Sua API expõe endpoints HTTP. @RestController marca a classe que atende as requisições e devolve JSON. @GetMapping busca, @PostMapping cria, @PutMapping atualiza, @DeleteMapping apaga.',
        code: '@RestController\n@RequestMapping("/api/produtos")\npublic class ProdutoController {\n\n  @GetMapping\n  public List<Produto> listar() { ... }\n\n  @PostMapping\n  public Produto criar(@RequestBody Produto p) { ... }\n}',
      },
      {
        t: 'Camadas: cada um faz um corre',
        txt: 'Controller recebe a requisição e devolve resposta. Service guarda a regra de negócio. Repository conversa com o banco. Separar assim deixa o código testável e organizado — igual você já viu no vt_wf, só que com cada coisa no seu lugar.',
        code: '// Controller  →  Service  →  Repository  →  Banco\n\npublic interface ProdutoRepository\n    extends JpaRepository<Produto, Long> { }',
      },
      {
        t: 'Injeção de dependência',
        txt: 'Você não dá new nos objetos de infraestrutura: declara o que precisa e o Spring cria e entrega pronto. O jeito recomendado é injeção via construtor.',
        code: '@Service\npublic class ProdutoService {\n  private final ProdutoRepository repo;\n\n  public ProdutoService(ProdutoRepository repo) {\n    this.repo = repo; // o Spring injeta\n  }\n}',
      },
    ],
    desafios: [
      {
        tipo: 'quiz',
        q: 'O que a annotation @RestController faz?',
        opts: [
          'Cria o banco de dados automaticamente',
          'Marca a classe que responde requisições HTTP devolvendo JSON',
          'Gera a interface gráfica do sistema',
          'Roda os testes unitários',
        ],
        correct: 1,
        explain: 'Ela transforma a classe num controlador REST: os métodos viram endpoints e o retorno é serializado pra JSON automaticamente.',
      },
      {
        tipo: 'encaixe',
        enunciado: 'Monta o controller com endpoint GET que lista produtos:',
        pecas: [
          '@RestController',
          '@RequestMapping("/api/produtos")',
          'public class ProdutoController {',
          '  @GetMapping',
          '  public List<Produto> listar() {',
          '    return service.listarTodos();',
          '  }',
          '}',
        ],
        explain: 'Annotations em cima da classe primeiro, depois a classe, o @GetMapping em cima do método, e o método delegando pro service. Cada camada no seu quadrado.',
      },
      {
        tipo: 'code',
        lang: 'java',
        arquivo: 'ProdutoController.java',
        enunciado: 'Cria o endpoint POST — o de criar produto:',
        missao: 'um método com @PostMapping que recebe um Produto via @RequestBody e devolve ele.',
        starter: '@RestController\n@RequestMapping("/api/produtos")\npublic class ProdutoController {\n\n  // endpoint POST que recebe um Produto\n  // no corpo da requisição e devolve ele\n\n}',
        regras: [
          { re: '@PostMapping', label: '@PostMapping', falta: 'Falta a annotation @PostMapping em cima do método — é ela que faz o endpoint aceitar POST.' },
          { re: '@RequestBody', label: '@RequestBody', falta: 'O Produto chega no CORPO da requisição: recebe com @RequestBody Produto p.' },
          { re: 'public\\s+Produto\\s+\\w+\\s*\\(', label: 'método público', falta: 'Declara o método público devolvendo Produto: public Produto criar(@RequestBody Produto p) { ... }' },
          { re: 'return', label: 'return', falta: 'Devolve o produto no final: return p; — o Spring serializa pra JSON sozinho.' },
        ],
        saida: 'POST /api/produtos → 201 Created (JSON no corpo)',
        dicas: [
          'A annotation vai numa linha, o método na de baixo.',
          'Assinatura completa: public Produto criar(@RequestBody Produto p) { return p; }',
        ],
        gabarito: '@RestController\n@RequestMapping("/api/produtos")\npublic class ProdutoController {\n\n  @PostMapping\n  public Produto criar(@RequestBody Produto p) {\n    return p;\n  }\n}',
      },
      {
        tipo: 'quiz',
        q: 'Na arquitetura em camadas, quem conversa com o banco?',
        opts: ['O Controller', 'O Repository', 'O front-end', 'A annotation @GetMapping'],
        correct: 1,
        explain: 'Controller recebe → Service aplica a regra de negócio → Repository acessa o banco. Cada camada com sua função.',
      },
      {
        tipo: 'quiz',
        q: 'A annotation @PathVariable serve pra:',
        opts: [
          'Pegar um valor da URL, tipo o id em /produtos/{id}',
          'Criar variável global no projeto',
          'Definir a porta do servidor',
          'Validar a senha do usuário',
        ],
        correct: 0,
        explain: 'Ela liga o pedaço dinâmico da URL ao parâmetro do método: @GetMapping("/{id}") + @PathVariable Long id.',
      },
    ],
  },
  {
    id: 'fullstack',
    nome: 'Boss final: fullstack',
    ponto: 'Faria Lima',
    tag: 'PONTO FINAL',
    desc: 'React + Spring conversando: fetch, JSON e CORS.',
    lessons: [
      {
        t: 'O fluxo completo do app',
        txt: 'React (fetch) → HTTP → Controller → Service → Repository → Banco. A resposta volta o caminho contrário, virando JSON no meio do caminho. Front e back são projetos separados que se falam por HTTP.',
        code: '// React (porta 5173)  ⇄  Spring (porta 8080)\n// GET /api/produtos  →  200 OK + JSON',
      },
      {
        t: 'Consumindo a API no React',
        txt: 'fetch (ou axios) dentro de um useEffect pra carregar na montagem. res.json() converte o corpo da resposta em objeto JS, e aí é só jogar no state.',
        code: "useEffect(() => {\n  fetch('http://localhost:8080/api/produtos')\n    .then(res => res.json())\n    .then(setProdutos)\n    .catch(err => setErro(err.message));\n}, []);",
      },
      {
        t: 'CORS: o segurança da balada',
        txt: 'O navegador bloqueia requisição de uma origem (localhost:5173) pra outra (localhost:8080) se o backend não autorizar. Resolve liberando a origem no Spring — @CrossOrigin no controller ou uma config global de CORS.',
        code: '@CrossOrigin(origins = "http://localhost:5173")\n@RestController\npublic class ProdutoController { ... }',
      },
    ],
    desafios: [
      {
        tipo: 'quiz',
        q: 'O React consome a API Java através de:',
        opts: [
          'Importando a classe Java direto no JS',
          'Requisições HTTP (fetch/axios) pros endpoints',
          'Copiando o banco pra dentro do front',
          'JDBC rodando no navegador',
        ],
        correct: 1,
        explain: 'Front e back são mundos separados. A ponte é HTTP: o React chama os endpoints e recebe JSON de volta.',
      },
      {
        tipo: 'code',
        lang: 'jsx',
        arquivo: 'App.jsx',
        enunciado: 'BOSS: consome a "API" e lista os produtos na tela.',
        contexto: 'A função buscarProdutos() já existe e devolve uma Promise — igualzinho um fetch de verdade, só que sem backend. Teu trampo é o useEffect.',
        missao: 'buscar os dados na montagem e jogar no state — os 3 produtos têm que aparecer na lista.',
        starter: '// buscarProdutos() já existe e devolve uma Promise\n// (igual um fetch, só que sem backend)\n\nfunction App() {\n  const [produtos, setProdutos] = useState([]);\n\n  // useEffect: chama buscarProdutos()\n  // e joga o resultado no state\n\n  return (\n    <ul>\n      {produtos.map(p => <li key={p.id}>{p.nome}</li>)}\n    </ul>\n  );\n}',
        preambulo: "function buscarProdutos() {\n  return new Promise(resolve => setTimeout(() => resolve([\n    { id: 1, nome: 'Fone brabo' },\n    { id: 2, nome: 'Teclado gamer' },\n    { id: 3, nome: 'Mouse do corre' }\n  ]), 700));\n}",
        esperado: ['Fone brabo', 'Teclado gamer', 'Mouse do corre'],
        dicasAuto: [
          { re: 'useEffect', falta: 'A busca vai dentro de um useEffect(() => { ... }, []) — efeito de montagem.' },
          { re: 'buscarProdutos\\(\\)', falta: 'Chama a função: buscarProdutos().then(...)' },
          { re: 'setProdutos', falta: 'Quando os dados chegarem, joga no state: .then(setProdutos).' },
          { re: '\\[\\]\\s*\\)', falta: 'Não esquece o array de dependências vazio [] no final do useEffect — senão vira loop infinito de requisição!' },
        ],
        dicas: [
          'Estrutura: useEffect(() => { ... }, []);',
          'Dentro dele: buscarProdutos().then(setProdutos);',
          'O .then(setProdutos) é atalho pra .then(dados => setProdutos(dados)).',
        ],
        gabarito: 'function App() {\n  const [produtos, setProdutos] = useState([]);\n\n  useEffect(() => {\n    buscarProdutos().then(setProdutos);\n  }, []);\n\n  return (\n    <ul>\n      {produtos.map(p => <li key={p.id}>{p.nome}</li>)}\n    </ul>\n  );\n}',
      },
      {
        tipo: 'quiz',
        q: 'Apareceu erro de CORS no console do navegador. O que rolou?',
        opts: [
          'O banco de dados caiu',
          'O navegador bloqueou porque o back não autorizou a origem do front',
          'Erro de sintaxe no JSX',
          'A internet caiu no meio da requisição',
        ],
        correct: 1,
        explain: 'CORS é o navegador te protegendo. A correção é no BACKEND: liberar a origem com @CrossOrigin ou config global.',
      },
      {
        tipo: 'encaixe',
        enunciado: 'Encaixa o fluxo de uma requisição, do clique até o dado voltar:',
        pecas: [
          'React dispara o fetch pro endpoint',
          'Controller recebe a requisição HTTP',
          'Service aplica a regra de negócio',
          'Repository consulta o banco de dados',
          'A resposta volta pro front virando JSON',
        ],
        explain: 'Front chama → Controller recebe → Service pensa → Repository busca → e a resposta refaz o caminho virando JSON. Esse é o esqueleto de TODO app fullstack.',
      },
      {
        tipo: 'quiz',
        q: 'Quem transforma o objeto Java em JSON na resposta da API?',
        opts: [
          'Você, montando a string na mão sempre',
          'O Spring (via Jackson) serializa automaticamente',
          'O navegador do usuário',
          'O MySQL',
        ],
        correct: 1,
        explain: 'Com @RestController, o retorno do método passa pelo Jackson e vira JSON sozinho. Você devolve o objeto, o Spring cuida do resto.',
      },
    ],
  },
];
