import fs from "node:fs";
import path from "node:path";
import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";

const traverse = traverseModule.default || traverseModule;
const sourceRoot = new URL("../src/", import.meta.url);
const browserGlobals = new Set(
  [
    "Array", "Blob", "Boolean", "CSS", "Date", "Error", "Infinity",
    "Intl", "JSON", "Map", "Math", "NaN", "Number", "Object", "Promise",
    "RegExp", "Set", "String", "TypeError", "URL", "atob", "btoa",
    "cancelAnimationFrame", "clearTimeout", "confirm", "console", "crypto",
    "document", "fetch", "localStorage", "navigator", "performance",
    "requestAnimationFrame", "setTimeout", "undefined", "window",
  ],
);

const errors = [];

for (const file of listSourceFiles(sourceRoot)) {
  const source = fs.readFileSync(file, "utf8");
  const ast = parse(source, { sourceType: "module", plugins: ["jsx"] });
  const missing = new Map();

  traverse(ast, {
    ReferencedIdentifier(identifierPath) {
      const name = identifierPath.node.name;
      if (identifierPath.scope.hasBinding(name) || browserGlobals.has(name)) return;
      const lines = missing.get(name) || new Set();
      lines.add(identifierPath.node.loc.start.line);
      missing.set(name, lines);
    },
  });

  for (const [name, lines] of missing) {
    errors.push(
      `${path.relative(fileURLToPath(sourceRoot), file)}: ${name} não declarado (linha ${[...lines].join(", ")})`,
    );
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Código válido: nenhuma referência JavaScript sem declaração em src/.");

function listSourceFiles(directoryUrl) {
  const directory = fileURLToPath(directoryUrl);
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryUrl = new URL(entry.name + (entry.isDirectory() ? "/" : ""), directoryUrl);
    if (entry.isDirectory()) return listSourceFiles(entryUrl);
    return /\.(js|jsx)$/.test(entry.name) ? [fileURLToPath(entryUrl)] : [];
  });
}

function fileURLToPath(url) {
  return decodeURIComponent(url.pathname.replace(/^\/(.:\/)/, "$1"));
}
