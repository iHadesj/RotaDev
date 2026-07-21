import { useRef } from "react";
import { realca } from "../../utils/realce.js";

/* Mini-IDE com tema Dracula. Truque: uma camada <pre> com o código
   colorido fica ATRÁS, e o <textarea> por cima tem o texto transparente
   (só o cursor aparece). Os dois usam a MESMA métrica de fonte/padding,
   então ficam pixel-a-pixel alinhados. No scroll do textarea, a camada
   colorida e a régua de números acompanham via transform. */
export function Editor({ valor, onChange, arquivo, lang }) {
  const numRef = useRef(null);
  const hlRef = useRef(null);
  const linhas = valor.split("\n").length;
  const nums = Array.from(
    { length: Math.max(linhas, 1) },
    (_, i) => i + 1,
  ).join("\n");
  const html = realca(valor, lang);

  function sincroniza(e) {
    const el = e.target;
    if (hlRef.current)
      hlRef.current.style.transform =
        "translate(" + -el.scrollLeft + "px, " + -el.scrollTop + "px)";
    if (numRef.current)
      numRef.current.style.transform = "translateY(" + -el.scrollTop + "px)";
  }

  function keyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target;
      const s = el.selectionStart;
      const f = el.selectionEnd;
      const novo = valor.slice(0, s) + "  " + valor.slice(f);
      onChange(novo);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = s + 2;
      });
    }
  }

  return (
    <div className="editor editor--dracula">
      <div className="editor-topo">
        <span className="dot d1" />
        <span className="dot d2" />
        <span className="dot d3" />
        <span className="editor-arquivo">{arquivo}</span>
      </div>
      <div className="editor-corpo">
        <div className="editor-nums" aria-hidden="true">
          <div className="editor-nums-in" ref={numRef}>
            {nums}
          </div>
        </div>
        <div className="editor-area">
          <pre className="editor-hl" aria-hidden="true">
            <code
              className="editor-hl-in"
              ref={hlRef}
              dangerouslySetInnerHTML={{ __html: html + "\n" }}
            />
          </pre>
          <textarea
            className="editor-ta"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={keyDown}
            onScroll={sincroniza}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            aria-label={"Editor de código: " + arquivo}
          />
        </div>
      </div>
    </div>
  );
}
