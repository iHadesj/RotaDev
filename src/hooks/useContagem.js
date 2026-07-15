import { useEffect, useState } from "react";

// contagem animada pro placar do resultado
export function useContagem(alvo, dur = 900) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    let raf;
    const t0 = performance.now();
    function tick(t) {
      const p = Math.min(1, (t - t0) / dur);
      setValor(Math.round(alvo * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [alvo, dur]);
  return valor;
}
