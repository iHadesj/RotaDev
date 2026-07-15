import { motion } from "framer-motion";
import { getLevel, springMedio } from "../../config/appConfig.js";
import { useContagem } from "../../hooks/useContagem.js";

export function XPBar({ xp }) {
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
