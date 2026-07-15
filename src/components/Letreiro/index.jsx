import { motion } from "framer-motion";
import { springMedio } from "../../config/appConfig.js";

export function Letreiro({ rota, destino, sub, mini }) {
  return (
    <motion.div
      className={"letreiro" + (mini ? " letreiro--mini" : "")}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springMedio}
    >
      {rota && (
        <p className="letreiro-rota">
          <span className="letreiro-rota-texto">
            <span>{rota}&nbsp;&nbsp;+++&nbsp;&nbsp;</span>
            <span aria-hidden="true">{rota}&nbsp;&nbsp;+++&nbsp;&nbsp;</span>
          </span>
        </p>
      )}
      <p className="letreiro-dest">
        {destino}
        <span className="cursor-bloco" aria-hidden="true" />
      </p>
      {sub && <p className="letreiro-sub">{sub}</p>}
    </motion.div>
  );
}
