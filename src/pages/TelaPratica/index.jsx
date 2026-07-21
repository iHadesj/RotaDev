import { useState } from "react";
import { motion } from "framer-motion";
import { itemSobe, listaStagger } from "../../config/appConfig.js";
import { carregaPratica, salvaPratica } from "../../services/progressService.js";
import { TRILHAS_PRATICA } from "../../data/praticas.js";
import { DesafioTeste } from "../../components/challenges/index.jsx";
import { Icon, Letreiro } from "../../components/ui/index.jsx";

export function TelaPratica({ onVoltar }) {
  const [prog, setProg] = useState(() => carregaPratica());
  const [aberto, setAberto] = useState(null); // problema em foco (ou null = lista)

  function resolvido(problema, pontuou) {
    if (pontuou) {
      const novo = {
        ...prog,
        resolvidos: { ...prog.resolvidos, [problema.id]: true },
      };
      setProg(novo);
      salvaPratica(novo);
    }
    setAberto(null);
  }

  if (aberto) {
    return (
      <div>
        <Letreiro mini rota="MODO TREINO · desafio" destino={aberto.titulo} />
        <DesafioTeste
          key={aberto.id}
          d={aberto}
          onResolvido={(pontuou) => resolvido(aberto, pontuou)}
          onVoltar={() => setAberto(null)}
        />
      </div>
    );
  }

  const todos = TRILHAS_PRATICA.flatMap((t) => t.problemas);
  const feitos = todos.filter((p) => prog.resolvidos[p.id]).length;

  return (
    <motion.div variants={listaStagger} initial="inicial" animate="entra">
      <Letreiro
        mini
        rota="MODO TREINO · PREPARA PRO MERCADO"
        destino={"CÓDIGO DE\nVERDADE"}
      />

      <motion.div className="card" variants={itemSobe}>
        <p className="card-txt">
          Aqui não tem trilha nem ordem: escolhe um problema, escreve a função em{" "}
          <strong>JS ou TS</strong> num editor com lint, aperta{" "}
          <strong>Rodar os testes</strong> e vê caso a caso passar (ou falhar). É
          o formato que cai em teste de vaga. Passou em todos = fechou.
        </p>
        <div className="pratica-placar">
          {feitos}/{todos.length} problemas fechados
        </div>
      </motion.div>

      {TRILHAS_PRATICA.map((trilha) => (
        <motion.div key={trilha.id} variants={itemSobe}>
          <div className="pratica-trilha-tag">{trilha.tag}</div>
          {trilha.problemas.map((p) => {
            const feito = !!prog.resolvidos[p.id];
            return (
              <button
                key={p.id}
                className={"pratica-item" + (feito ? " pratica-item--ok" : "")}
                onClick={() => setAberto(p)}
              >
                <span className="pratica-item-check">
                  <Icon name={feito ? "check" : "play"} title={feito ? "Concluído" : "Abrir desafio"} />
                </span>
                <span className="pratica-item-corpo">
                  <span className="pratica-item-titulo">{p.titulo}</span>
                  <span className="pratica-item-meta">
                    {p.tema} · {p.nivel}
                  </span>
                </span>
              </button>
            );
          })}
        </motion.div>
      ))}

      <motion.div className="stack" variants={itemSobe}>
        <button className="btn btn-fantasma" onClick={onVoltar}>
          Voltar pra home
        </button>
      </motion.div>
    </motion.div>
  );
}
