export function embaralha(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function embaralhaDiferente(arr) {
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
export function lintDelimitadores(codigo) {
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
export function lintJava(codigo) {
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
export function lintJSX(codigo) {
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
export function lintHTML(codigo) {
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
export function lintJS(codigo) {
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
export function traduzErro(msg) {
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

export function escapaScript(s) {
  return String(s).replace(/<\/script/gi, "<\\/script");
}

/* MODO BUSÃO 🚌 — o iframe do sandbox tem origem opaca (sandbox=
   "allow-scripts"), então as requisições dele NÃO passam por caminho
   normal de resolução de módulo. Pro desafio rodar offline, o app baixa
   o TEXTO das libs por aqui (fetch same-origin contra o RomFS) e embute
   inline no srcdoc. Enquanto o texto não chegou, cai pro <script src>
   local (que também resolve a partir do RomFS).
   As libs são vendorizadas em public/vendor/ (React/ReactDOM 18.2.0 +
   babel-standalone 7.23.5) — nada de CDN, tudo offline. */
const LIB_REACT = "/vendor/react.development.js";
const LIB_REACT_DOM = "/vendor/react-dom.development.js";
const LIB_BABEL = "/vendor/babel.min.js";
const LIBS_POR_LANG = {
  jsx: [LIB_REACT, LIB_REACT_DOM, LIB_BABEL],
  ts: [LIB_BABEL],
};
const libsTexto = {}; // url -> fonte da lib, pronta pra inlinar
const libsBaixando = {};

export function preCarregaLibs(lang) {
  for (const url of LIBS_POR_LANG[lang] || []) {
    if (libsTexto[url] || libsBaixando[url]) continue;
    libsBaixando[url] = fetch(url)
      .then((r) => (r.ok ? r.text() : null))
      .then((t) => {
        if (t) libsTexto[url] = t;
        delete libsBaixando[url];
      })
      .catch(() => {
        delete libsBaixando[url];
      });
  }
}

export function tagLib(url) {
  if (libsTexto[url]) {
    return "<script>" + escapaScript(libsTexto[url]) + "</" + "script>";
  }
  return '<script src="' + url + '"></' + "script>";
}

export function montaSrcDoc(codigo, preambulo) {
  const user = escapaScript((preambulo ? preambulo + "\n\n" : "") + codigo);
  return [
    '<!DOCTYPE html><html><head><meta charset="utf-8"/>',
    tagLib(LIB_REACT),
    tagLib(LIB_REACT_DOM),
    tagLib(LIB_BABEL),
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

export function montaSrcDocWeb(codigo, lang, htmlBase, preambulo) {
  const estilo =
    "<style>body{font-family:system-ui,-apple-system,sans-serif;background:#ffffff;color:#0D0D0D;padding:14px;margin:0;font-size:15px}</style>";
  const cabeca = '<!DOCTYPE html><html><head><meta charset="utf-8"/>' + estilo;

  if (lang === "html") {
    // o código do aluno É a página (pode trazer <style> junto)
    return cabeca + REPORTER_WEB + "</head><body>" + codigo + "</body></html>";
  }

  // js / ts: base HTML opcional + script do aluno
  const user = escapaScript((preambulo ? preambulo + "\n\n" : "") + codigo);
  const babel = lang === "ts" ? tagLib(LIB_BABEL) : "";
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

/* ---------- SANDBOX 3: CASOS DE TESTE (função + entrada→saída) ----------
   Modo Treino: o aluno escreve uma função NOMEADA e a gente roda uma
   bateria de casos contra ela, tipo LeetCode/Codewars. O código do aluno
   e o "harness" (que chama a função e compara) vão no MESMO <script> pra
   a função ficar no escopo — em ts o Babel transpila os dois juntos.
   Loop infinito trava a thread do iframe (nenhum timer interno dispara),
   então quem mata é o WATCHDOG no componente pai (ver DesafioTeste). */
export function montaSrcDocTeste(codigo, lang, nomeFuncao, casos) {
  const casosJson = escapaScript(JSON.stringify(casos || []));
  const abreScript =
    lang === "ts"
      ? '<script type="text/babel" data-presets="typescript">'
      : "<script>";
  const babel = lang === "ts" ? tagLib(LIB_BABEL) : "";
  return [
    '<!DOCTYPE html><html><head><meta charset="utf-8"/>',
    babel,
    "<script>",
    'window.onerror=function(m){parent.postMessage({ddc:1,tipo:"teste-erro",msg:String(m)},"*");return true;};',
    // espelha o console do aluno pra fora (log/warn/error) — assim quem
    // quer depurar com console.log vê a saída crua no painel Console
    'function _fmt(args){return Array.prototype.slice.call(args).map(function(x){try{return typeof x==="object"?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(" ");}',
    "var _log=console.log,_warn=console.warn,_err=console.error;",
    'console.log=function(){parent.postMessage({ddc:1,tipo:"teste-log",nivel:"log",texto:_fmt(arguments)},"*");_log.apply(console,arguments);};',
    // o Babel-standalone cospe um warn "in-browser transformer" toda vez —
    // isso é ruído nosso, não do aluno, então segura esse específico
    'console.warn=function(){var _t=_fmt(arguments);if(!/in-browser Babel|babeljs\\.io/i.test(_t)){parent.postMessage({ddc:1,tipo:"teste-log",nivel:"warn",texto:_t},"*");}_warn.apply(console,arguments);};',
    'console.error=function(){parent.postMessage({ddc:1,tipo:"teste-log",nivel:"error",texto:_fmt(arguments)},"*");_err.apply(console,arguments);};',
    "</" + "script>",
    "</head><body>",
    abreScript,
    "// ----- código do aluno -----",
    escapaScript(codigo),
    "// ----- harness dos casos de teste -----",
    ";(function(){",
    '  function P(o){o.ddc=1;parent.postMessage(o,"*");}',
    "  var CASOS = " + casosJson + ";",
    '  if (typeof ' + nomeFuncao + ' !== "function") {',
    '    P({tipo:"teste-erro",msg:"SEM_FUNCAO:' + nomeFuncao + '"});return;',
    "  }",
    "  var fn = " + nomeFuncao + ";",
    '  P({tipo:"teste-inicio",total:CASOS.length});',
    "  for (var i = 0; i < CASOS.length; i++) {",
    "    var c = CASOS[i];",
    "    try {",
    "      var rec = fn.apply(null, c.entrada);",
    "      var recS = JSON.stringify(rec);",
    "      var espS = JSON.stringify(c.esperado);",
    '      P({tipo:"teste-caso",idx:i,passou:recS===espS,recebido:recS===undefined?"undefined":recS,esperado:espS});',
    "    } catch (e) {",
    '      P({tipo:"teste-caso",idx:i,passou:false,erro:true,recebido:"💥 "+String((e&&e.message)||e),esperado:JSON.stringify(c.esperado)});',
    "    }",
    "  }",
    '  P({tipo:"teste-fim"});',
    "})();",
    "</" + "script></body></html>",
  ].join("\n");
}

/* ============================ ESTILO ============================ */
