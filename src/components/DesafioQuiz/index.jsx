import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { estouraConfete, itemSobe, listaStagger, springMedio } from "../../config/appConfig.js";
import { Icon } from "../ui/index.jsx";

const LETRAS = ["A", "B", "C", "D"];

export function DesafioQuiz({ d, onResolvido }) {
  const [sel, setSel] = useState(null);
  const respondeu = sel !== null;
  const acertou = respondeu && sel === d.correct;

  useEffect(() => {
    if (acertou)
      estouraConfete({ particleCount: 45, spread: 60, origin: { y: 0.75 } });
  }, [acertou]);

  return (
    <div className="card">
      <p className="quiz-q">{d.q}</p>
      {d.code && <code className="code">{d.code}</code>}
      <motion.div
        className="opts"
        variants={listaStagger}
        initial="inicial"
        animate="entra"
      >
        {d.opts.map((o, idx) => {
          let cls = "opt";
          if (respondeu) {
            if (idx === d.correct) cls += " opt--certa opt--pula";
            else if (idx === sel) cls += " opt--errada opt--shake";
            else cls += " opt--apagada";
          }
          return (
            <motion.button
              key={idx}
              className={cls}
              disabled={respondeu}
              onClick={() => setSel(idx)}
              variants={itemSobe}
              whileTap={{ scale: 0.98 }}
            >
              <span className="opt-letra">{LETRAS[idx]}</span>
              <span>{o}</span>
            </motion.button>
          );
        })}
      </motion.div>
      {respondeu && (
        <motion.div
          className={
            "feedback " + (acertou ? "feedback--ok" : "feedback--ruim")
          }
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={springMedio}
        >
          <p className="feedback-titulo">
            <Icon name={acertou ? "check" : "cross"} className="icon--leading" />
            {acertou ? "Boa, acertou!" : "Não foi dessa vez"}
          </p>
          <p className="feedback-txt">{d.explain}</p>
        </motion.div>
      )}
      {respondeu && (
        <motion.div
          className="stack"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <button
            className="btn btn-laranja"
            onClick={() => onResolvido(acertou)}
          >
            Próxima <Icon name="arrowRight" className="icon--trailing" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
