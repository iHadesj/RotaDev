import { motion } from "framer-motion";
import { springMedio } from "../../config/appConfig.js";
import { Icon } from "../ui/index.jsx";

export function PainelLint({ itens }) {
  if (!itens || !itens.length) return null;
  const icone = { erro: "alert", aviso: "warning", dica: "idea" };
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
          <span className="lint-emoji">
            <Icon name={icone[it.nivel] || "idea"} className="lint-icon" />
          </span>
          <span>{it.msg}</span>
        </motion.div>
      ))}
    </div>
  );
}
