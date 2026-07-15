import { useState } from "react";

export function EntregaProjeto({ projeto, onConcluir }) {
  const [marcados, setMarcados] = useState(() =>
    projeto.criterios.map(() => false),
  );
  const [confirmouAutoria, setConfirmouAutoria] = useState(false);
  const completo = marcouTodos(marcados) && confirmouAutoria;

  function alternar(index) {
    setMarcados((atuais) =>
      atuais.map((marcado, atual) =>
        atual === index ? !marcado : marcado,
      ),
    );
  }

  return (
    <section className="card projeto-entrega" aria-labelledby="entrega-titulo">
      <span className="parada-tag">VALIDAÇÃO DA ENTREGA</span>
      <p className="card-titulo" id="entrega-titulo">
        {projeto.titulo}
      </p>
      <p className="card-txt">{projeto.entrega}</p>
      <div className="projeto-campos">
        {projeto.criterios.map((criterio, index) => (
          <label className="projeto-criterio" key={criterio}>
            <input
              type="checkbox"
              checked={marcados[index]}
              onChange={() => alternar(index)}
            />
            <span>{criterio}</span>
          </label>
        ))}
        <label className="projeto-criterio projeto-autoria">
          <input
            type="checkbox"
            checked={confirmouAutoria}
            onChange={(event) => setConfirmouAutoria(event.target.checked)}
          />
          <span>
            Eu executei e testei essa entrega no meu próprio projeto — não
            marquei apenas por ter lido os critérios.
          </span>
        </label>
      </div>
      <button
        className="btn btn-lima"
        disabled={!completo}
        onClick={onConcluir}
      >
        Validar projeto e concluir módulo ✓
      </button>
      {!completo && (
        <p className="projeto-pendente" role="status">
          O próximo ponto só libera depois que todos os critérios forem
          implementados e testados.
        </p>
      )}
    </section>
  );
}

function marcouTodos(valores) {
  return valores.length > 0 && valores.every(Boolean);
}
