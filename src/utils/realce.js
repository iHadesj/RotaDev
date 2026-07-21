/* Realce de sintaxe caseiro (sem lib de CDN — o app é todo offline).
   Tokeniza JS/TS (e dá conta razoável de Java) e devolve HTML com spans
   .tk-* que o CSS pinta nas cores do Dracula. O texto é escapado, então
   é seguro jogar no dangerouslySetInnerHTML do <pre> por trás do editor. */

const PALAVRAS = new Set([
  // JS / TS
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "do", "switch", "case", "break", "continue", "new", "delete", "typeof",
  "instanceof", "void", "class", "extends", "super", "import", "export",
  "from", "default", "try", "catch", "finally", "throw", "async", "await",
  "yield", "static", "get", "set", "as", "in", "of", "with", "debugger",
  // TS
  "public", "private", "protected", "readonly", "abstract", "interface",
  "type", "enum", "namespace", "implements", "declare", "keyof", "infer",
  "is", "asserts", "satisfies", "override", "module",
  // Java (pra não ficar cru nos desafios de Java)
  "package", "int", "boolean", "char", "long", "double", "float", "short",
  "byte", "final", "native", "synchronized", "transient", "volatile",
  "throws", "String",
]);

const LITERAIS = new Set([
  "true", "false", "null", "undefined", "NaN", "Infinity", "this", "super",
  "arguments", "globalThis",
]);

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ordem importa: comentário > string > número > identificador > espaço > resto
const RE = new RegExp(
  [
    "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)", // 1 comentário
    "(`(?:\\\\[\\s\\S]|[^`\\\\])*`|\"(?:\\\\[\\s\\S]|[^\"\\\\\\n])*\"|'(?:\\\\[\\s\\S]|[^'\\\\\\n])*')", // 2 string
    "(\\b0[xXbBoO][0-9a-fA-F_]+\\b|\\b\\d[\\d_]*\\.?\\d*(?:[eE][+-]?\\d+)?\\b)", // 3 número
    "([A-Za-z_$][\\w$]*)", // 4 identificador
    "(\\s+)", // 5 espaço
    "([\\s\\S])", // 6 resto (pontuação/operador, ou string ainda aberta)
  ].join("|"),
  "g",
);

export function realca(codigo, _lang) {
  let out = "";
  let m;
  RE.lastIndex = 0;
  while ((m = RE.exec(codigo))) {
    const [, com, str, num, ident, ws] = m;
    if (com != null) {
      out += '<span class="tk-com">' + esc(com) + "</span>";
    } else if (str != null) {
      out += '<span class="tk-str">' + esc(str) + "</span>";
    } else if (num != null) {
      out += '<span class="tk-num">' + esc(num) + "</span>";
    } else if (ident != null) {
      let cls;
      if (PALAVRAS.has(ident)) cls = "tk-kw";
      else if (LITERAIS.has(ident)) cls = "tk-lit";
      else {
        const resto = codigo.slice(RE.lastIndex);
        if (/^\s*\(/.test(resto)) cls = "tk-fn";
        else if (/^[A-Z]/.test(ident)) cls = "tk-cls";
        else cls = "tk-var";
      }
      out += '<span class="' + cls + '">' + esc(ident) + "</span>";
    } else if (ws != null) {
      out += esc(ws);
    } else {
      out += esc(m[6]);
    }
  }
  return out;
}
