import { useEffect } from "react";
import { motion } from "framer-motion";
import { chuvaDeConfete, getLevel, itemLado, listaStagger, springMedio } from "../../config/appConfig.js";
import { Icon, Letreiro, XPBar } from "../../components/ui/index.jsx";
import { calcXP } from "../../services/progressService.js";

export function TelaTrilha({ curso, scores, onAbrir, onReset, onTrocarCurso }) {
  const modules = curso.modules;
  const xp = calcXP(scores, modules);
  const completos = modules.filter((m) => (scores[m.id] || 0) >= 3).length;
  const zerou = completos === modules.length;

  useEffect(() => {
    if (zerou) chuvaDeConfete();
  }, [zerou]);

  return (
    <div>
      <Letreiro mini rota={curso.rota} destino="Escolhe seu ponto" />
      <XPBar xp={xp} />
      <motion.div
        className="trilha"
        variants={listaStagger}
        initial="inicial"
        animate="entra"
      >
        {modules.map((m, i) => {
          const score = scores[m.id];
          const feito = (score || 0) >= 3;
          const liberado = i === 0 || (scores[modules[i - 1].id] || 0) >= 3;
          const atual = liberado && !feito;
          return (
            <motion.div className="parada" key={m.id} variants={itemLado}>
              <span
                className={
                  "parada-dot" +
                  (feito
                    ? " parada-dot--feito"
                    : atual
                      ? " parada-dot--atual"
                      : "")
                }
              >
                {feito ? <Icon name="check" title="Concluído" /> : String(i + 1).padStart(2, "0")}
              </span>
              <button
                className="parada-card"
                disabled={!liberado}
                onClick={() => onAbrir(i)}
              >
                <span className="parada-tag">
                  <span>
                    {m.tag}
                    {!liberado && (
                      <span className="icon-line"> · <Icon name="lock" /> fechado</span>
                    )}
                  </span>
                  {score !== undefined && (
                    <span className="parada-score">
                      melhor: {score}/{m.desafios.length}
                    </span>
                  )}
                </span>
                <p className="parada-nome">{m.nome}</p>
                <p className="parada-local"><Icon name="pin" /> {m.ponto}</p>
                <p className="parada-desc">{m.desc}</p>
              </button>
            </motion.div>
          );
        })}
      </motion.div>
      {zerou && (
        <motion.div
          className="card card--cor"
          style={{ background: "var(--lima)" }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springMedio}
        >
          <p className="trofeu"><Icon name="trophy" title="Troféu" /></p>
          <p
            className="card-titulo"
            style={{
              display: "block",
              textAlign: "center",
              background: "none",
            }}
          >
            Zerou a linha!
          </p>
          <p className="card-txt" style={{ textAlign: "center" }}>
            Do {modules[0].ponto} até a {modules[modules.length - 1].ponto}:{" "}
            <strong>{getLevel(xp).nome}</strong> com {xp} XP. {curso.finalTxt}
          </p>
        </motion.div>
      )}
      <div className="stack">
        <button className="btn btn-fantasma" onClick={onTrocarCurso}>
          <Icon name="return" className="icon--leading" />
          Trocar de linha (outro curso)
        </button>
      </div>
      <p className="footer-note">
        Refazer um desafio atualiza sua melhor pontuação.{" "}
        <button className="link-reset" onClick={onReset}>
          Zerar progresso desta linha
        </button>
      </p>
    </div>
  );
}
