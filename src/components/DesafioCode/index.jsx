import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { estouraConfete, springMedio } from "../../config/appConfig.js";
import { lintDelimitadores, lintHTML, lintJava, lintJS, lintJSX, montaSrcDoc, montaSrcDocWeb, preCarregaLibs, traduzErro } from "../../utils/challengeRuntime.js";
import { Editor, PainelLint } from "../ui/index.jsx";

export function DesafioCode({ d, onResolvido }) {
  const [codigo, setCodigo] = useState(d.starter);
  const [lints, setLints] = useState([]);
  const [erros, setErros] = useState([]);
  const [logs, setLogs] = useState([]);
  const [src, setSrc] = useState(null);
  const [rodada, setRodada] = useState(0);
  const [faltam, setFaltam] = useState(null); // null = nunca rodou
  const [javaOk, setJavaOk] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [dicaIdx, setDicaIdx] = useState(-1);
  const [verGab, setVerGab] = useState(false);
  const [usouGabarito, setUsouGabarito] = useState(false);
  const [regrasOkWeb, setRegrasOkWeb] = useState(
    !(d.regras && d.regras.length),
  );

  const ehJava = d.lang === "java";
  const ehWeb = d.lang === "html" || d.lang === "js" || d.lang === "ts";

  // já vai baixando as libs do sandbox — assim dá pra inlinar
  // no srcdoc e o desafio roda até offline (modo busão)
  useEffect(() => {
    preCarregaLibs(d.lang);
  }, [d.lang]);

  // escuta o sandbox (só desafios React)
  useEffect(() => {
    if (ehJava) return;
    function onMsg(e) {
      const m = e.data;
      if (!m || m.ddc !== 1) return;
      if (m.tipo === "erro") {
        const t = traduzErro(m.msg);
        setErros((prev) => (prev.includes(t) ? prev : [...prev, t]));
      } else if (m.tipo === "log") {
        setLogs((prev) => [...prev.slice(-7), m.texto]);
      } else if (m.tipo === "tela") {
        setFaltam((prev) => {
          if (!prev) return prev;
          return prev.filter((t) => !(m.texto || "").includes(t));
        });
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [ehJava]);

  const completo = ehJava
    ? javaOk
    : faltam !== null && faltam.length === 0 && regrasOkWeb;

  useEffect(() => {
    if (completo)
      estouraConfete({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
  }, [completo]);

  function rodar() {
    setTentativas((t) => t + 1);
    setErros([]);
    setLogs([]);

    const base =
      d.lang === "html" ? lintHTML(codigo) : lintDelimitadores(codigo);
    const especifico = ehJava
      ? lintJava(codigo)
      : d.lang === "js" || d.lang === "ts"
        ? lintJS(codigo)
        : d.lang === "html"
          ? []
          : lintJSX(codigo);
    const todos = [...base, ...especifico];
    const temErroDuro = todos.some((a) => a.nivel === "erro");

    if (ehJava) {
      const regrasFaltando = (d.regras || []).filter(
        (r) => !new RegExp(r.re).test(codigo),
      );
      const faltas = regrasFaltando.map((r) => ({
        nivel: "dica",
        msg: r.falta,
      }));
      setLints([...todos, ...faltas]);
      if (temErroDuro || regrasFaltando.length) {
        setJavaOk(false);
        return;
      }
      setJavaOk(true);
      return;
    }

    // React/web: dicasAuto e regras viram dica (não bloqueiam o run);
    // erro duro bloqueia. Nas linguagens web as regras também contam pra fechar.
    const autos = (d.dicasAuto || [])
      .filter((r) => !new RegExp(r.re).test(codigo))
      .map((r) => ({ nivel: "dica", msg: r.falta }));
    const regrasFaltando = ehWeb
      ? (d.regras || []).filter((r) => !new RegExp(r.re).test(codigo))
      : [];
    setLints([
      ...todos,
      ...autos,
      ...regrasFaltando.map((r) => ({ nivel: "dica", msg: r.falta })),
    ]);
    if (ehWeb) setRegrasOkWeb(regrasFaltando.length === 0);
    if (temErroDuro) {
      setSrc(null);
      return;
    }
    setFaltam([...d.esperado]);
    setSrc(
      ehWeb
        ? montaSrcDocWeb(codigo, d.lang, d.htmlBase, d.preambulo)
        : montaSrcDoc(codigo, d.preambulo),
    );
    setRodada((k) => k + 1);
  }

  function usarGabarito() {
    setCodigo(d.gabarito);
    setUsouGabarito(true);
    setVerGab(false);
    setLints([]);
    setErros([]);
  }

  return (
    <div className="card">
      <p className="quiz-q">{d.enunciado}</p>
      {d.contexto && <p className="enunciado">{d.contexto}</p>}

      <div className="missao">
        <b>🎯 Missão:</b> {d.missao}
        {!ehJava && d.esperado && (
          <div className="alvos">
            {d.esperado.map((t) => {
              const ok = faltam !== null && !faltam.includes(t);
              return (
                <span key={t} className={"alvo" + (ok ? " alvo--ok" : "")}>
                  {t}
                </span>
              );
            })}
          </div>
        )}
        {(d.regras || []).length > 0 && (
          <div className="alvos">
            {(d.regras || []).map((r) => (
              <span
                key={r.label}
                className={
                  "alvo" + (new RegExp(r.re).test(codigo) ? " alvo--ok" : "")
                }
              >
                {r.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <Editor
        valor={codigo}
        onChange={(v) => {
          setCodigo(v);
          if (ehJava && javaOk) setJavaOk(false);
        }}
        arquivo={d.arquivo}
      />

      <div className="toolbar">
        <button className="btn btn-laranja" onClick={rodar}>
          ▶ Rodar
        </button>
        {d.dicas && d.dicas.length > 0 && (
          <button
            className="btn btn-fantasma"
            onClick={() =>
              setDicaIdx((i) => Math.min(i + 1, d.dicas.length - 1))
            }
          >
            💡 Dica{" "}
            {dicaIdx >= 0
              ? "(" + (dicaIdx + 1) + "/" + d.dicas.length + ")"
              : ""}
          </button>
        )}
        {!completo && tentativas >= 2 && (
          <button
            className="btn btn-fantasma"
            onClick={() => setVerGab((v) => !v)}
          >
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

      {erros.length > 0 && (
        <div className="painel painel--erro">
          <div className="painel-titulo">
            <span>Erro na execução</span>
            <span>tradução amigável</span>
          </div>
          {erros.map((e, i) => (
            <div key={i} className="lint-item lint-erro">
              <span className="lint-emoji">🚨</span>
              <span>{e}</span>
            </div>
          ))}
        </div>
      )}

      {!ehJava && src && (
        <motion.div
          className="painel painel--azul"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springMedio}
        >
          <div className="painel-titulo">
            <span>Preview · rodando de verdade</span>
            {d.testa && !completo && (
              <span style={{ color: "var(--lima)" }}>{d.testa}</span>
            )}
          </div>
          <iframe
            key={rodada}
            className="preview-frame"
            sandbox="allow-scripts"
            srcDoc={src}
            title="Preview do seu código React"
          />
        </motion.div>
      )}

      {!ehJava && logs.length > 0 && (
        <div className="painel">
          <div className="painel-titulo">
            <span>Console</span>
          </div>
          <pre className="terminal terminal-log">
            {logs.map((l) => "> " + l).join("\n")}
          </pre>
        </div>
      )}

      {ehJava && javaOk && (
        <div className="painel">
          <div className="painel-titulo">
            <span>Terminal</span>
            <span>simulado* — Java precisa da JVM, não roda no navegador</span>
          </div>
          <pre className="terminal">
            <span className="terminal-prefixo">
              $ javac Main.java && java Main{"\n"}
            </span>
            {d.saida}
          </pre>
        </div>
      )}

      {completo && (
        <>
          <motion.div
            className="banner-ok"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springMedio}
          >
            {ehJava
              ? "Compilou sem erros! ✓"
              : "Funcionou, confere na tela! 🎉"}
          </motion.div>
          <motion.div
            className="stack"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <button
              className="btn btn-lima"
              onClick={() => onResolvido(!usouGabarito)}
            >
              {usouGabarito ? "Seguir (sem pontuar)" : "Fechar desafio ✓"}
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}

/* ============================ TELAS ============================ */

/* ---------- instalar como app (PWA) ----------
   Android e PC (Chrome/Edge): o navegador dispara beforeinstallprompt;
   guardamos o evento e o botão chama o prompt nativo de instalação.
   iPhone: a Apple NÃO permite instalar por código — o botão vira um
   passo a passo (Compartilhar → Adicionar à Tela de Início). */
