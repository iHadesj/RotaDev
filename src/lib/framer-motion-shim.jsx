// Shim do framer-motion pro Switch (WebKit antigo).
//
// framer-motion 12 usa APIs modernas (Web Animations API, etc.) que podem
// quebrar no motor de render do console. Aqui a gente troca ele por
// elementos DOM normais: as animações somem, mas TODO o resto (layout,
// conteúdo, cliques, lógica do jogo) continua igual. É o "sacrifício"
// consciente pra garantir que roda de primeira.
//
// Plugado via alias no vite.config.js: `framer-motion` -> este arquivo.
// Assim o App.jsx nem precisa mudar os imports.

import React from "react";

// Props que só o framer entende — precisam ser removidas antes de ir pro
// DOM, senão o React reclama (e o browser ignora / erra).
const PROPS_FRAMER = new Set([
  "initial", "animate", "exit", "variants", "transition",
  "whileHover", "whileTap", "whileFocus", "whileInView", "whileDrag",
  "drag", "dragConstraints", "dragElastic", "dragMomentum", "dragSnapToOrigin",
  "dragTransition", "dragListener", "dragControls", "dragDirectionLock",
  "layout", "layoutId", "layoutDependency", "layoutScroll", "layoutRoot",
  "viewport", "custom", "inherit", "transformTemplate",
  "onAnimationStart", "onAnimationComplete", "onUpdate",
  "onDrag", "onDragStart", "onDragEnd", "onDragTransitionEnd",
  "onHoverStart", "onHoverEnd", "onTap", "onTapStart", "onTapCancel",
  "onViewportEnter", "onViewportLeave", "onLayoutAnimationStart",
  "onLayoutAnimationComplete", "onBeforeLayoutMeasure",
]);

const cache = {};

function componenteMotion(tag) {
  if (cache[tag]) return cache[tag];
  const Comp = React.forwardRef(function (props, ref) {
    const limpo = {};
    for (const chave in props) {
      if (!PROPS_FRAMER.has(chave)) limpo[chave] = props[chave];
    }
    limpo.ref = ref;
    return React.createElement(tag, limpo);
  });
  Comp.displayName = "motion." + tag;
  cache[tag] = Comp;
  return Comp;
}

// motion.div, motion.button, motion.span... resolvidos sob demanda.
export const motion = new Proxy(
  {},
  {
    get(_alvo, tag) {
      return componenteMotion(typeof tag === "string" ? tag : "div");
    },
  }
);

// Estes três viram passthrough: renderizam os filhos e ignoram o resto.
export function AnimatePresence(props) {
  return React.createElement(React.Fragment, null, props.children);
}

export function MotionConfig(props) {
  return React.createElement(React.Fragment, null, props.children);
}

export function LayoutGroup(props) {
  return React.createElement(React.Fragment, null, props.children);
}

// Alguns imports (raros) esperam um default; deixa disponível por garantia.
export default { motion, AnimatePresence, MotionConfig, LayoutGroup };
