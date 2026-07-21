import confetti from "canvas-confetti";

export const STORAGE_KEY = "dev_do_corre_v1";
export const TEMA_KEY = "dev_do_corre_tema_v1";
export const CURSO_KEY = "dev_do_corre_curso_v1";

export const TEMAS = [
  { id: "padrao", nome: "5X-Sul (claro)", cor: "#FF4D00", papel: "#EFE9DC" },
  { id: "noite", nome: "Noite neobrutalista", cor: "#FF7545", papel: "#14161F" },
  { id: "vapor", nome: "Vapor (rosa)", cor: "#FF2E88", papel: "#FBE8EF" },
  { id: "taxi", nome: "Táxi (amarelo)", cor: "#FFB800", papel: "#F5F1DC" },
];

export const LEVELS = [
  { min: 0, nome: "Estagiário do Corre" },
  { min: 160, nome: "Dev Júnior" },
  { min: 320, nome: "Dev Pleno" },
  { min: 500, nome: "Dev Sênior" },
  { min: 700, nome: "Tech Lead do Extremo Sul" },
];

export function getLevel(xp) {
  let atual = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) atual = l;
  const idx = LEVELS.indexOf(atual);
  const prox = LEVELS[idx + 1] || null;
  return { ...atual, prox };
}

/* ---------- animações (framer-motion + confete) ---------- */

export const springMedio = { type: "spring", stiffness: 420, damping: 30 };

export const telaVariants = {
  inicial: { opacity: 0, x: 40 },
  entra: { opacity: 1, x: 0, transition: { duration: 0.28, ease: "easeOut" } },
  sai: { opacity: 0, x: -40, transition: { duration: 0.18, ease: "easeIn" } },
};

export const listaStagger = {
  entra: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

export const itemSobe = {
  inicial: { opacity: 0, y: 18 },
  entra: { opacity: 1, y: 0, transition: springMedio },
};

export const itemLado = {
  inicial: { opacity: 0, x: -28 },
  entra: { opacity: 1, x: 0, transition: springMedio },
};

const CORES_CONFETE = ["#FF4D00", "#B8F53C", "#2B2BFF", "#0D0D0D", "#FFF3B0"];

export function estouraConfete(opts = {}) {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.6 },
    colors: CORES_CONFETE,
    disableForReducedMotion: true,
    ...opts,
  });
}

export function chuvaDeConfete() {
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
