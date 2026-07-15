import { useRef } from "react";

export function Editor({ valor, onChange, arquivo }) {
  const numRef = useRef(null);
  const linhas = valor.split("\n").length;
  const nums = Array.from(
    { length: Math.max(linhas, 1) },
    (_, i) => i + 1,
  ).join("\n");

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
    <div className="editor">
      <div className="editor-topo">
        <span className="dot d1" />
        <span className="dot d2" />
        <span className="dot d3" />
        <span className="editor-arquivo">{arquivo}</span>
      </div>
      <div className="editor-corpo">
        <pre className="editor-nums" ref={numRef} aria-hidden="true">
          {nums}
        </pre>
        <textarea
          className="editor-ta"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={keyDown}
          onScroll={(e) => {
            if (numRef.current) numRef.current.scrollTop = e.target.scrollTop;
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label={"Editor de código: " + arquivo}
        />
      </div>
    </div>
  );
}
