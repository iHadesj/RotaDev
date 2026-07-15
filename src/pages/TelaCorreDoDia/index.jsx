import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { springMedio } from "../../config/appConfig.js";
import { NOME_TIPO_DESAFIO } from "../../config/challengeConfig.js";
import { DesafioCode, DesafioEncaixe, DesafioQuiz } from "../../components/challenges/index.jsx";
import { Letreiro } from "../../components/ui/index.jsx";
import { montaCorreDoDia, streakAtual } from "../../services/progressService.js";

export function TelaCorreDoDia({ curso, scores, diario, onConcluir, onVoltar }) {
  const [sessao] = useState(() => montaCorreDoDia(curso, scores));
  const [passo, setPasso] = useState(0); // 0 = conceito · 1-2 = desafios · 3 = fim
  const [acertos, setAcertos] = useState(0);
  const terminou = passo === 3;

  // registra o dia UMA vez, na hora que fecha a sessão
  useEffect(() => {
    if (terminou) onConcluir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminou]);

  const streak = streakAtual(diario);
  const d = passo >= 1 && passo <= 2 ? sessao.desafios[passo - 1] : null;

  function resolvido(pontuou) {
    if (pontuou) setAcertos((a) => a + 1);
    setPasso((p) => p + 1);
  }

  return (
    <div>
      <Letreiro
        mini
        rota={"CORRE DO DIA · " + (streak > 0 ? "🔥 x" + streak : "acende o fogo")}
        destino={sessao.revisao ? "Revisão: " + sessao.mod.nome : sessao.mod.nome}
      />
      {!terminou && (
        <p className="pager">
          {passo === 0 ? "conceito do dia" : "desafio " + passo + " / 2"} · ~10 min
        </p>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={passo}
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -36 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {passo === 0 && (
            <>
              <div className="card">
                <p className="card-titulo">{sessao.lesson.t}</p>
                <p className="card-txt">{sessao.lesson.txt}</p>
                {sessao.lesson.code && <code className="code">{sessao.lesson.code}</code>}
              </div>
              <div className="stack">
                <button className="btn btn-laranja" onClick={() => setPasso(1)}>
                  Bora pros 2 desafios 🔥
                </button>
              </div>
            </>
          )}
          {d && (
            <>
              <div className="quiz-topo">
                <span>Desafio {passo} / 2</span>
                <span className="tipo-badge">{NOME_TIPO_DESAFIO[d.tipo]}</span>
                <span>✔ {acertos}</span>
              </div>
              {d.tipo === "quiz" && <DesafioQuiz d={d} onResolvido={resolvido} />}
              {d.tipo === "encaixe" && <DesafioEncaixe d={d} onResolvido={resolvido} />}
              {d.tipo === "code" && <DesafioCode d={d} onResolvido={resolvido} />}
            </>
          )}
          {terminou && (
            <motion.div
              className="card card--cor"
              style={{ background: "var(--lima)" }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={springMedio}
            >
              <p className="trofeu">🔥</p>
              <p className="placar">x{streakAtual(diario)}</p>
              <p className="placar-sub">
                {acertos}/2 no corre de hoje · não perde o busão de amanhã!
              </p>
              {diario && diario.melhor > 1 && (
                <p className="card-txt" style={{ textAlign: "center", marginTop: 10 }}>
                  Teu recorde: 🔥 x{diario.melhor}
                  {sessao.revisao ? " · linha zerada, hoje foi revisão." : ""}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="stack">
        <button className="btn btn-fantasma" onClick={onVoltar}>
          {terminou ? "Voltar pro terminal" : "Abandonar (o fogo espera até amanhã)"}
        </button>
      </div>
    </div>
  );
}
