import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { springMedio } from "../../config/appConfig.js";
import { NOME_TIPO_DESAFIO } from "../../config/challengeConfig.js";
import { DesafioCode, DesafioEncaixe, DesafioQuiz } from "../../components/challenges/index.jsx";
import { EntregaProjeto } from "../../components/EntregaProjeto/index.jsx";
import { Letreiro } from "../../components/ui/index.jsx";

export function TelaDesafios({ modulo, onFim, onVoltar }) {
  const [qi, setQi] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [streak, setStreak] = useState(0);
  const [aguardandoEntrega, setAguardandoEntrega] = useState(false);

  const d = modulo.desafios[qi];
  const ultima = qi === modulo.desafios.length - 1;

  function resolvido(pontuou) {
    const novoAcertos = pontuou ? acertos + 1 : acertos;
    if (pontuou) setStreak((s) => s + 1);
    else setStreak(0);
    setAcertos(novoAcertos);
    if (ultima && modulo.projeto) setAguardandoEntrega(true);
    else if (ultima) onFim(novoAcertos);
    else setQi(qi + 1);
  }

  if (aguardandoEntrega) {
    return (
      <div>
        <Letreiro mini rota={modulo.tag + " · entrega"} destino={modulo.nome} />
        <EntregaProjeto
          projeto={modulo.projeto}
          onConcluir={() => onFim(acertos)}
        />
        <div className="stack">
          <button className="btn btn-fantasma" onClick={onVoltar}>
            Voltar pra trilha (entrega ainda não validada)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Letreiro mini rota={modulo.tag + " · desafios"} destino={modulo.nome} />
      <div className="quiz-topo">
        <span>
          Desafio {qi + 1} / {modulo.desafios.length}
        </span>
        <motion.span
          key={"badge-" + qi}
          className="tipo-badge"
          initial={{ scale: 1.4, rotate: -4 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={springMedio}
          style={{ display: "inline-block" }}
        >
          {NOME_TIPO_DESAFIO[d.tipo]}
        </motion.span>
        <span>
          <motion.span
            key={"pts-" + acertos}
            initial={{ scale: 1.6 }}
            animate={{ scale: 1 }}
            transition={springMedio}
            style={{ display: "inline-block" }}
          >
            ✔ {acertos}
          </motion.span>
          {streak >= 2 && <span className="quiz-streak"> · 🔥x{streak}</span>}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={qi}
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -36 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {d.tipo === "quiz" && <DesafioQuiz d={d} onResolvido={resolvido} />}
          {d.tipo === "encaixe" && (
            <DesafioEncaixe d={d} onResolvido={resolvido} />
          )}
          {d.tipo === "code" && <DesafioCode d={d} onResolvido={resolvido} />}
        </motion.div>
      </AnimatePresence>
      <div className="stack">
        <button className="btn btn-fantasma" onClick={onVoltar}>
          Abandonar (volta pra trilha)
        </button>
      </div>
    </div>
  );
}
