import { STORAGE_KEY } from "../config/appConfig.js";
import { DESAFIOS_DIARIOS } from "../data/curriculum.js";

// fora do Claude o progresso vai no localStorage do navegador.
// Formato atual: { cursos: { fullstack: { scores }, web: { scores } } }
// (migra sozinho do formato antigo, que era { scores } só do fullstack)
export async function carregarProgresso() {
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

export async function salvarProgresso(p) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch (e) {
    console.error("falha ao salvar:", e);
  }
}

export function scoresDoCurso(progresso, cursoId) {
  return (
    (progresso &&
      progresso.cursos &&
      progresso.cursos[cursoId] &&
      progresso.cursos[cursoId].scores) ||
    {}
  );
}

/* ---------- MODO TREINO 💪 · problemas resolvidos ----------
   Progresso próprio, fora dos cursos: { resolvidos: { id: true } }.
   Só marca quem passou SEM colar gabarito. */

const PRATICA_KEY = "dev_do_corre_pratica_v1";

export function carregaPratica() {
  try {
    return JSON.parse(localStorage.getItem(PRATICA_KEY)) || { resolvidos: {} };
  } catch (e) {
    return { resolvidos: {} };
  }
}
export function salvaPratica(p) {
  try {
    localStorage.setItem(PRATICA_KEY, JSON.stringify(p));
  } catch (e) {
    /* sem storage, o progresso vive só na sessão */
  }
}

/* ---------- CORRE DO DIA · streak 🔥 ---------- */

const DIARIO_KEY = "dev_do_corre_diario_v1";

export function dataStr(d) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}
export function hojeStr() {
  return dataStr(new Date());
}
export function ontemStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dataStr(d);
}

export function carregaDiario() {
  try {
    return JSON.parse(localStorage.getItem(DIARIO_KEY)) || null;
  } catch (e) {
    return null;
  }
}
export function salvaDiario(d) {
  try {
    localStorage.setItem(DIARIO_KEY, JSON.stringify(d));
  } catch (e) {
    /* sem storage, o fogo vive só na sessão */
  }
}

// streak só vale se o último corre foi hoje ou ontem — pulou um dia, apagou
export function streakAtual(diario) {
  if (!diario) return 0;
  return diario.ultimoDia === hojeStr() || diario.ultimoDia === ontemStr()
    ? diario.streak
    : 0;
}
export function feitoHoje(diario) {
  return !!diario && diario.ultimoDia === hojeStr();
}
export function registraDiario(diario) {
  const hoje = hojeStr();
  if (diario && diario.ultimoDia === hoje) return diario;
  const streak = diario && diario.ultimoDia === ontemStr() ? diario.streak + 1 : 1;
  return {
    streak,
    melhor: Math.max(streak, (diario && diario.melhor) || 0),
    ultimoDia: hoje,
  };
}

// gerador determinístico: o MESMO dia sorteia a MESMA sessão pra todo mundo
export function rndDoDia(semente) {
  let h = 2166136261;
  for (let i = 0; i < semente.length; i++) {
    h ^= semente.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// a sessão do dia: 1 conceito do módulo atual da linha + 2 desafios
// EXCLUSIVOS do diário (banco próprio, mesmo tema da matéria — nada
// de repetir os desafios da trilha). Linha zerada? Vira revisão.
export function montaCorreDoDia(curso, scores) {
  const rnd = rndDoDia(hojeStr() + "·" + curso.id);
  const mods = curso.modules;
  let mod = mods.find((m) => (scores[m.id] || 0) < 3);
  const revisao = !mod;
  if (!mod) mod = mods[Math.floor(rnd() * mods.length)];
  const lesson = mod.lessons[Math.floor(rnd() * mod.lessons.length)];
  const pool = DESAFIOS_DIARIOS[mod.id] || mod.desafios;
  const i1 = Math.floor(rnd() * pool.length);
  let i2 = Math.floor(rnd() * (pool.length - 1));
  if (i2 >= i1) i2++;
  return { mod, lesson, desafios: [pool[i1], pool[i2]], revisao };
}

export function calcXP(scores, modules) {
  let xp = 0;
  for (const m of modules) {
    const s = scores[m.id] || 0;
    xp += s * 20;
    if (s === m.desafios.length) xp += 15; // bônus de gabaritar
  }
  return xp;
}
