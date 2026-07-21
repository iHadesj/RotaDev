import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { estouraConfete, springMedio } from "../../config/appConfig.js";
import {
  lintDelimitadores,
  lintJS,
  montaSrcDocTeste,
  preCarregaLibs,
  traduzErro,
} from "../../utils/challengeRuntime.js";
import { Editor, PainelLint } from "../ui/index.jsx";

const TIMEOUT_MS = 2500; // watchdog de execução: mata loop infinito que trava o iframe
const CARGA_MS = 8000; // watchdog de carregamento: prazo até o código começar (Babel na 1ª vez)

// formata a chamada da função pra mostrar no painel: soma([1, 2]) etc.
function assinaturaCaso(nome, entrada) {
  const args = (entrada || [])
    .map((a) => {
      try {
        return JSON.stringify(a);
      } catch (e) {
        return String(a);
      }
    })
    .join(", ");
  return nome + "(" + args + ")";
}

export function DesafioTeste({ d, onResolvido, onVoltar }) {
  const [lang, setLang] = useState("js");
  const [codigo, setCodigo] = useState(d.starter);
  const [lints, setLints] = useState([]);
  const [resultados, setResultados] = useState(null); // null = nunca rodou
  const [erroGlobal, setErroGlobal] = useState(null);
  const [erroRaw, setErroRaw] = useState(null);
  const [logs, setLogs] = useState([]);
  const [src, setSrc] = useState(null);
  const [rodada, setRodada] = useState(0);
  const [tentativas, setTentativas] = useState(0);
  const [dicaIdx, setDicaIdx] = useState(-1);
  const [verGab, setVerGab] = useState(false);
  const [usouGabarito, setUsouGabarito] = useState(false);
  const watchdog = useRef(null);

  // já baixa o Babel — assim o modo TS roda até offline (modo busão)
  useEffect(() => {
    preCarregaLibs("ts");
  }, []);

  // limpa o watchdog se o componente sair no meio de uma rodada
  useEffect(() => () => clearTimeout(watchdog.current), []);

  useEffect(() => {
    // (re)arma o watchdog curto de execução — dispara se o código travar
    // (loop infinito) depois de já ter começado a rodar
    function armaExec() {
      clearTimeout(watchdog.current);
      watchdog.current = setTimeout(() => {
        setSrc(null);
        setResultados(null);
        setErroGlobal(
          "Seu código travou (passou de " +
            TIMEOUT_MS / 1000 +
            "s sem responder). Quase sempre é um LOOP INFINITO — confere se a condição do while/for realmente chega ao fim.",
        );
      }, TIMEOUT_MS);
    }
    function onMsg(e) {
      const m = e.data;
      if (!m || m.ddc !== 1) return;
      if (m.tipo === "teste-erro") {
        clearTimeout(watchdog.current);
        const raw = String(m.msg);
        if (raw.startsWith("SEM_FUNCAO:")) {
          setErroGlobal(
            'Não achei a função ' +
              d.funcao +
              ". O desafio precisa de uma function " +
              d.funcao +
              "(...) — confere o nome (maiúscula/minúscula conta!).",
          );
          setErroRaw("ReferenceError: " + d.funcao + " is not defined");
        } else {
          setErroGlobal(traduzErro(raw));
          setErroRaw(raw);
        }
        setResultados(null);
      } else if (m.tipo === "teste-log") {
        setLogs((prev) => [...prev.slice(-19), { nivel: m.nivel, texto: m.texto }]);
      } else if (m.tipo === "teste-inicio") {
        armaExec(); // código começou: troca carga → execução
        setResultados(new Array(m.total).fill(null));
      } else if (m.tipo === "teste-caso") {
        armaExec(); // houve progresso: adia o corte do loop
        setResultados((prev) => {
          if (!prev) return prev;
          const novo = prev.slice();
          novo[m.idx] = {
            passou: m.passou,
            recebido: m.recebido,
            esperado: m.esperado,
            erro: m.erro,
          };
          return novo;
        });
      } else if (m.tipo === "teste-fim") {
        clearTimeout(watchdog.current);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [d.funcao]);

  const rodou = resultados !== null;
  const passaram = rodou ? resultados.filter((r) => r && r.passou).length : 0;
  const total = d.casos.length;
  const completo = rodou && passaram === total && resultados.every(Boolean);

  useEffect(() => {
    if (completo)
      estouraConfete({ particleCount: 90, spread: 85, origin: { y: 0.7 } });
  }, [completo]);

  function rodar() {
    setTentativas((t) => t + 1);
    setErroGlobal(null);
    setErroRaw(null);
    setLogs([]);
    setResultados(null);

    const avisos = [...lintDelimitadores(codigo), ...lintJS(codigo)];
    setLints(avisos);
    if (avisos.some((a) => a.nivel === "erro")) {
      setSrc(null);
      return;
    }

    setSrc(montaSrcDocTeste(codigo, lang, d.funcao, d.casos));
    setRodada((k) => k + 1);

    // watchdog de CARREGAMENTO: no modo TS o compilador (Babel) baixa na
    // 1ª vez, então dá um prazo maior só até o código COMEÇAR a rodar. Quando
    // chega o "teste-inicio", troco pelo watchdog curto que detecta loop.
    clearTimeout(watchdog.current);
    watchdog.current = setTimeout(() => {
      setSrc(null);
      setResultados(null);
      setErroGlobal(
        "Não consegui preparar o ambiente de execução a tempo (na 1ª vez ele carrega o compilador). Tenta rodar de novo — da segunda já vai rápido.",
      );
    }, CARGA_MS);
  }

  function usarGabarito() {
    setCodigo(d.gabarito);
    setUsouGabarito(true);
    setVerGab(false);
    setLints([]);
    setErroGlobal(null);
    setErroRaw(null);
    setLogs([]);
    setResultados(null);
  }

  return (
    <div className="card">
      <div className="quiz-topo">
        <span className="tipo-badge">{d.tema}</span>
        <span className="pratica-nivel">{d.nivel}</span>
      </div>

      <p className="quiz-q">{d.titulo}</p>
      <p className="enunciado">{d.enunciado}</p>

      <div className="lang-switch" role="group" aria-label="Linguagem">
        {["js", "ts"].map((l) => (
          <button
            key={l}
            className={"lang-btn" + (lang === l ? " lang-btn--ativa" : "")}
            aria-pressed={lang === l}
            onClick={() => setLang(l)}
          >
            {l === "js" ? "JavaScript" : "TypeScript"}
          </button>
        ))}
      </div>

      <Editor
        valor={codigo}
        onChange={setCodigo}
        arquivo={d.funcao + (lang === "ts" ? ".ts" : ".js")}
        lang={lang}
      />

      <div className="toolbar">
        <button className="btn btn-laranja" onClick={rodar}>
          ▶ Rodar os testes
        </button>
        {d.dicas && d.dicas.length > 0 && (
          <button
            className="btn btn-fantasma"
            onClick={() => setDicaIdx((i) => Math.min(i + 1, d.dicas.length - 1))}
          >
            💡 Dica{" "}
            {dicaIdx >= 0 ? "(" + (dicaIdx + 1) + "/" + d.dicas.length + ")" : ""}
          </button>
        )}
        {!completo && tentativas >= 2 && (
          <button className="btn btn-fantasma" onClick={() => setVerGab((v) => !v)}>
            Estou travado
          </button>
        )}
      </div>

      {dicaIdx >= 0 && (
        <motion.div
          key={dicaIdx}
          className="missao missao--dica"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springMedio}
        >
          <b style={{ color: "var(--azul)" }}>💡 Dica {dicaIdx + 1}:</b>{" "}
          {d.dicas[dicaIdx]}
        </motion.div>
      )}

      {verGab && (
        <motion.div
          className="painel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springMedio}
        >
          <div className="painel-titulo">
            <span>Gabarito</span>
            <span>faz parte do aprendizado</span>
          </div>
          <code
            className="code"
            style={{ margin: 0, borderRadius: 0, borderLeft: 0, border: 0 }}
          >
            {d.gabarito}
          </code>
          <div style={{ padding: 10 }}>
            <button className="btn btn-fantasma" onClick={usarGabarito}>
              Colar no editor (não pontua, mas ensina)
            </button>
          </div>
        </motion.div>
      )}

      <PainelLint itens={lints} />

      {erroGlobal && (
        <div className="painel painel--erro">
          <div className="painel-titulo">
            <span>Não deu pra rodar</span>
            <span>tradução amigável</span>
          </div>
          <div className="lint-item lint-erro">
            <span className="lint-emoji">🚨</span>
            <span>{erroGlobal}</span>
          </div>
        </div>
      )}

      {(logs.length > 0 || erroRaw) && (
        <div className="painel">
          <div className="painel-titulo">
            <span>Console</span>
            <span>saída crua de cada caso — pra depurar de verdade</span>
          </div>
          <pre className="terminal terminal-log">
            {logs.map((l, i) => (
              <span key={i} className={"con-linha con-" + (l.nivel || "log")}>
                {(l.nivel === "error" ? "⛔ " : l.nivel === "warn" ? "⚠️ " : "› ") +
                  l.texto}
                {"\n"}
              </span>
            ))}
            {erroRaw && (
              <span className="con-linha con-error">{"⛔ " + erroRaw}</span>
            )}
          </pre>
        </div>
      )}

      {rodou && (
        <motion.div
          className="painel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springMedio}
        >
          <div className="painel-titulo">
            <span>Casos de teste</span>
            <span className={completo ? "teste-placar teste-placar--ok" : "teste-placar"}>
              {passaram}/{total} passando
            </span>
          </div>
          {d.casos.map((c, i) => {
            const r = resultados[i];
            const estado = !r ? "rodando" : r.passou ? "ok" : "falhou";
            return (
              <div key={i} className={"teste-caso teste-caso--" + estado}>
                <div className="teste-caso-topo">
                  <span className="teste-marca">
                    {estado === "ok" ? "✅" : estado === "falhou" ? "❌" : "⏳"}
                  </span>
                  <code className="teste-chamada">
                    {c.oculto ? "🔒 caso oculto" : assinaturaCaso(d.funcao, c.entrada)}
                  </code>
                </div>
                {r && !r.passou && (
                  <div className="teste-detalhe">
                    {c.oculto ? (
                      <span>
                        Esse caso escondido não passou — tenta pensar em entradas
                        diferentes (lista vazia? só um item? número grande?).
                      </span>
                    ) : (
                      <>
                        <span>
                          esperava <code>{r.esperado}</code>
                        </span>
                        <span>
                          veio <code>{r.recebido}</code>
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* iframe escondido: roda o código de verdade e reporta por postMessage.
          Fica FORA do painel de resultados — senão ele só montaria depois de
          já ter resultado, que é justamente o que ele produz (ovo e galinha). */}
      {src && (
        <iframe
          key={rodada}
          title="Executor dos testes"
          sandbox="allow-scripts"
          srcDoc={src}
          style={{ display: "none" }}
          aria-hidden="true"
        />
      )}

      {completo && (
        <>
          <motion.div
            className="banner-ok"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springMedio}
          >
            Passou em todos os casos! 🎉
          </motion.div>
          <motion.div
            className="stack"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <button className="btn btn-lima" onClick={() => onResolvido(!usouGabarito)}>
              {usouGabarito ? "Seguir (sem pontuar)" : "Fechar desafio ✓"}
            </button>
          </motion.div>
        </>
      )}

      <div className="stack">
        <button className="btn btn-fantasma" onClick={onVoltar}>
          Voltar pros treinos
        </button>
      </div>
    </div>
  );
}
