import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Letreiro } from "../../components/ui/index.jsx";

export function TelaLicao({ modulo, onDesafio, onVoltar }) {
  const [i, setI] = useState(0);
  const l = modulo.lessons[i];
  const ultima = i === modulo.lessons.length - 1;
  return (
    <div>
      <Letreiro
        mini
        rota={modulo.tag + " · " + modulo.ponto}
        destino={modulo.nome}
      />
      <p className="pager">
        Conceito {i + 1} / {modulo.lessons.length}
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <div className="card">
            <p className="card-titulo">{l.t}</p>
            <p className="card-txt">{l.txt}</p>
            {l.code && <code className="code">{l.code}</code>}
          </div>
          {ultima && modulo.projeto && (
            <section className="card projeto-brief" aria-labelledby="projeto-titulo">
              <span className="parada-tag">ENTREGA OBRIGATÓRIA</span>
              <p className="card-titulo" id="projeto-titulo">
                {modulo.projeto.titulo}
              </p>
              <p className="card-txt">{modulo.projeto.entrega}</p>
              <p className="projeto-subtitulo">Critérios de aceite</p>
              <ul className="projeto-checklist">
                {modulo.projeto.criterios.map((criterio) => (
                  <li key={criterio}>{criterio}</li>
                ))}
              </ul>
              <p className="projeto-aviso">
                Os desafios conferem os fundamentos. O módulo só está realmente
                concluído quando esta entrega funciona no seu projeto.
              </p>
            </section>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="stack">
        {!ultima && (
          <button className="btn btn-laranja" onClick={() => setI(i + 1)}>
            Próximo conceito →
          </button>
        )}
        {ultima && (
          <button className="btn btn-azul" onClick={onDesafio}>
            Começar os desafios 🔥
          </button>
        )}
        {i > 0 && (
          <button className="btn btn-fantasma" onClick={() => setI(i - 1)}>
            ← Voltar um conceito
          </button>
        )}
        <button className="btn btn-fantasma" onClick={onVoltar}>
          Voltar pra trilha
        </button>
      </div>
    </div>
  );
}
