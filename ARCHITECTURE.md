# Arquitetura do Dev do Corre

O `App.jsx` é somente o orquestrador da navegação, do curso ativo e do progresso. Conteúdo, interface, persistência e execução dos desafios não vivem mais no componente raiz.

## Estrutura

```text
src/
  components/              componentes reutilizáveis; uma pasta por componente
  config/                  temas, animações e constantes da aplicação
  data/                    currículo declarativo e projetos práticos
  hooks/                   comportamento React reutilizável
  pages/                   telas da aplicação; uma pasta por página
  services/                persistência, XP, streak e montagem do corre diário
  styles/                  estilos globais e tokens visuais
  utils/                   lint amigável e runtime dos sandboxes
  App.jsx                  composição e transição entre páginas
```

Os arquivos `components/*/index.jsx` expõem uma API pequena. Os índices em `components/ui` e `components/challenges` são apenas *barrels* de compatibilidade para imports agrupados.

## Onde fazer cada mudança

- Novo conteúdo ou desafio: `src/data/curriculum.js` ou `src/data/expandedCurriculum.js`.
- Nova tela: uma pasta em `src/pages` e composição no `App.jsx`.
- Comportamento compartilhado com estado/efeito: `src/hooks`.
- Regra sem React: `src/services` ou `src/utils`.
- Componente visual reutilizável: pasta própria em `src/components`.
- Tokens e estilos compartilhados: `src/styles/global.css`.

## Trilha orientada a entregas

Os módulos marcados como `PROJETO` ou `BOSS FINAL` possuem `projeto.entrega` e `projeto.criterios`. Os exercícios internos verificam fundamentos; os critérios de aceite determinam se a entrega real foi concluída.

Depois dos desafios, a página `EntregaProjeto` exige a conferência de todos os critérios e uma declaração explícita de que a implementação foi executada e testada. O módulo de projeto não libera o próximo ponto apenas com quizzes.

O caminho recomendado é:

1. fundamentos de HTML, CSS e JavaScript;
2. arquitetura e CRUD persistido em JavaScript;
3. migração para React;
4. migração para TypeScript;
5. API Spring com banco e validação;
6. autenticação e autorização;
7. dashboard integrado;
8. testes e deploy.

## Verificação

```bash
npm test
```

O comando valida a integridade do currículo e gera o build web de produção.

## Builds por plataforma

- `npm run dev`: aplicação web com Framer Motion real.
- `npm run build`: produção web com todas as animações.
- `npm run build:switch`: configuração legada separada, usando o shim sem animações.
