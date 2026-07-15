import { CURSOS } from "../src/data/curriculum.js";
import fs from "node:fs";

const supportedTypes = new Set(["quiz", "encaixe", "code"]);
const ids = new Set();
const errors = [];

const appSource = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
if (appSource.includes("<style>{CSS}</style>")) {
  errors.push("App.jsx: injeção legada <style>{CSS}</style> ainda presente");
}
let lessonCount = 0;
let challengeCount = 0;
let projectCount = 0;

for (const course of CURSOS) {
  if (!course.modules.length) errors.push(`${course.id}: curso sem módulos`);

  for (const module of course.modules) {
    const path = `${course.id}/${module.id}`;
    if (ids.has(module.id)) errors.push(`${path}: id de módulo duplicado`);
    ids.add(module.id);

    if (!module.nome || !module.desc || !module.ponto) {
      errors.push(`${path}: metadados obrigatórios ausentes`);
    }
    if (!Array.isArray(module.lessons) || module.lessons.length < 3) {
      errors.push(`${path}: precisa ter pelo menos 3 conceitos`);
    }
    if (!Array.isArray(module.desafios) || module.desafios.length < 5) {
      errors.push(`${path}: precisa ter pelo menos 5 desafios`);
    }

    lessonCount += module.lessons?.length ?? 0;
    challengeCount += module.desafios?.length ?? 0;

    if (module.projeto) {
      projectCount += 1;
      if (!module.projeto.entrega || module.projeto.criterios?.length < 4) {
        errors.push(`${path}: projeto sem entrega ou critérios suficientes`);
      }
    }

    for (const [index, challenge] of (module.desafios ?? []).entries()) {
      const challengePath = `${path}/desafio-${index + 1}`;
      if (!supportedTypes.has(challenge.tipo)) {
        errors.push(`${challengePath}: tipo ${challenge.tipo} não suportado`);
      }
      if (challenge.tipo === "quiz") {
        if (challenge.opts?.length !== 4) errors.push(`${challengePath}: quiz precisa de 4 opções`);
        if (challenge.correct < 0 || challenge.correct >= challenge.opts?.length) {
          errors.push(`${challengePath}: resposta correta inválida`);
        }
      }
      if (challenge.tipo === "encaixe" && challenge.pecas?.length < 2) {
        errors.push(`${challengePath}: encaixe precisa de pelo menos 2 peças`);
      }
      if (challenge.tipo === "code" && (!challenge.lang || !challenge.starter)) {
        errors.push(`${challengePath}: desafio de código sem linguagem ou starter`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Currículo válido: ${CURSOS.length} cursos, ${ids.size} módulos, ${lessonCount} conceitos, ${challengeCount} desafios e ${projectCount} projetos.`,
);
