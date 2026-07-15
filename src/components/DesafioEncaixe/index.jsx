import { useId, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { estouraConfete, springMedio } from "../../config/appConfig.js";
import { embaralhaDiferente } from "../../utils/challengeRuntime.js";

export function DesafioEncaixe({ d, onResolvido }) {
  const grupoLayout = useId();
  const [banco, setBanco] = useState(() =>
    embaralhaDiferente(d.pecas.map((p, i) => ({ p, k: i }))),
  );
  const [monte, setMonte] = useState([]);
  const [res, setRes] = useState(null); // { ok, msg }
  const [erros, setErros] = useState(0);
  const [usouGabarito, setUsouGabarito] = useState(false);

  function pegar(idx) {
    const item = banco[idx];
    setBanco(banco.filter((_, i) => i !== idx));
    setMonte([...monte, item]);
    setRes(null);
  }
  function devolver(idx) {
    const item = monte[idx];
    setMonte(monte.filter((_, i) => i !== idx));
    setBanco([...banco, item]);
    setRes(null);
  }

  function conferir() {
    if (monte.length !== d.pecas.length) {
      setRes({
        ok: false,
        msg:
          "Ainda faltam " +
          (d.pecas.length - monte.length) +
          " peça(s) pra encaixar. Toca nelas aí embaixo pra subir.",
      });
      return;
    }
    // compara por TEXTO — peças idênticas são intercambiáveis
    let primeiroErro = -1;
    for (let i = 0; i < d.pecas.length; i++) {
      if (monte[i].p !== d.pecas[i]) {
        primeiroErro = i;
        break;
      }
    }
    if (primeiroErro === -1) {
      setRes({ ok: true, msg: d.explain });
      estouraConfete({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } else {
      setErros((e) => e + 1);
      const certas = primeiroErro;
      setRes({
        ok: false,
        msg:
          certas === 0
            ? "A primeira peça já não encaixa aí. Pensa: o que precisa vir ANTES de tudo nesse código?"
            : "As " +
              certas +
              " primeira(s) estão certas — é a peça " +
              (certas + 1) +
              " que não encaixa nessa posição. Toca nela pra devolver e testa outra.",
      });
    }
  }

  function verGabarito() {
    setMonte(d.pecas.map((p, i) => ({ p, k: "g" + i })));
    setBanco([]);
    setUsouGabarito(true);
    setRes({
      ok: true,
      msg:
        "Essa é a ordem certa. Lê de cima pra baixo entendendo o porquê de cada linha — na próxima sai de você. " +
        d.explain,
    });
  }

  const montado = res && res.ok;

  return (
    <div className="card">
      <LayoutGroup id={grupoLayout}>
        <p className="quiz-q">{d.enunciado}</p>
        <p className="encaixe-label">
          Seu código (toca numa peça pra devolver)
        </p>
        <motion.div
          className="encaixe-area"
          animate={res && !res.ok ? "erra" : "calma"}
          variants={{
            erra: { x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } },
            calma: { x: 0 },
          }}
        >
          {monte.length === 0 && (
            <p className="encaixe-vazio">
              — vazio — toca nas peças aí de baixo pra montar aqui —
            </p>
          )}
          {monte.map((item, i) => (
            <motion.button
              key={item.k}
              layoutId={"peca-" + item.k}
              transition={springMedio}
              whileTap={{ scale: 0.97 }}
              className="peca peca--monte"
              onClick={() => !montado && devolver(i)}
            >
              {item.p}
            </motion.button>
          ))}
        </motion.div>
        {banco.length > 0 && (
          <>
            <p className="encaixe-label">
              Peças embaralhadas (toca pra encaixar)
            </p>
            <div className="encaixe-banco">
              {banco.map((item, i) => (
                <motion.button
                  key={item.k}
                  layoutId={"peca-" + item.k}
                  transition={springMedio}
                  whileTap={{ scale: 0.97 }}
                  className="peca"
                  onClick={() => pegar(i)}
                >
                  {item.p}
                </motion.button>
              ))}
            </div>
          </>
        )}
        {res && (
          <motion.div
            className={
              "feedback " + (res.ok ? "feedback--ok" : "feedback--ruim")
            }
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={springMedio}
          >
            <p className="feedback-titulo">
              {res.ok
                ? usouGabarito
                  ? "Montado com o gabarito"
                  : "Encaixou perfeito! 🧩"
                : "Quase lá..."}
            </p>
            <p className="feedback-txt">{res.msg}</p>
          </motion.div>
        )}
        <div className="toolbar">
          {!montado && (
            <button className="btn btn-laranja" onClick={conferir}>
              Conferir encaixe
            </button>
          )}
          {!montado && erros >= 2 && (
            <button className="btn btn-fantasma" onClick={verGabarito}>
              Mostrar a ordem certa
            </button>
          )}
          {montado && (
            <button
              className="btn btn-lima"
              onClick={() => onResolvido(!usouGabarito)}
            >
              {usouGabarito ? "Seguir (sem pontuar)" : "Fechar desafio ✓"}
            </button>
          )}
        </div>
      </LayoutGroup>
    </div>
  );
}
