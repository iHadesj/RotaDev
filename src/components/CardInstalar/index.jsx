import { useState } from "react";
import { motion } from "framer-motion";
import { springMedio } from "../../config/appConfig.js";
import { useInstalarApp } from "../../hooks/useInstalarApp.js";

export function CardInstalar() {
  const { instalado, podeDireto, ehIOS, instalar } = useInstalarApp();
  const [guiaIOS, setGuiaIOS] = useState(false);

  // já roda como app, ou o navegador não suporta nenhum dos caminhos: some
  if (instalado || (!podeDireto && !ehIOS)) return null;

  return (
    <>
      <button
        className="btn btn-lima"
        onClick={() => (podeDireto ? instalar() : setGuiaIOS((v) => !v))}
      >
        📲 Instalar o app na tela inicial
      </button>
      {guiaIOS && !podeDireto && (
        <motion.div
          className="missao missao--dica"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springMedio}
        >
          <b>No iPhone/iPad é manual (regra da Apple), mas é rapidinho:</b>
          <br />
          1. Abre este site no <b>Safari</b>
          <br />
          2. Toca no botão <b>Compartilhar</b> (o quadrado com a seta pra cima)
          <br />
          3. Desce e toca em <b>“Adicionar à Tela de Início”</b>
          <br />
          Pronto: vira app, com ícone e tudo — e funciona offline no busão. 🚌
        </motion.div>
      )}
    </>
  );
}
