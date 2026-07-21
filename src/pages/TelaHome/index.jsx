import { motion } from "framer-motion";
import { itemSobe, listaStagger } from "../../config/appConfig.js";
import { CardInstalar } from "../../components/CardInstalar/index.jsx";
import { Icon, Letreiro } from "../../components/ui/index.jsx";
import { CURSOS } from "../../data/curriculum.js";
import {
  feitoHoje,
  scoresDoCurso,
  streakAtual,
} from "../../services/progressService.js";

export function TelaHome({ progresso, diario, cursoAtual, onCorreDoDia, onTreino, onEscolher }) {
  const streak = streakAtual(diario);
  const feito = feitoHoje(diario);
  return (
    <motion.div variants={listaStagger} initial="inicial" animate="entra">
      <Letreiro
        rota="TERMINAL DE PARTIDA · ESCOLHE TUA LINHA"
        destino={"ROTA \nDEV"}
        sub="dois cursos · um destino: Faria Lima"
      />
      <motion.div variants={itemSobe}>
        <button className="curso-card curso-card--diario" onClick={onCorreDoDia}>
          <span className="parada-tag">
            <span className="icon-line">
              <Icon name="bus" /> CORRE DO DIA · MODO BUSÃO
            </span>
            <span className="diario-fogo">
              <Icon name="flame" className="icon--leading" />
              {streak > 0 ? "x" + streak : "apagado"}
            </span>
          </span>
          <p className="parada-nome">
            {feito ? (
              <><Icon name="check" className="icon--leading" />Feito! Volta amanhã</>
            ) : "10 min no trajeto"}
          </p>
          <p className="parada-desc">
            {feito
              ? "O fogo de hoje tá garantido. Amanhã tem mais — ou refaz de revisão."
              : "1 conceito + 2 desafios EXCLUSIVOS do diário, no tema da linha " +
                cursoAtual.titulo +
                ". Funciona sem internet: túnel, 3G ruim, tanto faz."}
          </p>
          {!feito && (
            <span className="curso-cta">
              Fazer o corre de hoje <Icon name="flame" className="icon--trailing" />
            </span>
          )}
        </button>
      </motion.div>
      <motion.div variants={itemSobe}>
        <button className="curso-card curso-card--treino" onClick={onTreino}>
          <span className="parada-tag">
            <span className="icon-line">
              <Icon name="muscle" /> MODO TREINO · PREPARA PRO MERCADO
            </span>
          </span>
          <p className="parada-nome">Desafios de código de verdade</p>
          <p className="parada-desc">
            Sem trilha, sem ordem: escolhe um problema estilo entrevista técnica,
            escreve a função em JS ou TS num editor com lint, roda a bateria de
            testes e vê caso a caso passar. Igual teste de vaga júnior.
          </p>
          <span className="curso-cta">
            Treinar código <Icon name="arrowRight" className="icon--trailing" />
          </span>
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
              <p className="parada-local"><Icon name="bus" /> {c.sub}</p>
              <p className="parada-desc">{c.desc}</p>
              <span className="curso-cta">
                {comecou ? "Continuar o corre" : "Começar o corre"}
                <Icon name="arrowRight" className="icon--trailing" />
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
