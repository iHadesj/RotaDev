import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CURSO_KEY, TEMAS, TEMA_KEY, telaVariants } from "./config/appConfig.js";
import { CURSOS } from "./data/curriculum.js";
import { Icon, Letreiro } from "./components/ui/index.jsx";
import { TelaCorreDoDia } from "./pages/TelaCorreDoDia/index.jsx";
import { TelaDesafios } from "./pages/TelaDesafios/index.jsx";
import { TelaHome } from "./pages/TelaHome/index.jsx";
import { TelaLicao } from "./pages/TelaLicao/index.jsx";
import { TelaPratica } from "./pages/TelaPratica/index.jsx";
import { TelaResultado } from "./pages/TelaResultado/index.jsx";
import { TelaTrilha } from "./pages/TelaTrilha/index.jsx";
import { calcXP, carregaDiario, carregarProgresso, hojeStr, registraDiario, salvaDiario, salvarProgresso, scoresDoCurso } from "./services/progressService.js";
import "./styles/global.css";

export default function DevDoCorre() {
  const [tela, setTela] = useState("carregando");
  const [progresso, setProgresso] = useState({ cursos: {} });
  const [cursoId, setCursoId] = useState(() => {
    try {
      return localStorage.getItem(CURSO_KEY) || "fullstack";
    } catch (e) {
      return "fullstack";
    }
  });
  const [ativo, setAtivo] = useState(0);
  const [ultimoResultado, setUltimoResultado] = useState(null);
  const [diario, setDiario] = useState(() => carregaDiario());
  const [online, setOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [temaId, setTemaId] = useState(() => {
    try {
      return localStorage.getItem(TEMA_KEY) || "padrao";
    } catch (e) {
      return "padrao";
    }
  });

  const curso = CURSOS.find((c) => c.id === cursoId) || CURSOS[0];
  const modules = curso.modules;
  const scores = scoresDoCurso(progresso, curso.id);

  // modo busão: avisa quando cair a rede (e que tá tudo bem)
  useEffect(() => {
    const liga = () => setOnline(true);
    const desliga = () => setOnline(false);
    window.addEventListener("online", liga);
    window.addEventListener("offline", desliga);
    return () => {
      window.removeEventListener("online", liga);
      window.removeEventListener("offline", desliga);
    };
  }, []);

  function concluirDiario() {
    const novo = registraDiario(diario);
    setDiario(novo);
    salvaDiario(novo);
  }

  useEffect(() => {
    try {
      localStorage.setItem(TEMA_KEY, temaId);
    } catch (e) {
      /* sem storage, segue no tema da sessão */
    }
    const t = TEMAS.find((x) => x.id === temaId) || TEMAS[0];
    document.body.style.background = t.papel;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t.papel);
  }, [temaId]);

  useEffect(() => {
    let vivo = true;
    carregarProgresso().then((p) => {
      if (!vivo) return;
      if (p && p.cursos) setProgresso(p);
      setTela("home");
    });
    return () => {
      vivo = false;
    };
  }, []);

  function escolherCurso(id) {
    setCursoId(id);
    try {
      localStorage.setItem(CURSO_KEY, id);
    } catch (e) {
      /* segue sem salvar */
    }
    setAtivo(0);
    setTela("trilha");
  }

  function abrirModulo(i) {
    setAtivo(i);
    setTela("licao");
  }

  function fimDosDesafios(score) {
    const m = modules[ativo];
    const xpAntes = calcXP(scores, modules);
    const melhor = Math.max(scores[m.id] || 0, score);
    const novosScores = { ...scores, [m.id]: melhor };
    const novo = {
      ...progresso,
      cursos: { ...progresso.cursos, [curso.id]: { scores: novosScores } },
    };
    const xpDepois = calcXP(novosScores, modules);
    setProgresso(novo);
    salvarProgresso(novo);
    setUltimoResultado({ score, xpGanho: xpDepois - xpAntes });
    setTela("resultado");
  }

  async function resetar() {
    const ok =
      typeof window !== "undefined" && window.confirm
        ? window.confirm(
            "Certeza que quer zerar o curso " +
              curso.titulo +
              "? Vai apagar XP e progresso só dessa linha.",
          )
        : true;
    if (!ok) return;
    const novo = {
      ...progresso,
      cursos: { ...progresso.cursos, [curso.id]: { scores: {} } },
    };
    setProgresso(novo);
    await salvarProgresso(novo);
    setTela("home");
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={"ddc" + (temaId === "padrao" ? "" : " ddc--" + temaId)}>
        <div className="ddc-shell">
          {!online && (
            <div className="offline-badge" role="status">
              <Icon name="offline" className="icon--leading" />
              Sem sinal — modo busão ativo, tudo segue funcionando
            </div>
          )}
          <div className="temas" role="group" aria-label="Tema de cores">
            {TEMAS.map((t) => (
              <button
                key={t.id}
                className={
                  "tema-swatch" + (temaId === t.id ? " tema-swatch--ativo" : "")
                }
                style={{
                  background:
                    "linear-gradient(135deg, " +
                    t.cor +
                    " 50%, " +
                    t.papel +
                    " 50%)",
                }}
                title={t.nome}
                aria-label={"Tema " + t.nome}
                aria-pressed={temaId === t.id}
                onClick={() => setTemaId(t.id)}
              />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tela}
              variants={telaVariants}
              initial="inicial"
              animate="entra"
              exit="sai"
            >
              {tela === "carregando" && (
                <Letreiro
                  rota="AGUARDE..."
                  destino="Chamando o busão"
                  sub="carregando seu progresso"
                />
              )}
              {tela === "home" && (
                <TelaHome
                  progresso={progresso}
                  diario={diario}
                  cursoAtual={curso}
                  onCorreDoDia={() => setTela("diario")}
                  onTreino={() => setTela("pratica")}
                  onEscolher={escolherCurso}
                />
              )}
              {tela === "pratica" && (
                <TelaPratica onVoltar={() => setTela("home")} />
              )}
              {tela === "diario" && (
                <TelaCorreDoDia
                  key={hojeStr() + curso.id}
                  curso={curso}
                  scores={scores}
                  diario={diario}
                  onConcluir={concluirDiario}
                  onVoltar={() => setTela("home")}
                />
              )}
              {tela === "trilha" && (
                <TelaTrilha
                  curso={curso}
                  scores={scores}
                  onAbrir={abrirModulo}
                  onReset={resetar}
                  onTrocarCurso={() => setTela("home")}
                />
              )}
              {tela === "licao" && (
                <TelaLicao
                  modulo={modules[ativo]}
                  onDesafio={() => setTela("desafios")}
                  onVoltar={() => setTela("trilha")}
                />
              )}
              {tela === "desafios" && (
                <TelaDesafios
                  key={curso.id + "-" + ativo}
                  modulo={modules[ativo]}
                  onFim={fimDosDesafios}
                  onVoltar={() => setTela("trilha")}
                />
              )}
              {tela === "resultado" && ultimoResultado && (
                <TelaResultado
                  modulo={modules[ativo]}
                  score={ultimoResultado.score}
                  xpGanho={ultimoResultado.xpGanho}
                  ehUltimo={ativo === modules.length - 1}
                  onRefazer={() => setTela("licao")}
                  onTrilha={() => setTela("trilha")}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
