const quiz = (q, opts, correct, explain) => ({ tipo: "quiz", q, opts, correct, explain });
const encaixe = (enunciado, pecas, explain) => ({ tipo: "encaixe", enunciado, pecas, explain });

export const WEB_PROJECT_MODULES = [
  {
    id: "js-arquitetura",
    nome: "JS: aplicação de verdade",
    ponto: "Itaim Bibi",
    tag: "PROJETO 01",
    desc: "Módulos, estado, formulários, erros e persistência local.",
    projeto: {
      titulo: "Base do CorreTasks",
      entrega: "Uma aplicação organizada em módulos, pronta para receber um CRUD.",
      criterios: ["Separar dados, interface e eventos", "Validar formulário sem recarregar a página", "Salvar e restaurar JSON no localStorage", "Tratar dados ausentes ou corrompidos"],
    },
    lessons: [
      { t: "Estado é a fonte da verdade", txt: "Em aplicação real, a tela é uma representação do estado. Você altera o array de tarefas e chama render(); não espalha mudanças manuais pelo DOM inteiro. Isso deixa criar, editar, excluir e filtrar previsíveis.", code: "let tarefas = carregar();\n\nfunction render() {\n  lista.replaceChildren(...tarefas.map(criarItem));\n}" },
      { t: "Formulário, validação e erros", txt: "O submit é o ponto único de entrada. preventDefault evita o reload; trim, mensagens de erro e try/catch impedem dados ruins e falhas silenciosas.", code: "form.addEventListener('submit', (event) => {\n  event.preventDefault();\n  const titulo = input.value.trim();\n  if (!titulo) return mostrarErro('Informe o título');\n  adicionar(titulo);\n});" },
      { t: "Persistência e módulos", txt: "localStorage guarda texto: serialize com JSON.stringify e valide o retorno do JSON.parse. Em um projeto Vite, export/import separa responsabilidades sem criar variáveis globais.", code: "// storage.js\nexport function salvar(itens) {\n  localStorage.setItem('tarefas', JSON.stringify(itens));\n}" },
    ],
    desafios: [
      quiz("Qual deve ser a fonte da verdade de um CRUD em JS?", ["O HTML espalhado pela página", "Um estado central; a tela é renderizada a partir dele", "O console", "Cada botão guarda sua própria lista"], 1, "Um estado central reduz inconsistências: toda mudança atualiza os dados e depois renderiza a interface."),
      encaixe("Organize o submit seguro:", ["form.addEventListener('submit', (event) => {", "  event.preventDefault();", "  const titulo = input.value.trim();", "  if (!titulo) return;", "  adicionarTarefa(titulo);", "});"], "Primeiro segura o reload, depois lê e valida, só então altera o estado."),
      { tipo: "code", lang: "js", arquivo: "storage.js", enunciado: "Persistência defensiva", missao: "implementar carregar() para devolver o array salvo ou [] se a chave não existir ou o JSON estiver inválido.", starter: "function carregar() {\n  // leia a chave tarefas, use try/catch e devolva [] como fallback\n}\n\nconsole.log(Array.isArray(carregar()));", esperado: ["true"], regras: [{ re: "localStorage\\.getItem", label: "ler storage", falta: "Leia com localStorage.getItem('tarefas')." }, { re: "try", label: "try/catch", falta: "JSON externo pode estar inválido: proteja o parse com try/catch." }, { re: "JSON\\.parse", label: "parse", falta: "Converta o texto com JSON.parse." }], dicas: ["Leia a chave dentro do try.", "Se não houver valor ou ocorrer erro, retorne []."], gabarito: "function carregar() {\n  try {\n    const salvo = localStorage.getItem('tarefas');\n    return salvo ? JSON.parse(salvo) : [];\n  } catch {\n    return [];\n  }\n}\n\nconsole.log(Array.isArray(carregar()));" },
      quiz("Por que usar export/import?", ["Para deixar o CSS mais rápido", "Para explicitar dependências e separar responsabilidades", "Para substituir funções", "Porque localStorage exige módulos"], 1, "Módulos evitam globais e deixam claro o que cada arquivo oferece e consome."),
      encaixe("Organize o fluxo de atualização:", ["const novaLista = adicionar(tarefas, dados);", "tarefas = novaLista;", "salvar(tarefas);", "render(tarefas);"], "Regra pura primeiro, depois estado, persistência e interface."),
    ],
  },
  {
    id: "js-crud-dashboard",
    nome: "Projeto: CRUD e dashboard",
    ponto: "Vila Olímpia",
    tag: "PROJETO 02",
    desc: "Criar, listar, editar, excluir, filtrar e calcular indicadores.",
    projeto: {
      titulo: "CorreTasks em JavaScript",
      entrega: "CRUD responsivo persistido no navegador, com dashboard e estados vazios.",
      criterios: ["Create, Read, Update e Delete funcionando", "IDs estáveis e confirmação de exclusão", "Filtro e busca", "Cards de total, pendentes e concluídas", "Layout mobile e desktop", "Dados preservados após atualizar a página"],
    },
    lessons: [
      { t: "CRUD imutável", txt: "Create usa spread, Update usa map e Delete usa filter. Cada operação devolve um array novo e mantém a regra separada do DOM.", code: "const criar = (lista, item) => [...lista, item];\nconst editar = (lista, id, patch) =>\n  lista.map(x => x.id === id ? { ...x, ...patch } : x);\nconst excluir = (lista, id) => lista.filter(x => x.id !== id);" },
      { t: "Edição e identidade", txt: "O id liga botão, formulário e registro. Ao editar, carregue o item no formulário e mantenha o mesmo id; índice do array não é identidade estável.", code: "const id = crypto.randomUUID();\nbutton.dataset.id = tarefa.id;" },
      { t: "Dashboard derivado", txt: "Totais não precisam de outro estado: são valores derivados da lista. filter e reduce calculam indicadores sempre consistentes com o CRUD.", code: "const total = tarefas.length;\nconst concluidas = tarefas.filter(t => t.feita).length;\nconst pendentes = total - concluidas;" },
    ],
    desafios: [
      { tipo: "code", lang: "js", arquivo: "tarefas.js", enunciado: "Implemente Update e Delete", missao: "editar o título do id 2 e excluir o id 1; imprimir os títulos restantes.", preambulo: "const tarefas = [{ id: 1, titulo: 'HTML' }, { id: 2, titulo: 'JS' }];", starter: "const editadas = tarefas.map(/* edite o id 2 para JS avançado */);\nconst finais = editadas.filter(/* remova o id 1 */);\nconsole.log(finais.map(t => t.titulo).join(','));", esperado: ["JS avançado"], regras: [{ re: "\\.map\\(", label: "map", falta: "Use map para atualizar sem alterar o array original." }, { re: "\\.filter\\(", label: "filter", falta: "Use filter para excluir pelo id." }, { re: "\\.\\.\\.", label: "spread", falta: "Copie o objeto com spread ao editar." }], dicas: ["No map, compare t.id === 2.", "No filter, mantenha t.id !== 1."], gabarito: "const editadas = tarefas.map(t => t.id === 2 ? { ...t, titulo: 'JS avançado' } : t);\nconst finais = editadas.filter(t => t.id !== 1);\nconsole.log(finais.map(t => t.titulo).join(','));" },
      quiz("Qual operação representa cada letra de CRUD?", ["Copy, Run, Undo, Deploy", "Create, Read, Update, Delete", "Create, React, Upload, Database", "Controller, Repository, User, DTO"], 1, "CRUD é criar, ler, atualizar e excluir — o ciclo básico de dados de quase todo sistema."),
      encaixe("Fluxo correto do botão Excluir:", ["const id = botao.dataset.id;", "const confirmou = confirm('Excluir?');", "if (!confirmou) return;", "tarefas = tarefas.filter(t => t.id !== id);", "salvar(tarefas);", "render();"], "Identifica, confirma, altera o estado, persiste e renderiza."),
      quiz("Por que o dashboard deve ser derivado da lista?", ["Para evitar estado duplicado e números inconsistentes", "Porque reduce altera o HTML", "Para não precisar de CSS", "Porque localStorage só aceita números"], 0, "Se a lista é a fonte da verdade, os indicadores são calculados dela."),
      encaixe("Ordem do projeto concluído:", ["Validar os dados do formulário", "Alterar o estado", "Persistir o estado", "Renderizar lista e indicadores", "Testar criar, editar, excluir e recarregar"], "Esse ciclo transforma exercícios isolados em uma aplicação verificável."),
    ],
  },
  {
    id: "react-migracao",
    nome: "React: migrando o CRUD",
    ponto: "Paraíso",
    tag: "PROJETO 03",
    desc: "Componentes, formulários, rotas e API sem perder a base do JS.",
    projeto: {
      titulo: "CorreTasks em React",
      entrega: "Migrar o CRUD vanilla para uma SPA React organizada por pages, components, hooks e services.",
      criterios: ["Rotas de login e dashboard", "Formulário controlado para criar e editar", "Hook para acesso aos dados", "Service isolando fetch", "Loading, erro e estado vazio", "Rota protegida preparada para autenticação"],
    },
    lessons: [
      { t: "Migrar responsabilidades", txt: "Não converta linha por linha. O estado vira useState, render() vira JSX, eventos viram props e regras puras continuam em funções. Pages compõem components; services conversam com APIs.", code: "src/\n  components/TarefaCard/\n  hooks/useTarefas.js\n  pages/Dashboard/\n  services/tarefasApi.js" },
      { t: "Formulário de criar e editar", txt: "Um formulário controlado pode atender os dois modos. Se existe idEmEdicao, atualiza; caso contrário, cria. Depois limpa campos e erros.", code: "const salvar = (event) => {\n  event.preventDefault();\n  if (idEmEdicao) atualizar(idEmEdicao, form);\n  else criar(form);\n};" },
      { t: "Rotas e estados da API", txt: "Navegação é responsabilidade do roteador. A página de dashboard trata carregando, falha, vazio e sucesso antes de renderizar a lista.", code: "if (loading) return <Carregando />;\nif (erro) return <Erro mensagem={erro} />;\nif (!tarefas.length) return <EstadoVazio />;" },
    ],
    desafios: [
      quiz("Na migração para React, o antigo render() vira principalmente:", ["Um arquivo SQL", "JSX derivado do state", "Um setTimeout", "Uma classe Java"], 1, "React renderiza JSX novamente quando o state muda."),
      { tipo: "code", lang: "jsx", arquivo: "FormularioTarefa.jsx", enunciado: "Formulário controlado", missao: "ligar input ao state e adicionar o título na lista no submit, sem recarregar.", starter: "function App() {\n  const [titulo, setTitulo] = useState('');\n  const [tarefas, setTarefas] = useState([]);\n\n  function salvar(event) {\n    // impedir reload, adicionar titulo e limpar campo\n  }\n\n  return <><form onSubmit={salvar}><input value={titulo} onChange={e => setTitulo(e.target.value)} /><button>Adicionar</button></form><p>{tarefas.join(', ')}</p></>;\n}", esperado: ["Adicionar"], dicasAuto: [{ re: "preventDefault", falta: "Impeça o recarregamento no submit." }, { re: "setTarefas", falta: "Atualize a lista com setTarefas." }, { re: "setTitulo", falta: "Limpe o input depois de salvar." }], dicas: ["Use setTarefas(lista => [...lista, titulo]).", "Finalize com setTitulo('')."], gabarito: "function App() {\n  const [titulo, setTitulo] = useState('');\n  const [tarefas, setTarefas] = useState([]);\n  function salvar(event) { event.preventDefault(); setTarefas(lista => [...lista, titulo]); setTitulo(''); }\n  return <><form onSubmit={salvar}><input value={titulo} onChange={e => setTitulo(e.target.value)} /><button>Adicionar</button></form><p>{tarefas.join(', ')}</p></>;\n}" },
      encaixe("Separe as responsabilidades:", ["tarefasApi.js faz as requisições HTTP", "useTarefas.js controla dados, loading e erro", "Dashboard/index.jsx compõe a página", "TarefaCard/index.jsx exibe uma tarefa"], "Service, hook, page e component têm motivos diferentes para mudar."),
      quiz("Onde deve ficar a URL e a chamada fetch de tarefas?", ["Duplicada em cada botão", "Em um service de API", "No CSS", "Dentro do localStorage"], 1, "Isolar HTTP evita duplicação e facilita testes e troca de backend."),
      encaixe("Estados de uma requisição:", ["Ativar loading e limpar erro anterior", "Fazer a requisição", "Validar res.ok e converter JSON", "Atualizar os dados", "Capturar erro", "Desativar loading no finally"], "Uma interface robusta representa sucesso e falha, não só o caminho feliz."),
    ],
  },
  {
    id: "react-typescript-projeto",
    nome: "React + TypeScript",
    ponto: "Consolação",
    tag: "PROJETO 04",
    desc: "Tipar props, eventos, estado, API e erros durante a migração.",
    projeto: {
      titulo: "Migração segura para TypeScript",
      entrega: "Converter o CorreTasks para TS sem any e com contratos na fronteira da API.",
      criterios: ["Componentes em .tsx", "Props e formulários tipados", "Modelo Tarefa compartilhado", "Respostas da API validadas", "Estados loading/error tipados", "Build com TypeScript sem erros e sem any explícito"],
    },
    lessons: [
      { t: "Tipos do domínio e props", txt: "Comece pelo modelo que atravessa a aplicação. Props descrevem o contrato do componente; ids, status e datas deixam de ser suposições.", code: "type Tarefa = { id: string; titulo: string; feita: boolean };\ntype Props = { tarefa: Tarefa; onExcluir(id: string): void };" },
      { t: "Eventos, state e uniões", txt: "Eventos do React têm tipos próprios. Uniões literais representam estados impossíveis de confundir melhor que vários booleans soltos.", code: "type Status = 'idle' | 'loading' | 'success' | 'error';\nconst [status, setStatus] = useState<Status>('idle');\nconst mudar = (e: React.ChangeEvent<HTMLInputElement>) => {}" },
      { t: "A API é uma fronteira desconhecida", txt: "Anotar fetch como Tarefa[] não valida o JSON. Receba unknown e valide campos antes de confiar; TypeScript protege o código que você escreveu, não dados externos.", code: "function isTarefa(valor: unknown): valor is Tarefa {\n  return typeof valor === 'object' && valor !== null && 'id' in valor;\n}" },
    ],
    desafios: [
      quiz("Qual tipo deve ser preferido para dado externo ainda não validado?", ["any", "unknown", "never", "void"], 1, "unknown obriga verificar o valor antes de usá-lo; any desliga a segurança."),
      encaixe("Monte as props do card:", ["type TarefaCardProps = {", "  tarefa: Tarefa;", "  onEditar(id: string): void;", "  onExcluir(id: string): void;", "};"], "As props documentam e verificam o contrato do componente."),
      { tipo: "code", lang: "ts", arquivo: "tarefas.ts", enunciado: "Atualização tipada", missao: "criar o tipo Tarefa e uma função concluir que devolve cópia com feita true.", starter: "// crie o type Tarefa com id string, titulo string e feita boolean\n// crie function concluir(tarefa: Tarefa): Tarefa\n\n", esperado: [], regras: [{ re: "type\\s+Tarefa", label: "tipo", falta: "Declare o tipo Tarefa." }, { re: "id\\s*:\\s*string", label: "id", falta: "O id deve ser string." }, { re: "\\)\\s*:\\s*Tarefa", label: "retorno", falta: "Tipa o retorno como Tarefa." }, { re: "\\.\\.\\.tarefa", label: "imutabilidade", falta: "Copie a tarefa com spread." }], dicas: ["type Tarefa = { id: string; titulo: string; feita: boolean }", "return { ...tarefa, feita: true };"], gabarito: "type Tarefa = { id: string; titulo: string; feita: boolean };\nfunction concluir(tarefa: Tarefa): Tarefa { return { ...tarefa, feita: true }; }" },
      quiz("Por que não basta escrever const dados: Tarefa[] = await res.json()?", ["Porque fetch só funciona em JS", "Porque a anotação não valida o JSON recebido em runtime", "Porque arrays não podem ser tipados", "Porque React remove interfaces"], 1, "O servidor pode devolver qualquer coisa; valide a fronteira antes de usar."),
      encaixe("Ordem segura da migração:", ["Ativar TypeScript e permitir migração incremental", "Tipar modelos do domínio", "Tipar props, state e eventos", "Tipar services e validar respostas externas", "Remover any e executar build/testes"], "Migrar por fronteiras mantém o app funcionando enquanto a segurança aumenta."),
    ],
  },
];

