import { useEffect } from "react";
import { motion } from "framer-motion";
import { chuvaDeConfete, estouraConfete, springMedio } from "../../config/appConfig.js";
import { Icon, Letreiro } from "../../components/ui/index.jsx";
import { useContagem } from "../../hooks/useContagem.js";

export function TelaResultado({
  modulo,
  score,
  xpGanho,
  ehUltimo,
  onRefazer,
  onTrilha,
}) {
  const total = modulo.desafios.length;
  const passou = score >= 3;
  const scoreAnimado = useContagem(score);

  useEffect(() => {
    if (score === total) chuvaDeConfete();
    else if (passou) estouraConfete();
    // dispara uma vez, na entrada da tela
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let msg;
  if (score === total) msg = "GABARITOU!";
  else if (score >= 4) msg = "Mandou muito bem!";
  else if (score >= 3) msg = "Passou! Está no caminho.";
  else msg = "Foi por pouco... revisa e tenta de novo.";
  return (
    <div>
      <Letreiro
        mini
        rota={modulo.tag + " · resultado"}
        destino={modulo.ponto}
      />
      <motion.div
        className="card card--cor"
        style={{ background: passou ? "var(--lima)" : "var(--salmao)" }}
        initial={{ scale: 0.9, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={springMedio}
      >
        <p className="placar">
          {scoreAnimado}/{total}
        </p>
        <p className="placar-sub">{msg}</p>
        {xpGanho > 0 && (
          <motion.p
            className="placar-xp"
            initial={{ scale: 0, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...springMedio, delay: 0.5 }}
          >
            +{xpGanho} XP
          </motion.p>
        )}
        {!passou && (
          <p
            className="card-txt"
            style={{ textAlign: "center", marginTop: 12 }}
          >
            Precisa de 3 acertos pra liberar o próximo ponto. Revisa os
            conceitos e tenta de novo — ninguém aprende de primeira mesmo.
            (Desafio fechado com gabarito não pontua, mas ensina igual.)
          </p>
        )}
        {passou && ehUltimo && (
          <p
            className="card-txt"
            style={{ textAlign: "center", marginTop: 12 }}
          >
            Último ponto concluído! Volta pra trilha pra ver seu troféu.
            <Icon name="trophy" className="icon--trailing" />
          </p>
        )}
      </motion.div>
      <div className="stack">
        <button className="btn btn-laranja" onClick={onTrilha}>
          Voltar pra trilha
        </button>
        <button className="btn btn-fantasma" onClick={onRefazer}>
          Refazer (revisa e tenta de novo)
        </button>
      </div>
    </div>
  );
}
