import { useEffect, useState } from "react";

export function useInstalarApp() {
  const [evento, setEvento] = useState(null);
  const [instalado, setInstalado] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  });

  useEffect(() => {
    function guarda(event) {
      event.preventDefault();
      setEvento(event);
    }

    function feito() {
      setEvento(null);
      setInstalado(true);
    }

    window.addEventListener("beforeinstallprompt", guarda);
    window.addEventListener("appinstalled", feito);
    return () => {
      window.removeEventListener("beforeinstallprompt", guarda);
      window.removeEventListener("appinstalled", feito);
    };
  }, []);

  const ehIOS =
    typeof navigator !== "undefined" &&
    (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

  async function instalar() {
    if (!evento) return;
    evento.prompt();
    const escolha = await evento.userChoice;
    if (escolha && escolha.outcome === "accepted") setEvento(null);
  }

  return { instalado, podeDireto: Boolean(evento), ehIOS, instalar };
}