export const FULLSTACK_PROJECT_MODULES = [
  {
    id: "spring-crud-real",
    nome: "Spring: CRUD com banco",
    ponto: "Chácara Santo Antônio",
    tag: "PROJETO 05",
    desc: "Entidade, DTO, validação, migrations e respostas HTTP corretas.",
    projeto: {
      titulo: "API persistente do CorreTasks",
      entrega: "API REST conectada ao PostgreSQL com CRUD completo e contrato documentado.",
      criterios: ["Migration criando tabelas", "Entity e Repository", "DTOs de entrada e saída", "Validação com @Valid", "GET, POST, PUT e DELETE", "404 e erros de validação padronizados", "Testes de integração do CRUD"],
    },
    lessons: [
      { t: "Banco versionado e entidade", txt: "A migration é a fonte versionada do esquema. @Entity mapeia Java para tabela e JpaRepository oferece persistência; produção não deve depender de criar tabela magicamente.", code: "@Entity\n@Table(name = \"tarefas\")\npublic class Tarefa {\n  @Id @GeneratedValue\n  private Long id;\n}" },
      { t: "DTO e validação", txt: "A entidade não deve ser o contrato público da API. DTO controla os campos aceitos e Bean Validation rejeita entrada inválida antes da regra de negócio.", code: "public record CriarTarefaDTO(\n  @NotBlank @Size(max = 120) String titulo\n) {}" },
      { t: "HTTP e erros previsíveis", txt: "POST responde 201, exclusão 204, recurso ausente 404 e entrada inválida 400. Um @RestControllerAdvice transforma exceções em um corpo de erro consistente.", code: "@ExceptionHandler(NotFoundException.class)\nResponseEntity<ApiError> notFound(NotFoundException ex) {\n  return ResponseEntity.status(404).body(new ApiError(ex.getMessage()));\n}" },
    ],
    desafios: [
      quiz("Por que usar migration?", ["Para desenhar o dashboard", "Para versionar e reproduzir mudanças do banco", "Para substituir o Repository", "Para gerar JWT"], 1, "Flyway/Liquibase tornam o esquema rastreável e igual entre ambientes."),
      encaixe("Fluxo de criação no backend:", ["Controller recebe @Valid CriarTarefaDTO", "Service aplica a regra", "Mapper cria a Entity", "Repository salva", "Controller devolve 201 com DTO de saída"], "A API mantém contrato, regra e persistência em camadas claras."),
      { tipo: "code", lang: "java", arquivo: "TarefaController.java", enunciado: "Endpoint DELETE correto", missao: "criar DELETE /{id}, receber @PathVariable Long id, chamar service.excluir(id) e responder 204.", starter: "@RestController\n@RequestMapping(\"/api/tarefas\")\npublic class TarefaController {\n  private TarefaService service;\n\n  // implemente o DELETE\n}\n", regras: [{ re: "@DeleteMapping", label: "mapping", falta: "Use @DeleteMapping(\"/{id}\")." }, { re: "@PathVariable", label: "id", falta: "Receba o id com @PathVariable." }, { re: "service\\.excluir", label: "service", falta: "Delegue a exclusão ao service." }, { re: "noContent", label: "204", falta: "Responda ResponseEntity.noContent().build()." }], saida: "DELETE /api/tarefas/1 → 204 No Content", dicas: ["O método pode devolver ResponseEntity<Void>.", "Não devolva uma entidade depois de excluir."], gabarito: "@DeleteMapping(\"/{id}\")\npublic ResponseEntity<Void> excluir(@PathVariable Long id) {\n  service.excluir(id);\n  return ResponseEntity.noContent().build();\n}" },
      quiz("Qual camada deve concentrar a regra de negócio?", ["Controller", "Service", "Repository", "Componente React"], 1, "Controller traduz HTTP; Service decide; Repository persiste."),
      encaixe("Resposta de erro padronizada:", ["Service lança NotFoundException", "@RestControllerAdvice captura", "Handler cria ApiError", "ResponseEntity devolve status 404 e JSON"], "O cliente recebe um contrato de erro previsível em vez de stack trace."),
    ],
  },
  {
    id: "spring-auth",
    nome: "Autenticação e autorização",
    ponto: "Morumbi",
    tag: "PROJETO 06",
    desc: "Cadastro, hash de senha, login, JWT e regras por usuário.",
    projeto: {
      titulo: "Identidade segura",
      entrega: "Cadastro e login integrados ao Spring Security, com tarefas isoladas por usuário.",
      criterios: ["E-mail único e entrada validada", "Senha armazenada com BCrypt", "Login devolvendo token com expiração", "Filtro validando token", "Endpoints protegidos", "Usuário só acessa os próprios dados", "Segredo fora do código-fonte", "Testes 401 e 403"],
    },
    lessons: [
      { t: "Autenticar não é autorizar", txt: "Autenticação confirma quem é o usuário; autorização decide o que ele pode fazer. Um token válido não permite acessar a tarefa de outra pessoa.", code: "Tarefa tarefa = repo.findByIdAndUsuarioId(id, usuario.id())\n  .orElseThrow(NotFoundException::new);" },
      { t: "Senha nunca é texto puro", txt: "Cadastro transforma a senha com PasswordEncoder; login usa matches. Não descriptografe, não registre senha e não devolva hash no DTO.", code: "String hash = passwordEncoder.encode(dto.senha());\npasswordEncoder.matches(senhaInformada, usuario.getSenhaHash());" },
      { t: "JWT e configuração", txt: "O token carrega identidade e expiração, é assinado com segredo externo e validado a cada requisição. 401 significa não autenticado; 403, autenticado sem permissão.", code: "Authorization: Bearer <token>\nJWT_SECRET=${JWT_SECRET}" },
    ],
    desafios: [
      quiz("Onde guardar a senha do usuário?", ["Texto puro", "Hash forte produzido por BCrypt/Argon2", "Dentro do JWT", "No localStorage do backend"], 1, "Hash de senha é unilateral e inclui salt; vazamento não revela imediatamente as senhas."),
      encaixe("Fluxo de login:", ["Buscar usuário por e-mail", "Comparar senha com PasswordEncoder.matches", "Gerar token assinado com expiração", "Devolver token e perfil sem senha"], "O servidor verifica o segredo e emite uma credencial limitada."),
      quiz("Diferença entre 401 e 403:", ["São iguais", "401 sem autenticação válida; 403 sem permissão", "401 é erro de banco", "403 é erro de validação"], 1, "Essa distinção ajuda front, testes e auditoria."),
      encaixe("Proteja a propriedade da tarefa:", ["Extrair usuário autenticado do contexto", "Buscar tarefa por id e usuarioId", "Se não encontrar, responder 404", "Só então atualizar ou excluir"], "Consultar também pelo dono impede IDOR: trocar o id na URL não dá acesso a dado alheio."),
      { tipo: "code", lang: "java", arquivo: "CadastroService.java", enunciado: "Hash antes de persistir", missao: "codificar dto.senha() com passwordEncoder e definir o hash no usuário antes de salvar.", starter: "public Usuario cadastrar(CadastroDTO dto) {\n  Usuario usuario = new Usuario();\n  usuario.setEmail(dto.email());\n  // proteja a senha e salve\n}\n", regras: [{ re: "passwordEncoder\\.encode", label: "hash", falta: "Use passwordEncoder.encode(dto.senha())." }, { re: "setSenha", label: "atribuir", falta: "Atribua o hash, nunca a senha pura." }, { re: "repository\\.save", label: "salvar", falta: "Persista só depois de preparar o usuário." }], saida: "Usuário salvo sem senha em texto puro", dicas: ["Guarde o resultado de encode em uma variável hash.", "Finalize com return repository.save(usuario)."], gabarito: "public Usuario cadastrar(CadastroDTO dto) {\n  Usuario usuario = new Usuario();\n  usuario.setEmail(dto.email());\n  String hash = passwordEncoder.encode(dto.senha());\n  usuario.setSenhaHash(hash);\n  return repository.save(usuario);\n}" },
    ],
  },
  {
    id: "react-auth-dashboard",
    nome: "React: auth e dashboard",
    ponto: "Clínicas",
    tag: "PROJETO 07",
    desc: "Sessão, rotas protegidas, CRUD remoto e experiência completa.",
    projeto: {
      titulo: "Dashboard autenticado",
      entrega: "Front React integrado à API real, cobrindo autenticação e todo o CRUD.",
      criterios: ["Cadastro, login e logout", "Sessão restaurada de forma consciente", "Rotas públicas e protegidas", "Cliente HTTP envia credencial", "CRUD completo com confirmação", "Loading, erro, vazio e retry", "Dashboard responsivo e acessível", "401 encerra ou renova a sessão"],
    },
    lessons: [
      { t: "Sessão e rota protegida", txt: "AuthProvider concentra usuário, token, login e logout. A rota protegida decide entre carregamento, redirecionamento e conteúdo; não replique essa lógica em toda página.", code: "function RotaProtegida() {\n  const { usuario, loading } = useAuth();\n  if (loading) return <Carregando />;\n  return usuario ? <Outlet /> : <Navigate to=\"/login\" replace />;\n}" },
      { t: "Cliente HTTP e falhas", txt: "Um cliente central injeta a credencial e normaliza erros. Verifique res.ok: fetch só rejeita automaticamente em falha de rede, não em 400 ou 500.", code: "const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });\nif (!res.ok) throw new ApiError(res.status, await res.json());" },
      { t: "Dashboard que comunica estado", txt: "Desabilite ações durante envio, preserve dados em retry, confirme exclusão e anuncie feedback. O usuário precisa saber se a ação começou, terminou ou falhou.", code: "{status === 'loading' && <Spinner />}\n{status === 'error' && <Alerta onRetry={carregar} />}\n{status === 'success' && <Lista tarefas={tarefas} />}" },
    ],
    desafios: [
      quiz("fetch entra no catch quando a API responde 401?", ["Sempre", "Não; é preciso verificar res.ok/status", "Só no React", "Só com TypeScript"], 1, "fetch resolve a Promise em respostas HTTP; rejeita principalmente em falha de rede."),
      encaixe("Rota protegida sem piscar a tela de login:", ["AuthProvider inicia loading true", "Restaura ou valida a sessão", "Finaliza loading", "RotaProtegida mostra spinner enquanto carrega", "Depois renderiza Outlet ou Navigate"], "Separar loading evita redirecionamento prematuro."),
      { tipo: "code", lang: "jsx", arquivo: "RotaProtegida.jsx", enunciado: "Proteção declarativa", missao: "mostrar Carregando enquanto loading; com usuario mostrar Dashboard; sem usuário mostrar Login.", starter: "function App() {\n  const loading = false;\n  const usuario = { nome: 'Edu' };\n\n  // retorne conforme os três estados\n}\n\nfunction Carregando(){ return <p>Carregando...</p> }\nfunction Dashboard(){ return <h1>Dashboard</h1> }\nfunction Login(){ return <h1>Login</h1> }", esperado: ["Dashboard"], dicasAuto: [{ re: "loading", falta: "Trate loading primeiro." }, { re: "usuario", falta: "Decida a tela a partir do usuário." }], dicas: ["if (loading) return <Carregando />;", "return usuario ? <Dashboard /> : <Login />;"], gabarito: "function App() { const loading = false; const usuario = { nome: 'Edu' }; if (loading) return <Carregando />; return usuario ? <Dashboard /> : <Login />; }\nfunction Carregando(){ return <p>Carregando...</p> }\nfunction Dashboard(){ return <h1>Dashboard</h1> }\nfunction Login(){ return <h1>Login</h1> }" },
      quiz("Quem deve verificar se a tarefa pertence ao usuário?", ["Somente o botão do React", "O backend, em toda operação protegida", "O CSS", "O navegador automaticamente"], 1, "A interface pode esconder ações, mas só o servidor é barreira de segurança."),
      encaixe("Exclusão com boa UX:", ["Usuário solicita excluir", "Interface pede confirmação", "Botão entra em estado de envio", "API recebe DELETE autenticado", "Sucesso remove item; falha mostra erro e preserva dados"], "A UI reflete o ciclo real sem mentir para o usuário."),
    ],
  },
  {
    id: "capstone-deploy",
    nome: "Capstone: produção",
    ponto: "Faria Lima",
    tag: "BOSS FINAL",
    desc: "Testes, segurança, Git, configuração e deploy do sistema completo.",
    projeto: {
      titulo: "Sistema fullstack publicado",
      entrega: "Repositório e aplicação online demonstrando CRUD, autenticação e dashboard.",
      criterios: ["README com arquitetura e setup", "Commits e branches compreensíveis", "Testes unitários e de integração", "Variáveis de ambiente sem segredos no Git", "Banco e migrations em produção", "CORS restrito ao front publicado", "HTTPS e logs sem dados sensíveis", "Smoke test de cadastro, login e CRUD", "URL pública do front e da API"],
    },
    lessons: [
      { t: "Pirâmide de testes útil", txt: "Teste regras puras rápido, integração do Repository/API com infraestrutura realista e poucos fluxos ponta a ponta. O objetivo é confiança, não porcentagem decorativa.", code: "unitário: regra de domínio\nintegração: API + banco\ne2e: cadastro → login → CRUD" },
      { t: "Configuração por ambiente", txt: "URLs, credenciais e segredos vêm do ambiente. O repositório guarda .env.example sem valores reais; migrations preparam o banco no deploy.", code: "VITE_API_URL=https://api.exemplo.com\nJWT_SECRET=<somente no provedor>\nSPRING_PROFILES_ACTIVE=prod" },
      { t: "Definition of Done", txt: "Build passar não basta. Rode testes, aplique migration, verifique CORS/HTTPS, faça smoke test e documente rollback. Deploy é parte do desenvolvimento.", code: "npm run build\n./mvnw test\n# deploy\n# smoke: cadastro, login, create, update, delete, logout" },
    ],
    desafios: [
      quiz("O que pode entrar no .env.example?", ["O JWT_SECRET real", "Nomes das variáveis com valores fictícios", "Senha de produção", "Token pessoal"], 1, "O exemplo documenta configuração sem publicar segredos."),
      encaixe("Pipeline mínimo:", ["Instalar dependências de forma reproduzível", "Executar lint e testes", "Gerar build", "Aplicar migrations", "Publicar", "Executar smoke test"], "Falhar cedo impede publicar código que nem compila ou não passa nos testes."),
      quiz("Qual teste prova melhor o fluxo principal inteiro?", ["Teste de uma função soma", "E2E de cadastro, login e CRUD", "Screenshot do CSS", "Compilar uma interface TS"], 1, "O E2E cobre as fronteiras principais; mantenha poucos fluxos críticos para não criar uma suíte lenta e frágil."),
      encaixe("Checklist de segurança antes do deploy:", ["Remover segredos do repositório", "Restringir CORS", "Exigir HTTPS", "Validar entrada no backend", "Confirmar autorização por proprietário", "Evitar senha/token em logs"], "Segurança é uma sequência de controles, não uma biblioteca isolada."),
      quiz("Quando o projeto pode ser considerado concluído?", ["Quando abre no localhost", "Quando critérios, testes, deploy, documentação e smoke test passam", "Quando o CSS fica bonito", "Quando o primeiro POST funciona"], 1, "A Definition of Done transforma a promessa do curso em uma entrega verificável."),
    ],
  },
];
