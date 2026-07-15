import { motion } from "framer-motion";
import { itemSobe, listaStagger } from "../../config/appConfig.js";
import { CardInstalar } from "../../components/CardInstalar/index.jsx";
import { Letreiro } from "../../components/ui/index.jsx";
import { CURSOS } from "../../data/curriculum.js";
import { feitoHoje, streakAtual } from "../../services/progressService.js";

export function TelaHome({ progresso, diario, cursoAtual, onCorreDoDia, onEscolher }) {
  const streak = streakAtual(diario);
  const feito = feitoHoje(diario);
  return (
    <motion.div variants={listaStagger} initial="inicial" animate="entra">
      <Letreiro
        rota="TERMINAL DE PARTIDA · ESCOLHE TUA LINHA"
        destino={"DEV DO\nCORRE"}
        sub="dois cursos · um destino: Faria Lima"
      />
      <motion.div variants={itemSobe}>
        <button className="curso-card curso-card--diario" onClick={onCorreDoDia}>
          <span className="parada-tag">
            <span>CORRE DO DIA · MODO BUSÃO 🚌</span>
            <span className="diario-fogo">
              {streak > 0 ? "🔥 x" + streak : "🔥 apagado"}
            </span>
          </span>
          <p className="parada-nome">{feito ? "Feito! Volta amanhã ✓" : "10 min no trajeto"}</p>
          <p className="parada-desc">
            {feito
              ? "O fogo de hoje tá garantido. Amanhã tem mais — ou refaz de revisão."
              : "1 conceito + 2 desafios EXCLUSIVOS do diário, no tema da linha " +
                cursoAtual.titulo +
                ". Funciona sem internet: túnel, 3G ruim, tanto faz."}
          </p>
          {!feito && <span className="curso-cta">Fazer o corre de hoje 🔥</span>}
        </button>
      </motion.div>
      <motion.div className="card" variants={itemSobe}>
        <p className="card-txt">
          Dois busões saindo do extremo sul. Em cada parada: conceito rápido e
          desafios de três tipos — <strong>quiz</strong>,{" "}
          <strong>quebra-cabeça de encaixar código</strong> e{" "}
          <strong>código de verdade</strong>, que você digita, roda e vê
          acontecendo na tela, com um lint amigável que explica o erro em bom
          português. Acertou 3 de 5, libera o próximo ponto. Escolhe tua linha:
        </p>
      </motion.div>
      {CURSOS.map((c) => {
        const s = scoresDoCurso(progresso, c.id);
        const completos = c.modules.filter((m) => (s[m.id] || 0) >= 3).length;
        const comecou = Object.keys(s).length > 0;
        return (
          <motion.div key={c.id} variants={itemSobe}>
            <button className="curso-card" onClick={() => onEscolher(c.id)}>
              <span className="parada-tag">
                <span>{c.rota}</span>
                {comecou && (
                  <span className="parada-score">
                    {completos}/{c.modules.length} pontos
                  </span>
                )}
              </span>
              <p className="parada-nome">{c.titulo}</p>
              <p className="parada-local">🚌 {c.sub}</p>
              <p className="parada-desc">{c.desc}</p>
              <span className="curso-cta">
                {comecou ? "Continuar o corre →" : "Começar o corre →"}
              </span>
            </button>
          </motion.div>
        );
      })}
      <motion.div className="stack" variants={itemSobe}>
        <CardInstalar />
      </motion.div>
      <motion.p className="footer-note" variants={itemSobe}>
        Cada linha guarda o próprio progresso. Pode fechar e voltar depois, o
        busão te espera.
      </motion.p>
    </motion.div>
  );
}
