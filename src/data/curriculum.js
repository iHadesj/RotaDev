import { FULLSTACK_PROJECT_MODULES, WEB_PROJECT_MODULES } from "./expandedCurriculum.js";

export const MODULES_FULLSTACK = [
  {
    id: "react-basico",
    nome: "React: o começo do corre",
    ponto: "Terminal Varginha",
    tag: "PONTO 01",
    desc: "Componente, JSX, props e state. A base de tudo.",
    lessons: [
      {
        t: "O que é React, afinal?",
        txt: 'React é uma biblioteca JavaScript pra montar interface. A ideia central: tudo é COMPONENTE — uma função que recebe dados e devolve JSX (aquela "marcação" parecida com HTML). Você monta a tela juntando componente igual peça de Lego.',
        code: "function Salve() {\n  return <h1>Salve, São Paulo!</h1>;\n}",
      },
      {
        t: "Props: passando dados pra dentro",
        txt: "Props são os parâmetros do componente. O pai manda, o filho recebe. Props são SOMENTE LEITURA — o filho não altera o que recebeu.",
        code: 'function Card({ nome }) {\n  return <p>E aí, {nome}!</p>;\n}\n\n<Card nome="Edu" />',
      },
      {
        t: "State: a memória do componente",
        txt: "useState guarda um valor que muda com o tempo (contador, texto de input, se o modal está aberto...). Quando você chama a função set, o React re-renderiza o componente com o valor novo.",
        code: "const [likes, setLikes] = useState(0);\n\n<button onClick={() => setLikes(likes + 1)}>\n  Curtir ({likes})\n</button>",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Como interpola uma variável dentro do JSX?",
        opts: [
          "<p>{{nome}}</p>",
          "<p>${nome}</p>",
          "<p>{nome}</p>",
          "<p><%= nome %></p>",
        ],
        correct: 2,
        explain:
          "Chave simples { }. Chave dupla é coisa de Vue/Angular, e ${ } é template string do JS puro — dentro do JSX não funciona.",
      },
      {
        tipo: "encaixe",
        enunciado:
          "Monta o componente Perfil que recebe a prop nome e mostra uma saudação:",
        pecas: [
          "function Perfil({ nome }) {",
          "  return (",
          "    <h2>E aí, {nome}!</h2>",
          "  );",
          "}",
        ],
        explain:
          "Função → return → JSX dentro → fecha o return → fecha a função. A prop chega desestruturada no parâmetro: { nome }.",
      },
      {
        tipo: "code",
        lang: "jsx",
        arquivo: "App.jsx",
        enunciado: "Seu primeiro componente rodando DE VERDADE:",
        missao: "fazer aparecer na tela um <h1> escrito Salve, Edu!",
        starter:
          "function App() {\n  // devolve um <h1> com o texto: Salve, Edu!\n\n}",
        esperado: ["Salve, Edu!"],
        dicasAuto: [
          {
            re: "return",
            falta:
              "Todo componente precisa de um return devolvendo o JSX — sem return, não aparece nada.",
          },
          {
            re: "<h1",
            falta: "A missão pede um <h1>. Tag abre <h1> e fecha </h1>.",
          },
        ],
        dicas: [
          "O componente é uma função que RETORNA JSX.",
          "A estrutura toda: return <h1>Salve, Edu!</h1>;",
        ],
        gabarito: "function App() {\n  return <h1>Salve, Edu!</h1>;\n}",
      },
      {
        tipo: "quiz",
        q: "Por que NÃO pode alterar o state na mão, como likes = 5?",
        opts: [
          "Porque dá erro de sintaxe no JS",
          "Porque o React não fica sabendo e a tela não atualiza",
          "Porque state é constante pra sempre",
          "Pode sim, sem problema nenhum",
        ],
        correct: 1,
        explain:
          "O React só re-renderiza quando você usa a função set. Mudando direto, o valor até muda na memória, mas a tela fica pra trás.",
      },
      {
        tipo: "code",
        lang: "jsx",
        arquivo: "App.jsx",
        enunciado: "Botão de curtir com state — o clássico:",
        missao:
          "um botão Curtir (0) que vira Curtir (1), Curtir (2)... a cada clique. O useState já está disponível, nem precisa importar.",
        testa: "👆 clica no botão do preview!",
        starter:
          "function App() {\n  // 1) cria o state:\n  //    const [likes, setLikes] = useState(0)\n  // 2) no clique do botão, soma 1\n\n  return (\n    <button>\n      Curtir (0)\n    </button>\n  );\n}",
        esperado: ["Curtir (0)", "Curtir (1)"],
        dicasAuto: [
          {
            re: "useState",
            falta: "Vai precisar do useState pra guardar os likes.",
          },
          {
            re: "onClick",
            falta: "O botão precisa de um onClick={...} pra reagir ao clique.",
          },
          {
            re: "\\{likes\\}",
            falta:
              "Mostra o valor na tela: Curtir ({likes}) — com chaves pra interpolar.",
          },
        ],
        dicas: [
          "Primeiro o state: const [likes, setLikes] = useState(0);",
          "No botão: onClick={() => setLikes(likes + 1)}",
          "E o texto vira: Curtir ({likes})",
        ],
        gabarito:
          "function App() {\n  const [likes, setLikes] = useState(0);\n\n  return (\n    <button onClick={() => setLikes(likes + 1)}>\n      Curtir ({likes})\n    </button>\n  );\n}",
      },
    ],
  },
  {
    id: "react-inter",
    nome: "React: pegando o ritmo",
    ponto: "Terminal Grajaú",
    tag: "PONTO 02",
    desc: "useEffect, listas com map, condicional e input controlado.",
    lessons: [
      {
        t: "useEffect: efeito colateral",
        txt: "Serve pra sincronizar o componente com o mundo lá fora: buscar dado de API, mexer no título da aba, criar timer. O array de dependências controla QUANDO o efeito roda de novo.",
        code: "useEffect(() => {\n  console.log('montou!');\n}, []); // array vazio = roda 1x, na montagem",
      },
      {
        t: "Lista com map + key",
        txt: "Pra renderizar lista, usa .map(). Cada item precisa de uma key ÚNICA e estável (de preferência o id do dado) — é assim que o React sabe o que entrou, saiu ou mudou.",
        code: "{produtos.map(p => (\n  <li key={p.id}>{p.nome}</li>\n))}",
      },
      {
        t: "Condicional + input controlado",
        txt: "Renderização condicional é ternário ou &&. Input controlado é quando o value vem do state e o onChange atualiza esse state — o React vira o dono da verdade.",
        code: "{logado ? <Painel /> : <Login />}\n\n<input\n  value={busca}\n  onChange={e => setBusca(e.target.value)}\n/>",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "useEffect com array de dependências VAZIO roda quando?",
        opts: [
          "A cada renderização",
          "Só quando o componente monta",
          "Nunca",
          "Só quando o componente desmonta",
        ],
        correct: 1,
        explain:
          "Array vazio = nenhuma dependência pra observar = roda uma vez só, na montagem.",
      },
      {
        tipo: "code",
        lang: "jsx",
        arquivo: "App.jsx",
        enunciado: "Renderiza a lista de corres com .map():",
        missao:
          "mostrar os 3 itens do array na tela, cada um numa <li> com key.",
        starter:
          "const corres = ['Estudar React', 'Treinar Java', 'Lançar o app'];\n\nfunction App() {\n  return (\n    <ul>\n      {/* usa corres.map(...) aqui, com key! */}\n    </ul>\n  );\n}",
        esperado: ["Estudar React", "Treinar Java", "Lançar o app"],
        dicasAuto: [
          {
            re: "\\.map\\(",
            falta:
              "Usa corres.map(item => ...) pra transformar cada texto numa <li>.",
          },
          {
            re: "key=",
            falta:
              "Cada <li> precisa da prop key — aqui pode ser o próprio item: key={item}.",
          },
        ],
        dicas: [
          "Dentro do <ul>: {corres.map(item => ...)}",
          "Cada item vira: <li key={item}>{item}</li>",
        ],
        gabarito:
          "const corres = ['Estudar React', 'Treinar Java', 'Lançar o app'];\n\nfunction App() {\n  return (\n    <ul>\n      {corres.map(item => (\n        <li key={item}>{item}</li>\n      ))}\n    </ul>\n  );\n}",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta o input controlado — o React como dono da verdade:",
        pecas: [
          "function Busca() {",
          "  const [texto, setTexto] = useState('');",
          "  return (",
          "    <input",
          "      value={texto}",
          "      onChange={e => setTexto(e.target.value)}",
          "    />",
          "  );",
          "}",
        ],
        explain:
          "Primeiro o state, depois o input com value ligado no state e onChange atualizando. value + onChange = controlado.",
      },
      {
        tipo: "quiz",
        q: "Quando esse parágrafo aparece na tela?",
        code: "{erro && <p>Falha ao carregar!</p>}",
        opts: [
          "Sempre",
          "Quando erro for truthy",
          "Quando erro for false",
          "Nunca, a sintaxe é inválida",
        ],
        correct: 1,
        explain:
          "O && só renderiza o lado direito se o esquerdo for truthy. Atalho clássico de condicional no JSX.",
      },
      {
        tipo: "code",
        lang: "jsx",
        arquivo: "App.jsx",
        enunciado: "Renderização condicional na prática:",
        missao:
          "se online for true, mostrar Online 🟢 — senão, Sem conexão 🔴. Testa trocando o valor de online depois!",
        starter:
          "function App() {\n  const online = true;\n\n  // mostra <p>Online 🟢</p> se online,\n  // senão <p>Sem conexão 🔴</p>\n  return (\n    <div>\n\n    </div>\n  );\n}",
        esperado: ["Online"],
        dicasAuto: [
          {
            re: "\\?|&&",
            falta:
              "Usa ternário {online ? isso : aquilo} ou o operador && dentro do JSX.",
          },
        ],
        dicas: [
          "Dentro da <div>: {online ? <p>Online 🟢</p> : <p>Sem conexão 🔴</p>}",
        ],
        gabarito:
          "function App() {\n  const online = true;\n\n  return (\n    <div>\n      {online ? <p>Online 🟢</p> : <p>Sem conexão 🔴</p>}\n    </div>\n  );\n}",
      },
    ],
  },
  {
    id: "react-avancado",
    nome: "React: modo avançado",
    ponto: "Cidade Dutra",
    tag: "PONTO 03",
    desc: "Custom hooks, Context, memorização e performance.",
    lessons: [
      {
        t: "Custom hook: sua lógica reutilizável",
        txt: 'Quando a mesma lógica de state/efeito aparece em vários componentes, você extrai pra um custom hook. Regra de ouro: o nome SEMPRE começa com "use".',
        code: "function useToggle(inicial) {\n  const [on, setOn] = useState(inicial);\n  const toggle = () => setOn(v => !v);\n  return [on, toggle];\n}",
      },
      {
        t: "Context: chega de prop drilling",
        txt: "Quando um dado precisa descer por vários níveis de componente (tema, usuário logado), passar prop por prop fica trabalhoso. Context deixa qualquer descendente ler o valor direto.",
        code: "const TemaContext = createContext();\n\n// lá embaixo na árvore:\nconst tema = useContext(TemaContext);",
      },
      {
        t: "useMemo, useCallback e React.memo",
        txt: "useMemo memoriza um VALOR calculado pesado. useCallback memoriza uma FUNÇÃO (pra não recriar a cada render). React.memo evita re-render de um componente se as props não mudaram. Use quando tiver problema real de performance, não por vício.",
        code: "const total = useMemo(\n  () => calcularPesado(itens),\n  [itens]\n);",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Qual a regra de nomenclatura de um custom hook?",
        opts: [
          "Qualquer nome serve",
          'Tem que começar com "use"',
          "Tem que ser tudo maiúsculo",
          'Tem que terminar com "Hook"',
        ],
        correct: 1,
        explain:
          "useAlgumaCoisa. É essa convenção que permite o React (e o lint) aplicar as regras de hooks direitinho.",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta o custom hook useToggle — liga/desliga reutilizável:",
        pecas: [
          "function useToggle(inicial) {",
          "  const [on, setOn] = useState(inicial);",
          "  const toggle = () => setOn(v => !v);",
          "  return [on, toggle];",
          "}",
        ],
        explain:
          "Primeiro o state, depois a função que inverte, e o hook devolve os dois num array — assim como o useState faz.",
      },
      {
        tipo: "quiz",
        q: "Diferença entre useMemo e useCallback:",
        opts: [
          "São idênticos, só muda o nome",
          "useMemo memoriza um VALOR; useCallback memoriza uma FUNÇÃO",
          "useCallback só funciona em classe",
          "useMemo roda no servidor",
        ],
        correct: 1,
        explain:
          "useMemo guarda o resultado de um cálculo. useCallback guarda a referência de uma função. useCallback(fn, deps) é basicamente useMemo(() => fn, deps).",
      },
      {
        tipo: "code",
        lang: "jsx",
        arquivo: "useContador.jsx",
        enunciado: "Cria seu primeiro custom hook:",
        missao:
          "completar o useContador pra devolver [n, incrementa]. O App já está pronto usando ele — se o hook funcionar, o botão conta.",
        testa: "👆 clica no botão do preview!",
        starter:
          "// complete o hook: devolve [n, incrementa]\nfunction useContador(inicial) {\n\n}\n\nfunction App() {\n  const [n, incrementa] = useContador(0);\n  return (\n    <button onClick={incrementa}>Cliques: {n}</button>\n  );\n}",
        esperado: ["Cliques: 0", "Cliques: 1"],
        dicasAuto: [
          {
            re: "useState",
            falta:
              "Dentro do hook, usa useState(inicial) pra guardar o número — hook pode usar hook.",
          },
          {
            re: "return\\s*\\[",
            falta: "O hook precisa DEVOLVER um array: return [n, incrementa];",
          },
        ],
        dicas: [
          "Dentro do hook: const [n, setN] = useState(inicial);",
          "A função: const incrementa = () => setN(v => v + 1);",
          "E fecha com: return [n, incrementa];",
        ],
        gabarito:
          "function useContador(inicial) {\n  const [n, setN] = useState(inicial);\n  const incrementa = () => setN(v => v + 1);\n  return [n, incrementa];\n}\n\nfunction App() {\n  const [n, incrementa] = useContador(0);\n  return (\n    <button onClick={incrementa}>Cliques: {n}</button>\n  );\n}",
      },
      {
        tipo: "quiz",
        q: "O que o React.memo faz?",
        opts: [
          "Salva o componente no navegador",
          "Evita re-render do componente se as props não mudaram",
          "Deixa o componente assíncrono",
          "Cria uma cópia independente do componente",
        ],
        correct: 1,
        explain:
          "Ele compara as props: se vieram iguais, o React pula a re-renderização daquele componente. Bom pra filho pesado de pai que renderiza toda hora.",
      },
    ],
  },
  {
    id: "java-basico",
    nome: "Java: a fundação",
    ponto: "Interlagos",
    tag: "PONTO 04",
    desc: "Tipos, métodos, loops e coleções. O concreto do prédio.",
    lessons: [
      {
        t: "Tipagem forte, sem mistério",
        txt: "Em Java toda variável tem tipo declarado e o compilador cobra. Primitivos: int, double, boolean, char... String e as coleções são objetos. Isso pega muito erro ANTES de rodar.",
        code: 'int idade = 25;\ndouble preco = 9.90;\nboolean ativo = true;\nString nome = "Edu";',
      },
      {
        t: "Tudo vive dentro de classe",
        txt: "Java é orientado a objeto de ponta a ponta: método não existe solto, sempre dentro de uma classe. Assinatura de método = visibilidade + retorno + nome + parâmetros.",
        code: "public class Calc {\n  public int somar(int a, int b) {\n    return a + b;\n  }\n}",
      },
      {
        t: "Array x ArrayList",
        txt: "Array tem tamanho FIXO. ArrayList (da Collections) cresce dinamicamente e vem cheio de método útil: add, remove, contains, size...",
        code: 'List<String> nomes = new ArrayList<>();\nnomes.add("Edu");\nnomes.add("Bia");\nnomes.size(); // 2',
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Qual desses é um tipo PRIMITIVO em Java?",
        opts: ["String", "int", "ArrayList", "Integer"],
        correct: 1,
        explain:
          "int, double, boolean, char, long... são primitivos. String, Integer e ArrayList são objetos (classes).",
      },
      {
        tipo: "code",
        lang: "java",
        arquivo: "Main.java",
        enunciado: "Seu primeiro Java: variáveis + println.",
        contexto:
          "Aqui o Java não roda de verdade (ele precisa da JVM, não do navegador) — mas o lint confere seu código como um compilador amigável.",
        missao:
          'declarar String nome = "Edu" e int idade = 25, e imprimir: Edu tem 25 anos',
        starter:
          'public class Main {\n  public static void main(String[] args) {\n    // 1) String nome = "Edu";\n    // 2) int idade = 25;\n    // 3) imprime: Edu tem 25 anos\n\n  }\n}',
        regras: [
          {
            re: 'String\\s+nome\\s*=\\s*"',
            label: "String nome",
            falta:
              'Falta declarar a String nome = "Edu"; — com aspas DUPLAS: em Java, aspas simples é só pra char.',
          },
          {
            re: "int\\s+idade\\s*=\\s*\\d",
            label: "int idade",
            falta: "Falta o int idade = 25; — número vai sem aspas.",
          },
          {
            re: "System\\.out\\.println\\(",
            label: "println",
            falta: "Usa System.out.println(...) pra imprimir no console.",
          },
          {
            re: "nome\\s*\\+|\\+\\s*nome",
            label: "concatenar com +",
            falta: 'Junta as partes com + : nome + " tem " + idade + " anos"',
          },
        ],
        saida: "Edu tem 25 anos",
        dicas: [
          "Declara primeiro as duas variáveis, cada uma com ; no final.",
          'A impressão: System.out.println(nome + " tem " + idade + " anos");',
        ],
        gabarito:
          'public class Main {\n  public static void main(String[] args) {\n    String nome = "Edu";\n    int idade = 25;\n    System.out.println(nome + " tem " + idade + " anos");\n  }\n}',
      },
      {
        tipo: "quiz",
        q: "Pra comparar o CONTEÚDO de duas Strings, usa:",
        opts: ["s1 == s2", "s1.equals(s2)", "s1 === s2", "compare(s1, s2)"],
        correct: 1,
        explain:
          "== compara referência (se é o MESMO objeto na memória). .equals() compara o texto de verdade. Clássica pegadinha de entrevista.",
      },
      {
        tipo: "code",
        lang: "java",
        arquivo: "Main.java",
        enunciado: "Loop somando: 1 + 2 + 3 + 4 + 5.",
        missao:
          "usar um for de 1 até 5 acumulando na variável soma. Saída esperada: 15",
        starter:
          "public class Main {\n  public static void main(String[] args) {\n    int soma = 0;\n\n    // for de 1 até 5, acumulando em soma\n\n    System.out.println(soma);\n  }\n}",
        regras: [
          {
            re: "for\\s*\\(",
            label: "for",
            falta:
              "Falta o for. Estrutura: for (int i = 1; i <= 5; i++) { ... }",
          },
          {
            re: "i\\s*<=\\s*5|i\\s*<\\s*6",
            label: "vai até 5",
            falta: "O loop precisa ir até o 5: condição i <= 5 (ou i < 6).",
          },
          {
            re: "soma\\s*\\+=|soma\\s*=\\s*soma\\s*\\+",
            label: "soma acumula",
            falta:
              "Dentro do loop, acumula: soma += i; (que é o mesmo que soma = soma + i).",
          },
        ],
        saida: "15",
        dicas: [
          "for (int i = 1; i <= 5; i++) { ... }",
          "Dentro das chaves do for: soma += i;",
        ],
        gabarito:
          "public class Main {\n  public static void main(String[] args) {\n    int soma = 0;\n\n    for (int i = 1; i <= 5; i++) {\n      soma += i;\n    }\n\n    System.out.println(soma);\n  }\n}",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a classe Calc com o método somar:",
        pecas: [
          "public class Calc {",
          "  public int somar(int a, int b) {",
          "    return a + b;",
          "  }",
          "}",
        ],
        explain:
          "Classe fora, método dentro: visibilidade + tipo de retorno + nome + parâmetros. O return devolve a conta e cada bloco fecha sua chave.",
      },
    ],
  },
  {
    id: "java-poo",
    nome: "Java: POO na prática",
    ponto: "Socorro",
    tag: "PONTO 05",
    desc: "Classe, objeto, herança, interface e polimorfismo.",
    lessons: [
      {
        t: "Classe é o molde, objeto é a peça",
        txt: "A classe define atributos e comportamentos. O objeto é a instância criada com new. O construtor roda na hora do nascimento pra deixar o objeto pronto pro uso.",
        code: 'public class Carro {\n  private String modelo;\n\n  public Carro(String modelo) {\n    this.modelo = modelo;\n  }\n}\n\nCarro c = new Carro("Gol bolinha");',
      },
      {
        t: "Encapsulamento: cada coisa no seu lugar",
        txt: "Atributo fica private e o mundo externo só acessa pelos métodos que VOCÊ liberou (getters/setters ou métodos de negócio). Isso protege o estado interno de ser bagunçado por fora.",
        code: "public class Conta {\n  private double saldo;\n\n  public void depositar(double valor) {\n    if (valor > 0) saldo += valor;\n  }\n}",
      },
      {
        t: "Herança, interface e polimorfismo",
        txt: "extends herda de UMA classe. implements assina o contrato de uma interface (pode várias). Polimorfismo: a variável pode ser do tipo pai, mas quem manda é o método sobrescrito do tipo REAL do objeto.",
        code: "class Moto extends Veiculo { }\nclass Pix implements Pagamento { }\n\nAnimal a = new Cachorro();\na.fazerSom(); // late! roda o do Cachorro",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Encapsulamento é:",
        opts: [
          "Deixar todos os atributos public",
          "Esconder os detalhes internos (private) e expor só o necessário via métodos",
          "Criar o máximo de classes possível",
          "Usar static em tudo",
        ],
        correct: 1,
        explain:
          "A classe protege o próprio estado. Quem está de fora interage pelos métodos liberados — e a classe valida o que entra.",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a classe Carro com atributo privado e construtor:",
        pecas: [
          "public class Carro {",
          "  private String modelo;",
          "  public Carro(String modelo) {",
          "    this.modelo = modelo;",
          "  }",
          "}",
        ],
        explain:
          "Atributo private primeiro, depois o construtor com o mesmo nome da classe. O this.modelo diferencia o atributo do parâmetro que chegou.",
      },
      {
        tipo: "code",
        lang: "java",
        arquivo: "Conta.java",
        enunciado: "Encapsulamento na prática — a classe Conta:",
        missao:
          "atributo private double saldo + método public void depositar(double valor) que só soma se valor > 0.",
        starter:
          "public class Conta {\n  // 1) atributo private double saldo\n\n  // 2) public void depositar(double valor)\n  //    que só soma no saldo se valor > 0\n\n}",
        regras: [
          {
            re: "private\\s+double\\s+saldo",
            label: "private saldo",
            falta:
              "O saldo tem que ser private double saldo; — encapsulado, ninguém mexe direto de fora.",
          },
          {
            re: "public\\s+void\\s+depositar\\s*\\(\\s*double",
            label: "depositar()",
            falta:
              "Declara o método: public void depositar(double valor) { ... }",
          },
          {
            re: "if\\s*\\(",
            label: "valida com if",
            falta:
              "Protege com if (valor > 0) — conta não aceita depósito negativo.",
          },
          {
            re: "saldo\\s*\\+=|saldo\\s*=\\s*saldo\\s*\\+",
            label: "soma no saldo",
            falta: "Dentro do if, soma: saldo += valor;",
          },
        ],
        saida: "new Conta() → depositar(150.0) → saldo interno: 150.0 ✓",
        dicas: [
          "O atributo: private double saldo; (uma linha só, dentro da classe).",
          "O método: public void depositar(double valor) { if (valor > 0) { saldo += valor; } }",
        ],
        gabarito:
          "public class Conta {\n  private double saldo;\n\n  public void depositar(double valor) {\n    if (valor > 0) {\n      saldo += valor;\n    }\n  }\n}",
      },
      {
        tipo: "quiz",
        q: "Cachorro sobrescreve fazerSom(). O que roda aqui?",
        code: "Animal a = new Cachorro();\na.fazerSom();",
        opts: [
          "O método da classe Animal",
          "O método sobrescrito do Cachorro",
          "Erro de compilação",
          "Nada, o método some",
        ],
        correct: 1,
        explain:
          "Isso é polimorfismo: o tipo REAL do objeto (Cachorro) decide qual versão do método roda em tempo de execução.",
      },
      {
        tipo: "quiz",
        q: "Diferença entre extends e implements:",
        opts: [
          "São sinônimos",
          "extends herda de uma CLASSE; implements assina o contrato de uma INTERFACE",
          "implements herda os atributos privados",
          "extends só serve pra interface",
        ],
        correct: 1,
        explain:
          "extends = herança de classe (uma só). implements = compromisso de implementar os métodos da interface (pode implementar várias).",
      },
    ],
  },
  {
    id: "spring-boot",
    nome: "Spring Boot: o backend",
    ponto: "Largo Treze",
    tag: "PONTO 06",
    desc: "API REST, camadas, annotations e injeção de dependência.",
    lessons: [
      {
        t: "API REST: o balcão do backend",
        txt: "Sua API expõe endpoints HTTP. @RestController marca a classe que atende as requisições e devolve JSON. @GetMapping busca, @PostMapping cria, @PutMapping atualiza, @DeleteMapping apaga.",
        code: '@RestController\n@RequestMapping("/api/produtos")\npublic class ProdutoController {\n\n  @GetMapping\n  public List<Produto> listar() { ... }\n\n  @PostMapping\n  public Produto criar(@RequestBody Produto p) { ... }\n}',
      },
      {
        t: "Camadas: cada uma com sua função",
        txt: "Controller recebe a requisição e devolve resposta. Service guarda a regra de negócio. Repository conversa com o banco. Separar assim deixa o código testável e organizado — igual você já viu no vt_wf, só que com cada coisa no seu lugar.",
        code: "// Controller  →  Service  →  Repository  →  Banco\n\npublic interface ProdutoRepository\n    extends JpaRepository<Produto, Long> { }",
      },
      {
        t: "Injeção de dependência",
        txt: "Você não dá new nos objetos de infraestrutura: declara o que precisa e o Spring cria e entrega pronto. O jeito recomendado é injeção via construtor.",
        code: "@Service\npublic class ProdutoService {\n  private final ProdutoRepository repo;\n\n  public ProdutoService(ProdutoRepository repo) {\n    this.repo = repo; // o Spring injeta\n  }\n}",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "O que a annotation @RestController faz?",
        opts: [
          "Cria o banco de dados automaticamente",
          "Marca a classe que responde requisições HTTP devolvendo JSON",
          "Gera a interface gráfica do sistema",
          "Roda os testes unitários",
        ],
        correct: 1,
        explain:
          "Ela transforma a classe num controlador REST: os métodos viram endpoints e o retorno é serializado pra JSON automaticamente.",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta o controller com endpoint GET que lista produtos:",
        pecas: [
          "@RestController",
          '@RequestMapping("/api/produtos")',
          "public class ProdutoController {",
          "  @GetMapping",
          "  public List<Produto> listar() {",
          "    return service.listarTodos();",
          "  }",
          "}",
        ],
        explain:
          "Annotations em cima da classe primeiro, depois a classe, o @GetMapping em cima do método, e o método delegando pro service. Cada camada no seu lugar.",
      },
      {
        tipo: "code",
        lang: "java",
        arquivo: "ProdutoController.java",
        enunciado: "Cria o endpoint POST — o de criar produto:",
        missao:
          "um método com @PostMapping que recebe um Produto via @RequestBody e devolve ele.",
        starter:
          '@RestController\n@RequestMapping("/api/produtos")\npublic class ProdutoController {\n\n  // endpoint POST que recebe um Produto\n  // no corpo da requisição e devolve ele\n\n}',
        regras: [
          {
            re: "@PostMapping",
            label: "@PostMapping",
            falta:
              "Falta a annotation @PostMapping em cima do método — é ela que faz o endpoint aceitar POST.",
          },
          {
            re: "@RequestBody",
            label: "@RequestBody",
            falta:
              "O Produto chega no CORPO da requisição: recebe com @RequestBody Produto p.",
          },
          {
            re: "public\\s+Produto\\s+\\w+\\s*\\(",
            label: "método público",
            falta:
              "Declara o método público devolvendo Produto: public Produto criar(@RequestBody Produto p) { ... }",
          },
          {
            re: "return",
            label: "return",
            falta:
              "Devolve o produto no final: return p; — o Spring serializa pra JSON sozinho.",
          },
        ],
        saida: "POST /api/produtos → 201 Created (JSON no corpo)",
        dicas: [
          "A annotation vai numa linha, o método na de baixo.",
          "Assinatura completa: public Produto criar(@RequestBody Produto p) { return p; }",
        ],
        gabarito:
          '@RestController\n@RequestMapping("/api/produtos")\npublic class ProdutoController {\n\n  @PostMapping\n  public Produto criar(@RequestBody Produto p) {\n    return p;\n  }\n}',
      },
      {
        tipo: "quiz",
        q: "Na arquitetura em camadas, quem conversa com o banco?",
        opts: [
          "O Controller",
          "O Repository",
          "O front-end",
          "A annotation @GetMapping",
        ],
        correct: 1,
        explain:
          "Controller recebe → Service aplica a regra de negócio → Repository acessa o banco. Cada camada com sua função.",
      },
      {
        tipo: "quiz",
        q: "A annotation @PathVariable serve pra:",
        opts: [
          "Pegar um valor da URL, tipo o id em /produtos/{id}",
          "Criar variável global no projeto",
          "Definir a porta do servidor",
          "Validar a senha do usuário",
        ],
        correct: 0,
        explain:
          'Ela liga o pedaço dinâmico da URL ao parâmetro do método: @GetMapping("/{id}") + @PathVariable Long id.',
      },
    ],
  },
  {
    id: "fullstack",
    nome: "Boss final: fullstack",
    ponto: "Faria Lima",
    tag: "PONTO FINAL",
    desc: "React + Spring conversando: fetch, JSON e CORS.",
    lessons: [
      {
        t: "O fluxo completo do app",
        txt: "React (fetch) → HTTP → Controller → Service → Repository → Banco. A resposta volta o caminho contrário, virando JSON no meio do caminho. Front e back são projetos separados que se falam por HTTP.",
        code: "// React (porta 5173)  ⇄  Spring (porta 8080)\n// GET /api/produtos  →  200 OK + JSON",
      },
      {
        t: "Consumindo a API no React",
        txt: "fetch (ou axios) dentro de um useEffect pra carregar na montagem. res.json() converte o corpo da resposta em objeto JS, e aí é só jogar no state.",
        code: "useEffect(() => {\n  fetch('http://localhost:8080/api/produtos')\n    .then(res => res.json())\n    .then(setProdutos)\n    .catch(err => setErro(err.message));\n}, []);",
      },
      {
        t: "CORS: o segurança na porta",
        txt: "O navegador bloqueia requisição de uma origem (localhost:5173) pra outra (localhost:8080) se o backend não autorizar. Resolve liberando a origem no Spring — @CrossOrigin no controller ou uma config global de CORS.",
        code: '@CrossOrigin(origins = "http://localhost:5173")\n@RestController\npublic class ProdutoController { ... }',
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "O React consome a API Java através de:",
        opts: [
          "Importando a classe Java direto no JS",
          "Requisições HTTP (fetch/axios) pros endpoints",
          "Copiando o banco pra dentro do front",
          "JDBC rodando no navegador",
        ],
        correct: 1,
        explain:
          "Front e back são mundos separados. A ponte é HTTP: o React chama os endpoints e recebe JSON de volta.",
      },
      {
        tipo: "code",
        lang: "jsx",
        arquivo: "App.jsx",
        enunciado: 'BOSS: consome a "API" e lista os produtos na tela.',
        contexto:
          "A função buscarProdutos() já existe e devolve uma Promise — igual um fetch de verdade, só que sem backend. Sua parte é o useEffect.",
        missao:
          "buscar os dados na montagem e jogar no state — os 3 produtos têm que aparecer na lista.",
        starter:
          "// buscarProdutos() já existe e devolve uma Promise\n// (igual um fetch, só que sem backend)\n\nfunction App() {\n  const [produtos, setProdutos] = useState([]);\n\n  // useEffect: chama buscarProdutos()\n  // e joga o resultado no state\n\n  return (\n    <ul>\n      {produtos.map(p => <li key={p.id}>{p.nome}</li>)}\n    </ul>\n  );\n}",
        preambulo:
          "function buscarProdutos() {\n  return new Promise(resolve => setTimeout(() => resolve([\n    { id: 1, nome: 'Fone bluetooth' },\n    { id: 2, nome: 'Teclado gamer' },\n    { id: 3, nome: 'Mouse sem fio' }\n  ]), 700));\n}",
        esperado: ["Fone bluetooth", "Teclado gamer", "Mouse sem fio"],
        dicasAuto: [
          {
            re: "useEffect",
            falta:
              "A busca vai dentro de um useEffect(() => { ... }, []) — efeito de montagem.",
          },
          {
            re: "buscarProdutos\\(\\)",
            falta: "Chama a função: buscarProdutos().then(...)",
          },
          {
            re: "setProdutos",
            falta:
              "Quando os dados chegarem, joga no state: .then(setProdutos).",
          },
          {
            re: "\\[\\]\\s*\\)",
            falta:
              "Não esquece o array de dependências vazio [] no final do useEffect — senão vira loop infinito de requisição!",
          },
        ],
        dicas: [
          "Estrutura: useEffect(() => { ... }, []);",
          "Dentro dele: buscarProdutos().then(setProdutos);",
          "O .then(setProdutos) é atalho pra .then(dados => setProdutos(dados)).",
        ],
        gabarito:
          "function App() {\n  const [produtos, setProdutos] = useState([]);\n\n  useEffect(() => {\n    buscarProdutos().then(setProdutos);\n  }, []);\n\n  return (\n    <ul>\n      {produtos.map(p => <li key={p.id}>{p.nome}</li>)}\n    </ul>\n  );\n}",
      },
      {
        tipo: "quiz",
        q: "Apareceu erro de CORS no console do navegador. O que rolou?",
        opts: [
          "O banco de dados caiu",
          "O navegador bloqueou porque o back não autorizou a origem do front",
          "Erro de sintaxe no JSX",
          "A internet caiu no meio da requisição",
        ],
        correct: 1,
        explain:
          "CORS é o navegador te protegendo. A correção é no BACKEND: liberar a origem com @CrossOrigin ou config global.",
      },
      {
        tipo: "encaixe",
        enunciado:
          "Encaixa o fluxo de uma requisição, do clique até o dado voltar:",
        pecas: [
          "React dispara o fetch pro endpoint",
          "Controller recebe a requisição HTTP",
          "Service aplica a regra de negócio",
          "Repository consulta o banco de dados",
          "A resposta volta pro front virando JSON",
        ],
        explain:
          "Front chama → Controller recebe → Service pensa → Repository busca → e a resposta refaz o caminho virando JSON. Esse é o esqueleto de TODO app fullstack.",
      },
      {
        tipo: "quiz",
        q: "Quem transforma o objeto Java em JSON na resposta da API?",
        opts: [
          "Você, montando a string na mão sempre",
          "O Spring (via Jackson) serializa automaticamente",
          "O navegador do usuário",
          "O MySQL",
        ],
        correct: 1,
        explain:
          "Com @RestController, o retorno do método passa pelo Jackson e vira JSON sozinho. Você devolve o objeto, o Spring cuida do resto.",
      },
    ],
  },
];

/* ---------- LINHA 6X-SUL · HTML + CSS + JS + mini TypeScript ---------- */

export const MODULES_WEB = [
  {
    id: "html-base",
    nome: "HTML: o esqueleto de tudo",
    ponto: "Terminal Parelheiros",
    tag: "PONTO 01",
    desc: "Tags, títulos, parágrafos, listas, links e imagens.",
    lessons: [
      {
        t: "O que é HTML, afinal?",
        txt: "HTML é a ESTRUTURA da página — o esqueleto. Ele diz O QUE existe na tela: um título, um parágrafo, uma lista, uma imagem. Tudo é feito de TAGS: quase toda tag abre <assim> e fecha </assim>, e o conteúdo vai no meio.",
        code: "<h1>Dev do Corre</h1>\n<p>Direto do extremo sul.</p>",
      },
      {
        t: "Títulos, parágrafos e listas",
        txt: "Títulos vão de <h1> (o mais importante, um por página) até <h6>. Parágrafo é <p>. Lista com bolinha é <ul> e lista numerada é <ol> — as duas com itens <li> dentro.",
        code: "<h2>Corres da semana</h2>\n<ul>\n  <li>Estudar HTML</li>\n  <li>Pagar o boleto</li>\n</ul>",
      },
      {
        t: "Links e imagens",
        txt: 'Link é <a href="url">texto</a>. Imagem é <img src="url" alt="descrição"> — o alt descreve a imagem pra quem usa leitor de tela e aparece se ela não carregar. A <img> é uma tag VAZIA: não tem fechamento.',
        code: '<a href="https://google.com">Pesquisar</a>\n<img src="busao.png" alt="Ônibus da linha 5X-Sul" />',
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Qual o papel do HTML numa página web?",
        opts: [
          "Dar o visual: cores, fontes e espaçamento",
          "Dar a ESTRUTURA: dizer o que existe na página",
          "Dar a lógica: reagir a cliques e calcular coisas",
          "Guardar os dados no servidor",
        ],
        correct: 1,
        explain:
          "HTML é o esqueleto (estrutura), CSS é a roupa (visual) e JavaScript é o movimento (lógica). Cada um no seu corre.",
      },
      {
        tipo: "encaixe",
        enunciado:
          "Monta a estrutura básica: um main com título e parágrafo dentro:",
        pecas: [
          "<main>",
          "  <h1>Dev do Corre</h1>",
          "  <p>Do extremo sul pro mundo.</p>",
          "</main>",
        ],
        explain:
          "Abre o <main>, conteúdo indentado dentro (título primeiro, depois o parágrafo), e fecha o </main>. Tag que abre, fecha.",
      },
      {
        tipo: "code",
        lang: "html",
        arquivo: "index.html",
        enunciado: "Tua primeira página, rodando DE VERDADE:",
        missao:
          "fazer aparecer um título h1 escrito Salve, quebrada! e um parágrafo p com um texto teu embaixo.",
        starter:
          "<!-- escreve teu HTML aqui embaixo -->\n<!-- 1) um titulo h1 com: Salve, quebrada! -->\n<!-- 2) um paragrafo p com um texto teu -->\n\n",
        esperado: ["Salve, quebrada!"],
        regras: [
          {
            re: "<h1[\\s>]",
            label: "<h1>",
            falta: "Falta o título: <h1>Salve, quebrada!</h1>",
          },
          {
            re: "<p[\\s>]",
            label: "<p>",
            falta: "Falta o parágrafo: <p>algum texto teu</p>",
          },
        ],
        dicas: [
          "Tag abre e fecha: <h1>texto</h1>.",
          "O <p> vai logo embaixo do <h1>, cada um na sua linha.",
        ],
        gabarito:
          "<h1>Salve, quebrada!</h1>\n<p>Primeira página no ar, direto do extremo sul.</p>",
      },
      {
        tipo: "quiz",
        q: "Pra que serve o atributo alt da <img>?",
        opts: [
          "Deixa a imagem maior quando passa o mouse",
          "Descreve a imagem pra leitores de tela e aparece se ela não carregar",
          "É o link pra onde a imagem leva",
          "Define a pasta onde a imagem fica salva",
        ],
        correct: 1,
        explain:
          "O alt é acessibilidade pura: quem não enxerga a imagem (pessoa ou robô do Google) lê a descrição. E se o src quebrar, é ele que aparece.",
      },
      {
        tipo: "code",
        lang: "html",
        arquivo: "index.html",
        enunciado: "Lista de corres da semana:",
        missao:
          "uma lista ul com 3 itens li: Estudar HTML, Treinar CSS e Dominar o JS.",
        starter:
          "<h2>Corres da semana</h2>\n<!-- monta a lista com 3 itens aqui -->\n\n",
        esperado: ["Estudar HTML", "Treinar CSS", "Dominar o JS"],
        regras: [
          {
            re: "<ul[\\s>]",
            label: "<ul>",
            falta: "A lista começa com <ul> e fecha com </ul>.",
          },
          {
            re: "<li[\\s>]",
            label: "<li>",
            falta: "Cada item da lista é um <li>texto</li>, dentro da <ul>.",
          },
        ],
        dicas: [
          "Estrutura: <ul> por fora, e dentro um <li> pra cada item.",
          "São 3 <li>: um pra cada corre da missão.",
        ],
        gabarito:
          "<h2>Corres da semana</h2>\n<ul>\n  <li>Estudar HTML</li>\n  <li>Treinar CSS</li>\n  <li>Dominar o JS</li>\n</ul>",
      },
    ],
  },
  {
    id: "html-forms",
    nome: "HTML: semântica e formulários",
    ponto: "Jardim Ângela",
    tag: "PONTO 02",
    desc: "Tags semânticas, formulários, inputs e acessibilidade.",
    lessons: [
      {
        t: "Semântica: div pra tudo é cilada",
        txt: "Existem tags que DIZEM o que são: <header> (topo), <nav> (menu), <main> (conteúdo principal), <section> (seção) e <footer> (rodapé). O visual é igual ao da div — mas leitor de tela, Google e outros devs entendem tua página na hora.",
        code: "<header>logo e menu</header>\n<main>\n  <section>conteúdo</section>\n</main>\n<footer>contato</footer>",
      },
      {
        t: "Formulários: a porta de entrada",
        txt: "Formulário é onde o usuário digita coisa: <form> embrulha tudo, <input> é o campo (o type muda o teclado e a validação: text, email, password, number...) e <label> dá nome ao campo.",
        code: '<form>\n  <label for="nome">Seu nome</label>\n  <input id="nome" type="text" />\n</form>',
      },
      {
        t: "label + id: a dupla da acessibilidade",
        txt: "O for do <label> aponta pro id do <input>. Com isso, clicar no texto já foca o campo — e o leitor de tela anuncia o nome certo. Atributos úteis: placeholder (dica dentro do campo) e required (obriga preencher).",
        code: '<label for="email">Seu e-mail</label>\n<input\n  id="email"\n  type="email"\n  placeholder="voce@exemplo.com"\n  required\n/>',
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Por que usar <main>, <header> e <nav> em vez de <div> pra tudo?",
        opts: [
          "Porque carregam mais rápido que a div",
          "Porque leitor de tela e buscadores entendem a estrutura da página",
          "Porque a div vai ser descontinuada",
          "Porque só elas aceitam CSS",
        ],
        correct: 1,
        explain:
          "É semântica: a tag DIZ o que ela é. Acessibilidade e SEO agradecem — e o visual você controla com CSS do mesmo jeito.",
      },
      {
        tipo: "encaixe",
        enunciado:
          "Monta o formulário acessível: label, input e botão, nessa ordem:",
        pecas: [
          "<form>",
          '  <label for="nome">Seu nome</label>',
          '  <input id="nome" type="text" />',
          '  <button type="button">Enviar</button>',
          "</form>",
        ],
        explain:
          'O <form> embrulha tudo. O for="nome" do label aponta pro id="nome" do input — é esse par que liga os dois.',
      },
      {
        tipo: "code",
        lang: "html",
        arquivo: "cadastro.html",
        enunciado: "Formulário da newsletter do corre:",
        missao:
          "um form com label escrito Seu e-mail, um input do tipo email e um botão escrito Cadastrar.",
        starter:
          "<h2>Newsletter do corre</h2>\n<!-- form: label + campo de e-mail + botao Cadastrar -->\n\n",
        esperado: ["Seu e-mail", "Cadastrar"],
        regras: [
          {
            re: "<form[\\s>]",
            label: "<form>",
            falta: "Embrulha tudo num <form> ... </form>.",
          },
          {
            re: "<label[\\s>]",
            label: "<label>",
            falta:
              "Falta o <label>Seu e-mail</label> — é ele que dá nome ao campo.",
          },
          {
            re: "type=\"email\"|type='email'",
            label: "type email",
            falta:
              'O campo é <input type="email"> — o navegador já valida o formato sozinho.',
          },
          {
            re: "<button[\\s>]",
            label: "<button>",
            falta: "Falta o <button>Cadastrar</button>.",
          },
        ],
        dicas: [
          "Ordem dentro do form: label, input, button.",
          'Capricho extra: liga o label no input com for="email" e id="email".',
        ],
        gabarito:
          '<h2>Newsletter do corre</h2>\n<form>\n  <label for="email">Seu e-mail</label>\n  <input id="email" type="email" placeholder="voce@exemplo.com" />\n  <button type="button">Cadastrar</button>\n</form>',
      },
      {
        tipo: "quiz",
        q: "Qual type de input esconde o que a pessoa digita?",
        opts: [
          'type="hidden"',
          'type="password"',
          'type="secret"',
          'type="text"',
        ],
        correct: 1,
        explain:
          'type="password" mostra bolinha no lugar das letras. O hidden é outra coisa: um campo invisível que vai junto no envio do form.',
      },
      {
        tipo: "quiz",
        q: "O que acontece quando o for do label aponta pro id do input?",
        opts: [
          "Nada, é só organização",
          "Clicar no label foca o campo, e o leitor de tela anuncia o nome certo",
          "O campo vira obrigatório",
          "O label fica em negrito automaticamente",
        ],
        correct: 1,
        explain:
          "Essa ligação é acessibilidade de verdade: área de clique maior e nome anunciado pro leitor de tela. Custa nada e muda tudo.",
      },
    ],
  },
  {
    id: "css-base",
    nome: "CSS: dando o visual",
    ponto: "Capão Redondo",
    tag: "PONTO 03",
    desc: "Seletores, cores, box model e as primeiras regras.",
    lessons: [
      {
        t: "A anatomia de uma regra CSS",
        txt: "CSS é o VISUAL. Uma regra tem: seletor (quem vai mudar), e dentro das chaves os pares propriedade: valor; — cada um fechando com ponto e vírgula. Seletores básicos: a tag (h1), a classe (.destaque) e o id (#topo).",
        code: "h1 {\n  color: #FF4D00;\n  font-size: 32px;\n}\n\n.destaque { background: yellow; }",
      },
      {
        t: "Box model: tudo é caixa",
        txt: 'TODO elemento é uma caixa com 4 camadas, de dentro pra fora: conteúdo → padding (respiro interno) → border (a moldura) → margin (distância pros vizinhos). Dominar isso resolve 80% dos "por que esse espaço tá aí?".',
        code: ".card {\n  padding: 16px;   /* respiro interno */\n  border: 2px solid black;\n  margin: 12px;    /* distancia pros vizinhos */\n}",
      },
      {
        t: "Cores e unidades",
        txt: "Cor pode ser nome (orange), hexadecimal (#FF4D00) ou rgb(255, 77, 0). Tamanho: px é fixo, % é relativo ao pai, e rem é relativo à fonte base da página (ótimo pra acessibilidade — acompanha o zoom do usuário).",
        code: "p {\n  color: #0D0D0D;\n  font-size: 1rem;  /* = 16px por padrao */\n  width: 80%;\n}",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: 'Qual seletor pega TODOS os elementos com class="destaque"?',
        opts: ["#destaque", "destaque", ".destaque", "<destaque>"],
        correct: 2,
        explain:
          "Ponto (.) é classe, cerquilha (#) é id. Classe pode repetir em vários elementos; id é único na página.",
      },
      {
        tipo: "code",
        lang: "html",
        arquivo: "index.html",
        enunciado: "Teu primeiro CSS — estiliza o título:",
        missao:
          "deixar o h1 laranja (#FF4D00) e centralizado, mexendo só dentro do bloco style.",
        starter:
          "<style>\n  h1 {\n    /* 1) pinta de #FF4D00 (propriedade de cor do texto) */\n    /* 2) centraliza o texto (propriedade de alinhamento) */\n  }\n</style>\n\n<h1>Corre estiloso</h1>",
        esperado: ["Corre estiloso"],
        regras: [
          {
            re: "color\\s*:\\s*#?\\w",
            label: "color",
            falta:
              "Dentro do h1 { }: color: #FF4D00; — sempre propriedade: valor;",
          },
          {
            re: "text-align\\s*:\\s*center",
            label: "centralizado",
            falta: "Pra centralizar texto: text-align: center;",
          },
        ],
        dicas: [
          "Cada linha de CSS: propriedade: valor; (com ; no final).",
          "As duas propriedades: color: #FF4D00; e text-align: center;",
        ],
        gabarito:
          "<style>\n  h1 {\n    color: #FF4D00;\n    text-align: center;\n  }\n</style>\n\n<h1>Corre estiloso</h1>",
      },
      {
        tipo: "quiz",
        q: "No box model, o padding é:",
        opts: [
          "A distância entre o elemento e os vizinhos",
          "O respiro INTERNO, entre o conteúdo e a borda",
          "A grossura da borda",
          "A sombra do elemento",
        ],
        correct: 1,
        explain:
          "De dentro pra fora: conteúdo → padding → border → margin. Padding é dentro da caixa; margin é fora, empurrando os vizinhos.",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a regra CSS do card — seletor de classe e box model:",
        pecas: [
          ".card {",
          "  background: white;",
          "  padding: 16px;",
          "  border: 2px solid black;",
          "}",
        ],
        explain:
          "Seletor .card (classe), abre chave, cada propriedade: valor; numa linha, e fecha a chave. Essa é a anatomia de TODA regra CSS.",
      },
      {
        tipo: "code",
        lang: "html",
        arquivo: "index.html",
        enunciado: "Botão estiloso — o combo clássico:",
        missao:
          "estilizar o botão com fundo (background), cantos arredondados (border-radius) e um respiro interno (padding).",
        starter:
          "<style>\n  button {\n    /* fundo, cantos arredondados e respiro interno */\n    border: none;\n    font-size: 16px;\n    cursor: pointer;\n  }\n</style>\n\n<button>Cola no corre</button>",
        esperado: ["Cola no corre"],
        regras: [
          {
            re: "background(-color)?\\s*:",
            label: "background",
            falta: "Dá um fundo: background: #FF4D00; (ou a cor que quiser).",
          },
          {
            re: "border-radius\\s*:",
            label: "border-radius",
            falta: "Cantos arredondados: border-radius: 8px;",
          },
          {
            re: "padding\\s*:",
            label: "padding",
            falta:
              "Respiro interno: padding: 12px 20px; (vertical e horizontal).",
          },
        ],
        dicas: [
          "Tudo dentro do button { } que já existe no style.",
          "Exemplo completo: background: #FF4D00; border-radius: 8px; padding: 12px 20px;",
        ],
        gabarito:
          "<style>\n  button {\n    background: #FF4D00;\n    border-radius: 8px;\n    padding: 12px 20px;\n    border: none;\n    font-size: 16px;\n    cursor: pointer;\n  }\n</style>\n\n<button>Cola no corre</button>",
      },
    ],
  },
  {
    id: "css-layout",
    nome: "CSS: flexbox e responsivo",
    ponto: "Campo Limpo",
    tag: "PONTO 04",
    desc: "Flexbox, grid e a página que funciona em qualquer tela.",
    lessons: [
      {
        t: "Flexbox: alinhar sem sofrimento",
        txt: "display: flex no PAI enfileira os filhos. justify-content distribui no eixo principal (horizontal, por padrão), align-items alinha no eixo cruzado, e gap dá o espacinho entre eles. O combo justify + align centraliza qualquer coisa.",
        code: ".pai {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 12px;\n}",
      },
      {
        t: "Grid: layout em duas dimensões",
        txt: "Flexbox é uma fileira (uma dimensão). Grid é tabela (duas): você define as colunas com grid-template-columns e os filhos se encaixam. 1fr = uma fração do espaço livre.",
        code: ".galeria {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  gap: 12px;\n}",
      },
      {
        t: "Responsivo: mobile first",
        txt: "Media query aplica CSS só quando a tela cumpre a condição. Mobile first é escrever o CSS base pro celular e ir MELHORANDO pra telas maiores com min-width — a maioria dos teus usuários está no busão, no celular.",
        code: "/* base: celular */\n.galeria { grid-template-columns: 1fr; }\n\n@media (min-width: 700px) {\n  .galeria { grid-template-columns: 1fr 1fr 1fr; }\n}",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Com display: flex no pai, qual combo centraliza os filhos na horizontal E na vertical?",
        opts: [
          "text-align: center + vertical-align: middle",
          "justify-content: center + align-items: center",
          "margin: auto + padding: auto",
          "center: both",
        ],
        correct: 1,
        explain:
          'justify-content cuida do eixo principal, align-items do eixo cruzado. Esse combo é o "centraliza tudo" mais usado do CSS moderno.',
      },
      {
        tipo: "code",
        lang: "html",
        arquivo: "index.html",
        enunciado: "Navbar com flexbox — os links lado a lado:",
        missao:
          "transformar a nav em flex e espalhar os links (justify-content ou gap).",
        starter:
          '<style>\n  nav {\n    /* vira flex e espalha os links */\n    background: #FFF3B0;\n    padding: 12px;\n  }\n  a { text-decoration: none; color: #0D0D0D; font-weight: bold; }\n</style>\n\n<nav>\n  <a href="#">Início</a>\n  <a href="#">Sobre</a>\n  <a href="#">Contato</a>\n</nav>',
        esperado: ["Início", "Sobre", "Contato"],
        regras: [
          {
            re: "display\\s*:\\s*flex",
            label: "display: flex",
            falta:
              "No seletor nav: display: flex; — é isso que enfileira os links.",
          },
          {
            re: "justify-content\\s*:|gap\\s*:",
            label: "espaçamento",
            falta:
              "Espalha com justify-content: space-between; (ou dá um gap: 24px;).",
          },
        ],
        dicas: [
          "As propriedades vão dentro do nav { }.",
          "display: flex; justify-content: space-between; resolve.",
        ],
        gabarito:
          '<style>\n  nav {\n    display: flex;\n    justify-content: space-between;\n    background: #FFF3B0;\n    padding: 12px;\n  }\n  a { text-decoration: none; color: #0D0D0D; font-weight: bold; }\n</style>\n\n<nav>\n  <a href="#">Início</a>\n  <a href="#">Sobre</a>\n  <a href="#">Contato</a>\n</nav>',
      },
      {
        tipo: "quiz",
        q: "O que uma @media (min-width: 700px) { ... } faz?",
        opts: [
          "Limita a página a 700px de largura",
          "Aplica aquele CSS só quando a tela tem 700px ou mais",
          "Redimensiona as imagens pra 700px",
          "Esconde a página em telas pequenas",
        ],
        correct: 1,
        explain:
          'Media query é um "se": SE a tela for maior ou igual a 700px, aplica essas regras. É a base do layout responsivo.',
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a galeria em grid com 3 colunas iguais:",
        pecas: [
          ".galeria {",
          "  display: grid;",
          "  grid-template-columns: 1fr 1fr 1fr;",
          "  gap: 12px;",
          "}",
        ],
        explain:
          "Primeiro vira grid, depois define as colunas (três frações iguais) e o gap dá o respiro entre os cards.",
      },
      {
        tipo: "quiz",
        q: '"Mobile first" significa:',
        opts: [
          "Fazer um app nativo antes do site",
          "Escrever o CSS base pro celular e melhorar pra telas maiores com min-width",
          "Esconder conteúdo no celular",
          "Testar só no iPhone",
        ],
        correct: 1,
        explain:
          "O CSS base atende a tela menor (a maioria dos acessos), e as media queries com min-width vão ADICIONANDO melhorias pra desktop.",
      },
    ],
  },
  {
    id: "js-base",
    nome: "JS: a lógica do corre",
    ponto: "Santo Amaro",
    tag: "PONTO 05",
    desc: "Variáveis, tipos, funções, condicionais e console.",
    lessons: [
      {
        t: "Variáveis: const e let",
        txt: "JavaScript é o MOVIMENTO da página. Variável guarda valor: const pra quem não vai ser reatribuído (uso padrão) e let pra quem muda. O var é dos tempos antigos — evita. Tipos básicos: string, number e boolean.",
        code: "const nome = 'Edu';    // texto (string)\nlet saldo = 150;       // numero\nconst noCorre = true;  // booleano",
      },
      {
        t: "Funções e condicionais",
        txt: "Função é um bloco reutilizável: recebe parâmetros, faz o trabalho e devolve com return. O if/else decide o caminho — e compara sempre com === (igualdade estrita, sem gambiarra de conversão).",
        code: "function podePagar(saldo, preco) {\n  if (saldo >= preco) {\n    return 'Pode pagar';\n  }\n  return 'Vai ficar devendo';\n}",
      },
      {
        t: "console.log e template strings",
        txt: "console.log imprime no console — teu melhor amigo pra depurar. Template string usa CRASE (`) e interpola valores com ${ }: bem mais limpo que somar strings com +.",
        code: "const nome = 'Edu';\nconst idade = 25;\nconsole.log(`${nome} tem ${idade} anos`);",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Diferença entre const e let:",
        opts: [
          "const é mais rápida",
          "const não pode ser REATRIBUÍDA; let pode",
          "let só funciona dentro de função",
          "São idênticas, só muda o nome",
        ],
        correct: 1,
        explain:
          'const nome = "Edu" e depois nome = "Bia"? Erro. Com let, pode. Regra prática: começa tudo com const e só troca pra let quando precisar reatribuir.',
      },
      {
        tipo: "code",
        lang: "js",
        arquivo: "script.js",
        enunciado: "Teu primeiro JavaScript — variáveis e console:",
        missao:
          'criar const nome = "Edu" e const idade = 25, e imprimir no console: Edu tem 25 anos — usando template string (crase + interpolação).',
        starter:
          '// 1) cria a const nome com o valor "Edu"\n// 2) cria a const idade com o valor 25\n// 3) imprime a frase no console usando crase e interpolacao\n\n',
        esperado: ["Edu tem 25 anos"],
        regras: [
          {
            re: "(const|let)\\s+nome",
            label: "nome",
            falta: "Cria a variável: const nome = 'Edu';",
          },
          {
            re: "(const|let)\\s+idade",
            label: "idade",
            falta: "Cria a variável: const idade = 25; (número vai sem aspas).",
          },
          {
            re: "\\$\\{",
            label: "template string",
            falta:
              "Template string: `${nome} tem ${idade} anos` — repara que é CRASE (`), não aspas.",
          },
        ],
        dicas: [
          "Cada linha termina com ; — const nome = 'Edu';",
          "A impressão: console.log(`${nome} tem ${idade} anos`);",
        ],
        gabarito:
          "const nome = 'Edu';\nconst idade = 25;\nconsole.log(`${nome} tem ${idade} anos`);",
      },
      {
        tipo: "quiz",
        q: "Qual a diferença entre == e === ?",
        opts: [
          "Nenhuma, é estilo",
          "=== compara valor E tipo, sem converter nada; == converte antes de comparar",
          "=== é só pra números",
          "== é mais moderno",
        ],
        correct: 1,
        explain:
          '"5" == 5 dá true (converte!), "5" === 5 dá false. O === é previsível — usa ele por padrão e evita sustos.',
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a função que decide se pode dirigir:",
        pecas: [
          "function podeDirigir(idade) {",
          "  if (idade >= 18) {",
          "    return 'Pode dirigir';",
          "  }",
          "  return 'Ainda não';",
          "}",
        ],
        explain:
          "Função → if com a condição → return do caso verdadeiro → fecha o if → return do caso contrário. Se o if deu return, o resto nem roda.",
      },
      {
        tipo: "code",
        lang: "js",
        arquivo: "script.js",
        enunciado: "Tua primeira função de verdade:",
        missao:
          "criar a função dobro(n) que devolve n * 2, e imprimir no console o dobro de 21 — tem que sair 42.",
        starter:
          "// 1) cria a funcao dobro, que recebe n e devolve n * 2\n// 2) imprime no console o resultado pra 21\n\n",
        esperado: ["42"],
        regras: [
          {
            re: "function\\s+dobro|const\\s+dobro",
            label: "função dobro",
            falta: "Declara: function dobro(n) { ... }",
          },
          {
            re: "return",
            label: "return",
            falta: "A função precisa DEVOLVER o resultado: return n * 2;",
          },
          {
            re: "dobro\\(21\\)",
            label: "dobro(21)",
            falta: "Chama a função com 21: console.log(dobro(21));",
          },
        ],
        dicas: [
          "A função: function dobro(n) { return n * 2; }",
          "E embaixo: console.log(dobro(21));",
        ],
        gabarito:
          "function dobro(n) {\n  return n * 2;\n}\n\nconsole.log(dobro(21));",
      },
    ],
  },
  {
    id: "js-dom",
    nome: "JS: DOM e eventos",
    ponto: "Brooklin",
    tag: "PONTO 06",
    desc: "querySelector, addEventListener e a página ganhando vida.",
    lessons: [
      {
        t: "O DOM: tua página vista pelo JS",
        txt: "O navegador transforma o HTML numa árvore de objetos: o DOM. O JS enxerga e mexe nessa árvore pelo document. Pra pegar um elemento: document.querySelector() — aceita qualquer seletor CSS (#id, .classe, tag).",
        code: "const titulo = document.querySelector('#titulo');\nconst botao = document.querySelector('.btn');",
      },
      {
        t: "Eventos: reagindo ao usuário",
        txt: "addEventListener escuta o que acontece: click, input, submit, keydown... Você passa o nome do evento e a função que roda quando ele dispara.",
        code: "botao.addEventListener('click', () => {\n  console.log('clicou!');\n});",
      },
      {
        t: "Mudando a página",
        txt: "textContent troca o TEXTO de um elemento (seguro). innerHTML interpreta HTML — cuidado com texto vindo do usuário. classList liga/desliga classes CSS: add, remove e toggle.",
        code: "titulo.textContent = 'Novo título';\ncard.classList.toggle('escuro');",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "document.querySelector('#placar') pega o quê?",
        opts: [
          "Todos os elementos da classe placar",
          'O elemento com id="placar"',
          "A tag <placar>",
          "O primeiro parágrafo da página",
        ],
        correct: 1,
        explain:
          "O querySelector usa a MESMA sintaxe dos seletores CSS: # é id, . é classe, sem nada é tag.",
      },
      {
        tipo: "code",
        lang: "js",
        arquivo: "script.js",
        enunciado: "O clássico: botão contador, agora em JS puro.",
        contexto:
          "O HTML já está na página (olha o preview). Teu trabalho é só o JavaScript.",
        missao:
          "a cada clique no botão, o placar sobe: Cliques: 0 → Cliques: 1 → Cliques: 2...",
        testa: "👆 clica no botão do preview!",
        htmlBase:
          '<p id="placar">Cliques: 0</p><button id="botao">Clica aí</button>',
        starter:
          "// 1) pega o placar e o botao (id placar / id botao)\n// 2) cria let cliques = 0\n// 3) escuta o clique do botao: soma 1 e atualiza o texto do placar\n\n",
        esperado: ["Cliques: 0", "Cliques: 1"],
        regras: [
          {
            re: "querySelector|getElementById",
            label: "pegar elemento",
            falta:
              "Pega os elementos com document.querySelector('#placar') e ('#botao').",
          },
          {
            re: "addEventListener",
            label: "escutar clique",
            falta:
              "Escuta o clique: botao.addEventListener('click', () => { ... });",
          },
          {
            re: "textContent|innerText|innerHTML",
            label: "atualizar texto",
            falta:
              "Atualiza o placar: placar.textContent = `Cliques: ${cliques}`;",
          },
        ],
        dicas: [
          "Os elementos: const placar = document.querySelector('#placar'); const botao = document.querySelector('#botao');",
          "O contador: let cliques = 0; (let, porque vai mudar!)",
          "No listener: cliques++; placar.textContent = `Cliques: ${cliques}`;",
        ],
        gabarito:
          "const placar = document.querySelector('#placar');\nconst botao = document.querySelector('#botao');\nlet cliques = 0;\n\nbotao.addEventListener('click', () => {\n  cliques++;\n  placar.textContent = `Cliques: ${cliques}`;\n});",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta o botão de modo escuro — evento + classList:",
        pecas: [
          "const botao = document.querySelector('#tema');",
          "botao.addEventListener('click', () => {",
          "  document.body.classList.toggle('escuro');",
          "});",
        ],
        explain:
          "Primeiro pega o botão, depois escuta o clique, e dentro do listener o toggle liga/desliga a classe no body. Três linhas, modo escuro pronto.",
      },
      {
        tipo: "quiz",
        q: "Diferença entre textContent e innerHTML:",
        opts: [
          "São idênticos",
          "textContent trata tudo como TEXTO puro; innerHTML interpreta as tags — perigoso com dado do usuário",
          "innerHTML é mais rápido, sempre prefira",
          "textContent só funciona em parágrafos",
        ],
        correct: 1,
        explain:
          "Se o usuário digitar <script> e você jogar no innerHTML, o navegador executa (isso é XSS). Texto vindo de gente de fora → textContent sempre.",
      },
      {
        tipo: "code",
        lang: "js",
        arquivo: "script.js",
        enunciado: "Clicou, mudou — trocando o texto da página:",
        contexto: "O HTML já está no preview. Só o JS na sua mão.",
        missao: "ao clicar no botão, o h1 muda pra: Mudou, na moral!",
        testa: "👆 clica no botão do preview!",
        htmlBase:
          '<h1 id="titulo">Sem clique ainda</h1><button id="muda">Muda o título</button>',
        starter:
          "// 1) pega o titulo (id titulo) e o botao (id muda)\n// 2) no clique, troca o texto do titulo pra: Mudou, na moral!\n\n",
        esperado: ["Sem clique ainda", "Mudou, na moral!"],
        regras: [
          {
            re: "addEventListener",
            label: "escutar clique",
            falta:
              "Escuta o clique do botão com addEventListener('click', ...).",
          },
          {
            re: "textContent|innerText|innerHTML",
            label: "trocar texto",
            falta: "Troca o texto: titulo.textContent = 'Mudou, na moral!';",
          },
        ],
        dicas: [
          "const titulo = document.querySelector('#titulo'); const botao = document.querySelector('#muda');",
          "Dentro do listener: titulo.textContent = 'Mudou, na moral!';",
        ],
        gabarito:
          "const titulo = document.querySelector('#titulo');\nconst botao = document.querySelector('#muda');\n\nbotao.addEventListener('click', () => {\n  titulo.textContent = 'Mudou, na moral!';\n});",
      },
    ],
  },
  {
    id: "js-avancado",
    nome: "JS: modo avançado",
    ponto: "Berrini",
    tag: "PONTO 07",
    desc: "map, filter, desestruturação, spread e async/await.",
    lessons: [
      {
        t: "Arrays turbinados: map, filter, reduce",
        txt: "map TRANSFORMA cada item e devolve um array novo. filter PENEIRA: só passa quem cumpre a condição. reduce REDUZ tudo a um valor só (soma, total...). Nenhum deles altera o array original.",
        code: "const precos = [10, 25, 8];\nprecos.map(p => p * 2);      // [20, 50, 16]\nprecos.filter(p => p > 9);   // [10, 25]\nprecos.reduce((t, p) => t + p, 0); // 43",
      },
      {
        t: "Desestruturação e spread",
        txt: "Desestruturar é tirar valores de dentro de objeto/array direto pra variáveis. O spread (...) espalha: serve pra copiar e juntar sem mexer no original — você já viu ele no setState do React.",
        code: "const { nome, idade } = pessoa;\nconst [primeiro] = lista;\n\nconst copia = { ...pessoa, cidade: 'SP' };",
      },
      {
        t: "Async: Promise e async/await",
        txt: "Buscar coisa na rede demora — a Promise representa esse valor futuro. Com async/await o código assíncrono fica LENDO como código normal: o await pausa ali até a resposta chegar.",
        code: "async function carrega() {\n  const res = await fetch('/api/perfil');\n  const dados = await res.json();\n  console.log(dados.nome);\n}",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "Diferença entre map e filter:",
        opts: [
          "map TRANSFORMA cada item; filter PENEIRA quem passa na condição",
          "map remove itens; filter duplica",
          "São iguais, filter é mais novo",
          "filter só funciona com números",
        ],
        correct: 0,
        explain:
          "map devolve um array do MESMO tamanho com cada item transformado. filter devolve só os aprovados no teste. Os dois criam array novo.",
      },
      {
        tipo: "code",
        lang: "js",
        arquivo: "script.js",
        enunciado: "Filtra os corres que pagam bem:",
        missao:
          "do array de trampos, imprimir no console o NOME dos que pagam mais de 100 (na ordem do array).",
        starter:
          "const trampos = [\n  { nome: 'Site da lanchonete', valor: 350 },\n  { nome: 'Ajuste no blog', valor: 80 },\n  { nome: 'Loja virtual', valor: 900 },\n];\n\n// filtra valor > 100 e imprime o nome de cada um\n\n",
        esperado: ["Site da lanchonete", "Loja virtual"],
        regras: [
          {
            re: "\\.filter\\(",
            label: ".filter()",
            falta: "Peneira primeiro: trampos.filter(t => t.valor > 100)",
          },
          {
            re: "\\.forEach\\(|\\.map\\(",
            label: "percorrer",
            falta:
              "Depois percorre imprimindo: .forEach(t => console.log(t.nome));",
          },
        ],
        dicas: [
          "Dá pra encadear: trampos.filter(...).forEach(...)",
          "Completo: trampos.filter(t => t.valor > 100).forEach(t => console.log(t.nome));",
        ],
        gabarito:
          "const trampos = [\n  { nome: 'Site da lanchonete', valor: 350 },\n  { nome: 'Ajuste no blog', valor: 80 },\n  { nome: 'Loja virtual', valor: 900 },\n];\n\ntrampos\n  .filter(t => t.valor > 100)\n  .forEach(t => console.log(t.nome));",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a função async que busca o perfil na API:",
        pecas: [
          "async function carregaPerfil() {",
          "  const resposta = await fetch('/api/perfil');",
          "  const dados = await resposta.json();",
          "  console.log(dados.nome);",
          "}",
        ],
        explain:
          "async na função libera o await dentro. Primeiro espera a resposta chegar, depois espera o JSON ser lido, e aí usa o dado. Cada await é uma pausa.",
      },
      {
        tipo: "quiz",
        q: "Uma Promise é:",
        opts: [
          "Um tipo de loop",
          "Um valor FUTURO: algo que ainda não chegou, mas vai chegar (ou falhar)",
          "Uma variável global",
          "Um erro do JavaScript",
        ],
        correct: 1,
        explain:
          "Ela representa uma operação em andamento (tipo um fetch). Quando resolve, o .then (ou o await) recebe o valor; quando falha, cai no catch.",
      },
      {
        tipo: "code",
        lang: "js",
        arquivo: "script.js",
        enunciado: "Desestruturação — abrindo o objeto:",
        contexto:
          'O objeto pessoa já existe (veio "da API"). Não precisa criar ele.',
        missao:
          "desestruturar nome e idade de dentro de pessoa e imprimir: Edu tem 25 anos",
        preambulo:
          "const pessoa = { nome: 'Edu', idade: 25, quebrada: 'extremo sul' };",
        starter:
          "// 1) tira nome e idade de dentro de pessoa (desestruturacao)\n// 2) imprime a frase no console com template string\n\n",
        esperado: ["Edu tem 25 anos"],
        regras: [
          {
            re: "(const|let)\\s*\\{",
            label: "desestruturação",
            falta: "Desestrutura assim: const { nome, idade } = pessoa;",
          },
          {
            re: "\\$\\{",
            label: "template string",
            falta: "Monta a frase com crase: `${nome} tem ${idade} anos`",
          },
        ],
        dicas: [
          "const { nome, idade } = pessoa; — as chaves puxam as propriedades pelo nome.",
          "console.log(`${nome} tem ${idade} anos`);",
        ],
        gabarito:
          "const { nome, idade } = pessoa;\nconsole.log(`${nome} tem ${idade} anos`);",
      },
    ],
  },
  {
    id: "ts-mini",
    nome: "TypeScript: o mini corre",
    ponto: "Faria Lima",
    tag: "PONTO FINAL",
    desc: "Tipos, interfaces e funções tipadas — a base do TS.",
    lessons: [
      {
        t: "Por que TypeScript?",
        txt: "TypeScript é o JavaScript + TIPOS: tudo que você sabe de JS vale. O TS confere os tipos ANTES de rodar e pega erro bobo na hora de escrever (não na produção). No final ele compila pra JS puro — é JS que vai pro navegador.",
        code: "let saldo: number = 150;\nsaldo = 'muito';\n// Erro: Type 'string' is not\n// assignable to type 'number'",
      },
      {
        t: "Tipos básicos: a anotação",
        txt: "A anotação vai depois do nome, com dois pontos: string, number, boolean, e arrays com tipo[]. Na maioria das vezes o TS INFERE sozinho pelo valor — mas saber anotar é a base.",
        code: "const nome: string = 'Edu';\nconst idade: number = 25;\nconst ativo: boolean = true;\nconst notas: number[] = [8, 9, 10];",
      },
      {
        t: "Interface e função tipada",
        txt: "interface descreve a CARA de um objeto: quais propriedades e de que tipo. Em função, você tipa os parâmetros e o retorno — quem chamar errado é avisado na hora. O ? marca propriedade opcional.",
        code: "interface Produto {\n  nome: string;\n  preco: number;\n  desconto?: number; // opcional\n}\n\nfunction total(p: Produto): number {\n  return p.preco - (p.desconto || 0);\n}",
      },
    ],
    desafios: [
      {
        tipo: "quiz",
        q: "O que é TypeScript?",
        opts: [
          "Uma linguagem que substitui o JavaScript no navegador",
          "Um superset do JS: adiciona tipos e compila pra JavaScript puro",
          "Um framework tipo React",
          "Um banco de dados tipado",
        ],
        correct: 1,
        explain:
          "Todo JS válido é TS válido. O TS adiciona a camada de tipos, confere tudo em tempo de escrita, e no build vira JS normal.",
      },
      {
        tipo: "code",
        lang: "ts",
        arquivo: "main.ts",
        enunciado: "Primeiras variáveis TIPADAS:",
        contexto:
          "TypeScript rodando de verdade: os tipos são conferidos e depois removidos na compilação — o que executa no navegador é JS puro.",
        missao:
          "declarar nome (com anotação : string) e idade (com anotação : number), e imprimir: Edu tem 25 anos",
        starter:
          '// 1) const nome com anotacao de tipo texto, valendo "Edu"\n// 2) const idade com anotacao de tipo numero, valendo 25\n// 3) console.log da frase com template string\n\n',
        esperado: ["Edu tem 25 anos"],
        regras: [
          {
            re: ":\\s*string",
            label: ": string",
            falta: "A anotação vai depois do nome: const nome: string = 'Edu';",
          },
          {
            re: ":\\s*number",
            label: ": number",
            falta: "Idade é número: const idade: number = 25;",
          },
          {
            re: "\\$\\{",
            label: "template string",
            falta: "A frase: `${nome} tem ${idade} anos` — com crase.",
          },
        ],
        dicas: [
          "Formato: const variavel: tipo = valor;",
          "Completo: const nome: string = 'Edu'; const idade: number = 25;",
        ],
        gabarito:
          "const nome: string = 'Edu';\nconst idade: number = 25;\nconsole.log(`${nome} tem ${idade} anos`);",
      },
      {
        tipo: "encaixe",
        enunciado: "Monta a interface Produto — o contrato do objeto:",
        pecas: [
          "interface Produto {",
          "  nome: string;",
          "  preco: number;",
          "  emEstoque: boolean;",
          "}",
        ],
        explain:
          "interface + nome + chaves, e dentro cada propriedade com seu tipo. Qualquer objeto que se diga Produto vai ter que ter essa cara.",
      },
      {
        tipo: "code",
        lang: "ts",
        arquivo: "main.ts",
        enunciado: "Função tipada de ponta a ponta:",
        missao:
          "criar precoComDesconto com os DOIS parâmetros tipados como number e o RETORNO tipado como number, devolvendo preco - desconto. Imprime o resultado pra 120 com desconto 30 — sai 90.",
        starter:
          "// 1) function precoComDesconto(preco, desconto) - tipa os dois parametros e o retorno\n// 2) devolve preco menos desconto\n// 3) imprime no console o resultado pra 120 e 30\n\n",
        esperado: ["90"],
        regras: [
          {
            re: "preco\\s*:\\s*number",
            label: "parâmetro tipado",
            falta: "Tipa o parâmetro: (preco: number, desconto: number)",
          },
          {
            re: "\\)\\s*:\\s*number",
            label: "retorno tipado",
            falta:
              "O tipo do retorno vai DEPOIS dos parênteses: function f(...): number { ... }",
          },
          {
            re: "return",
            label: "return",
            falta: "Devolve a conta: return preco - desconto;",
          },
        ],
        dicas: [
          "Assinatura completa: function precoComDesconto(preco: number, desconto: number): number",
          "E embaixo: console.log(precoComDesconto(120, 30));",
        ],
        gabarito:
          "function precoComDesconto(preco: number, desconto: number): number {\n  return preco - desconto;\n}\n\nconsole.log(precoComDesconto(120, 30));",
      },
      {
        tipo: "quiz",
        q: "O que acontece com os tipos quando o TypeScript compila?",
        opts: [
          "Vão junto e o navegador confere em tempo real",
          "São REMOVIDOS: o que roda é JavaScript puro — os tipos só existem em tempo de desenvolvimento",
          "Viram comentários no código final",
          "São enviados pro servidor validar",
        ],
        correct: 1,
        explain:
          "Os tipos são a rede de segurança de quem ESCREVE o código. Na compilação eles somem — o navegador só conhece JavaScript.",
      },
    ],
  },
];

/* ---------- CORRE DO DIA · banco EXCLUSIVO de desafios ----------
   Nada daqui aparece na trilha: é conteúdo próprio do diário, no tema
   do módulo em que o aluno está. Só quiz e encaixe de propósito —
   formato rápido, de dedão, que cabe nos 10 min do trajeto. */

export const DESAFIOS_DIARIOS = {
  /* ----- Linha 5X-Sul ----- */
  "react-basico": [
    {
      tipo: "quiz",
      q: "Por que o nome de um componente React começa com letra MAIÚSCULA?",
      opts: [
        "É só estilo, tanto faz",
        "É assim que o JSX diferencia componente (<Card />) de tag HTML (<card>)",
        "Porque classe em JS exige maiúscula",
        "Pra ficar igual ao Java",
      ],
      correct: 1,
      explain:
        "Minúscula o JSX trata como tag HTML nativa; maiúscula ele procura o SEU componente. <button> é o botão do navegador, <Button> é o seu.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o componente Botao que recebe o texto por prop:",
      pecas: [
        "function Botao({ texto }) {",
        "  return (",
        "    <button>{texto}</button>",
        "  );",
        "}",
      ],
      explain:
        "A prop chega desestruturada no parâmetro e é interpolada com { } dentro do JSX. Um componente, infinitos botões.",
    },
    {
      tipo: "quiz",
      q: "O que useState(0) DEVOLVE exatamente?",
      opts: [
        "O número 0, direto",
        "Um array com dois itens: o valor atual e a função pra atualizar",
        "Um objeto { value: 0 }",
        "Uma Promise com o estado",
      ],
      correct: 1,
      explain:
        "Por isso a desestruturação de array: const [likes, setLikes] = useState(0). Posição 0 é o valor, posição 1 é o set.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o contador mais enxuto do mundo:",
      pecas: [
        "function Contador() {",
        "  const [n, setN] = useState(0);",
        "  return (",
        "    <button onClick={() => setN(n + 1)}>{n}</button>",
        "  );",
        "}",
      ],
      explain:
        "State primeiro, JSX depois. O onClick chama o set, o set re-renderiza, o {n} novo aparece. Esse ciclo É o React.",
    },
  ],
  "react-inter": [
    {
      tipo: "quiz",
      q: "useEffect SEM array de dependências (nem vazio) roda quando?",
      opts: [
        "Uma vez só, na montagem",
        "A CADA renderização do componente",
        "Nunca",
        "Só quando o state muda",
      ],
      correct: 1,
      explain:
        "Sem array, ele roda depois de todo render. Com [] roda 1x. Com [dep] roda quando a dep muda. Três comportamentos bem diferentes!",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o efeito com timer E a limpeza (cleanup):",
      pecas: [
        "useEffect(() => {",
        "  const id = setInterval(tick, 1000);",
        "  return () => clearInterval(id);",
        "}, []);",
      ],
      explain:
        "O return do useEffect é a função de limpeza: roda quando o componente desmonta. Sem ela, o timer continua rodando fantasma.",
    },
    {
      tipo: "quiz",
      q: "Pra que serve a key quando você renderiza uma lista com .map()?",
      opts: [
        "Deixa a lista em ordem alfabética",
        "É como o React identifica quem entrou, saiu ou mudou — sem ela, ele se perde",
        "Criptografa o item",
        "É obrigatória só em listas com mais de 10 itens",
      ],
      correct: 1,
      explain:
        "A key é a identidade de cada item entre um render e outro. Ideal: um id estável do dado. Índice do array só em último caso.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a lista de frutas renderizada com map:",
      pecas: [
        "<ul>",
        "  {frutas.map(f => (",
        "    <li key={f}>{f}</li>",
        "  ))}",
        "</ul>",
      ],
      explain:
        "O map vai DENTRO do JSX, entre chaves. Cada item vira uma <li> com key. Fecha o map, fecha a <ul>.",
    },
  ],
  "react-avancado": [
    {
      tipo: "quiz",
      q: "Onde NÃO pode chamar um hook?",
      opts: [
        "No topo do componente",
        "Dentro de if, loop ou função aninhada",
        "Dentro de outro hook",
        "Em um custom hook",
      ],
      correct: 1,
      explain:
        "Hooks precisam rodar SEMPRE na mesma ordem a cada render — por isso só no topo. Dentro de if, a ordem muda e o React se perde.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o componente que lê o tema direto do Context:",
      pecas: [
        "function Botao() {",
        "  const tema = useContext(TemaContext);",
        "  return <button className={tema}>Ok</button>;",
        "}",
      ],
      explain:
        "useContext(TemaContext) lê o valor mais próximo do Provider acima na árvore — sem passar prop por prop.",
    },
    {
      tipo: "quiz",
      q: "Quando vale a pena usar useMemo?",
      opts: [
        "Em todo cálculo, sempre",
        "Quando um cálculo PESADO não precisa refazer a cada render",
        "Pra deixar o state global",
        "Só em produção",
      ],
      correct: 1,
      explain:
        "useMemo tem custo próprio (guardar e comparar deps). Usa quando o cálculo é caro de verdade — otimização prematura é cilada.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o custom hook que sincroniza o título da aba:",
      pecas: [
        "function useTitulo(texto) {",
        "  useEffect(() => {",
        "    document.title = texto;",
        "  }, [texto]);",
        "}",
      ],
      explain:
        "Custom hook pode usar outros hooks. O [texto] garante: mudou o texto, atualiza o título. Lógica reutilizável em 5 linhas.",
    },
  ],
  "java-basico": [
    {
      tipo: "quiz",
      q: "Qual dessas declarações Java está CERTA?",
      opts: [
        'int idade = "25";',
        "double preco = 9.90;",
        "boolean ativo = 1;",
        'String nome = Edu;',
      ],
      correct: 1,
      explain:
        'double aceita decimal. As outras: int não aceita texto, boolean em Java é true/false (não 0/1), e String precisa de aspas: "Edu".',
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o while que imprime 0, 1 e 2:",
      pecas: [
        "int i = 0;",
        "while (i < 3) {",
        "  System.out.println(i);",
        "  i++;",
        "}",
      ],
      explain:
        "Declara antes, testa na entrada, incrementa DENTRO. Esquece o i++ e o while roda pra sempre — loop infinito clássico.",
    },
    {
      tipo: "quiz",
      q: "List<String> nomes = new ArrayList<>(); — o que nomes.size() devolve logo em seguida?",
      opts: ["null", "0", "1", "Erro de compilação"],
      correct: 1,
      explain:
        "A lista nasce criada e VAZIA: size() é 0. null seria se você não tivesse dado o new. São coisas bem diferentes!",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o if/else do rolê no shopping:",
      pecas: [
        "if (saldo >= preco) {",
        '  System.out.println("Pode comprar");',
        "} else {",
        '  System.out.println("Saldo curto");',
        "}",
      ],
      explain:
        "Condição entre parênteses, cada bloco com suas chaves, e o else cola na chave que fecha o if. Sintaxe de família C.",
    },
  ],
  "java-poo": [
    {
      tipo: "quiz",
      q: "Pra que serve o this dentro de uma classe?",
      opts: [
        "Cria um objeto novo",
        "Referencia o PRÓPRIO objeto — ex.: separar o atributo do parâmetro de mesmo nome",
        "Chama a classe pai",
        "Torna o método estático",
      ],
      correct: 1,
      explain:
        "No construtor, this.modelo = modelo diz: o atributo DESTE objeto recebe o parâmetro que chegou. Sem o this, seria parâmetro = parâmetro.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a classe com atributo privado e o getter público:",
      pecas: [
        "public class Carro {",
        "  private String modelo;",
        "  public String getModelo() {",
        "    return modelo;",
        "  }",
        "}",
      ],
      explain:
        "Atributo trancado (private), leitura liberada pelo getter (public). Quem tá fora lê, mas não bagunça — encapsulamento na veia.",
    },
    {
      tipo: "quiz",
      q: "O que uma INTERFACE define em Java?",
      opts: [
        "A tela do sistema",
        "Um CONTRATO: quais métodos a classe que implementar é obrigada a ter",
        "Uma classe que não pode ter métodos",
        "O banco de dados da aplicação",
      ],
      correct: 1,
      explain:
        "Interface diz O QUE a classe faz, não COMO. Quem dá o implements assina o contrato e o compilador cobra cada método.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a subclasse que repassa o nome pro construtor do pai:",
      pecas: [
        "class Moto extends Veiculo {",
        "  public Moto(String nome) {",
        "    super(nome);",
        "  }",
        "}",
      ],
      explain:
        "extends herda, e o super(nome) chama o construtor da classe pai — sempre na PRIMEIRA linha do construtor filho.",
    },
  ],
  "spring-boot": [
    {
      tipo: "quiz",
      q: "Qual annotation marca a classe que guarda a REGRA DE NEGÓCIO?",
      opts: ["@RestController", "@Service", "@Entity", "@Autowired"],
      correct: 1,
      explain:
        "Controller atende HTTP, @Service pensa (regra de negócio), Repository busca no banco. O @Service é o miolo da arquitetura.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o service com injeção de dependência via construtor:",
      pecas: [
        "@Service",
        "public class PedidoService {",
        "  private final PedidoRepository repo;",
        "  public PedidoService(PedidoRepository repo) {",
        "    this.repo = repo;",
        "  }",
        "}",
      ],
      explain:
        "Annotation em cima, atributo final, e o Spring entrega o repo pronto pelo construtor. Você declara o que precisa, ele injeta.",
    },
    {
      tipo: "quiz",
      q: "Qual verbo HTTP é o padrão pra ATUALIZAR um recurso existente?",
      opts: ["GET", "PUT", "POST", "DELETE"],
      correct: 1,
      explain:
        "GET busca, POST cria, PUT atualiza, DELETE apaga. É o CRUD falado em HTTP — decorou isso, leu qualquer API do mundo.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o endpoint que APAGA um produto pelo id:",
      pecas: [
        '@DeleteMapping("/{id}")',
        "public void apagar(@PathVariable Long id) {",
        "  service.apagar(id);",
        "}",
      ],
      explain:
        "O {id} da URL cai no parâmetro via @PathVariable, e o controller só delega pro service. Fino, como controller deve ser.",
    },
  ],
  fullstack: [
    {
      tipo: "quiz",
      q: "Em que FORMATO os dados viajam entre o React e a API Spring?",
      opts: ["XML", "JSON", "CSV", "Objeto Java serializado"],
      correct: 1,
      explain:
        'JSON: texto estruturado que os dois lados entendem. O Spring serializa o objeto Java, o React faz res.json() e vira objeto JS.',
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a corrente do fetch, do pedido ao tratamento do erro:",
      pecas: [
        "fetch('/api/produtos')",
        "  .then(res => res.json())",
        "  .then(setProdutos)",
        "  .catch(err => setErro(err.message));",
      ],
      explain:
        "Pede → converte pra JSON → joga no state → e o catch segura qualquer falha da corrente. Sempre nessa ordem.",
    },
    {
      tipo: "quiz",
      q: "A API respondeu 404. O que isso significa?",
      opts: [
        "Deu tudo certo",
        "O recurso pedido não existe naquele endereço",
        "O servidor caiu",
        "Falta de permissão",
      ],
      correct: 1,
      explain:
        "2xx = sucesso, 4xx = erro de quem PEDIU (404 não achou, 401/403 permissão), 5xx = erro do servidor. O prefixo já conta a história.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a busca com async/await, a versão moderna do fetch:",
      pecas: [
        "async function carrega() {",
        "  const res = await fetch('/api/pedidos');",
        "  const dados = await res.json();",
        "  setPedidos(dados);",
        "}",
      ],
      explain:
        "async libera o await, e cada await espera uma etapa: resposta chegar, JSON converter. Lê de cima pra baixo, sem corrente de .then.",
    },
  ],

  /* ----- Linha 6X-Sul ----- */
  "html-base": [
    {
      tipo: "quiz",
      q: "Quantos <h1> uma página deve ter, na boa prática?",
      opts: [
        "Quantos quiser",
        "UM — é o título principal da página",
        "No mínimo três",
        "Nenhum, h1 é obsoleto",
      ],
      correct: 1,
      explain:
        "Um h1 por página: é o título principal que leitores de tela e o Google usam pra entender do que ela trata. Subtítulos: h2 em diante.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a lista NUMERADA da rotina do corre:",
      pecas: [
        "<ol>",
        "  <li>Acorda</li>",
        "  <li>Pega o busão</li>",
        "  <li>Coda</li>",
        "</ol>",
      ],
      explain:
        "<ol> = ordered list, o navegador numera sozinho. Os itens continuam sendo <li> — o que muda é só a tag de fora.",
    },
    {
      tipo: "quiz",
      q: "Diferença entre <ul> e <ol>:",
      opts: [
        "Nenhuma, são sinônimos",
        "<ul> é lista com marcador (bolinha); <ol> é lista NUMERADA",
        "<ol> só aceita números como conteúdo",
        "<ul> é a versão antiga do <ol>",
      ],
      correct: 1,
      explain:
        "ul = unordered (bolinha), ol = ordered (1, 2, 3...). Ranking e passo a passo pedem <ol>; lista de compras pede <ul>.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o link que leva pro site (abre e fecha certinho):",
      pecas: [
        '<a href="https://devdocorre.com">',
        "  Cola no site",
        "</a>",
      ],
      explain:
        "O endereço vai no atributo href, o texto clicável vai DENTRO da tag. Sem href, o <a> nem vira link.",
    },
  ],
  "html-forms": [
    {
      tipo: "quiz",
      q: "Qual atributo OBRIGA o usuário a preencher o campo antes de enviar?",
      opts: ["placeholder", "required", "validate", "important"],
      correct: 1,
      explain:
        "required faz o navegador barrar o envio com campo vazio, de graça, sem JavaScript. placeholder é só a dica cinza dentro do campo.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o select pra escolher a linha do busão:",
      pecas: [
        '<select id="linha">',
        "  <option>5X-Sul</option>",
        "  <option>6X-Sul</option>",
        "</select>",
      ],
      explain:
        "<select> é a caixinha, cada <option> é uma escolha. Fecha as options, fecha o select.",
    },
    {
      tipo: "quiz",
      q: "Pra que serve a tag <footer>?",
      opts: [
        "Esconder conteúdo",
        "Marcar o RODAPÉ: contato, créditos, links finais da página",
        "Carregar a página mais rápido",
        "Criar rolagem infinita",
      ],
      correct: 1,
      explain:
        "É semântica: o <footer> DIZ que aquilo é rodapé. Leitor de tela pula direto pra lá quando o usuário quer o contato.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o esqueleto semântico de uma página inteira:",
      pecas: [
        "<header>",
        "  <nav>menu</nav>",
        "</header>",
        "<main>conteúdo</main>",
        "<footer>contato</footer>",
      ],
      explain:
        "Topo (com o menu dentro), conteúdo principal e rodapé. Três regiões que qualquer leitor de tela navega de olhos fechados.",
    },
  ],
  "css-base": [
    {
      tipo: "quiz",
      q: "Duas regras conflitam: uma por CLASSE (.aviso) e uma por ID (#topo). Quem vence?",
      opts: [
        "A classe, sempre",
        "O ID — é mais ESPECÍFICO que a classe",
        "A que tiver mais propriedades",
        "Nenhuma é aplicada",
      ],
      correct: 1,
      explain:
        "Especificidade: id > classe > tag. Empatou, vence quem vem depois no arquivo. Por isso id no CSS é força bruta — prefira classes.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o efeito de hover do botão:",
      pecas: [
        "button:hover {",
        "  background: #B8F53C;",
        "  transform: translate(2px, 2px);",
        "}",
      ],
      explain:
        ":hover é um pseudo-seletor: a regra só vale enquanto o mouse está em cima. É o feedback visual mais barato que existe.",
    },
    {
      tipo: "quiz",
      q: "O que margin: 8px 16px; significa?",
      opts: [
        "8px em todos os lados, 16px de borda",
        "8px em cima/embaixo e 16px nas laterais",
        "8px à esquerda e 16px à direita",
        "É sintaxe inválida",
      ],
      correct: 1,
      explain:
        "Dois valores: o primeiro é o eixo vertical, o segundo o horizontal. Quatro valores giram no relógio: cima, direita, baixo, esquerda.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a classe de aviso — vermelho e em negrito:",
      pecas: [
        ".aviso {",
        "  color: #FF2E2E;",
        "  font-weight: bold;",
        "}",
      ],
      explain:
        "Seletor com ponto (classe), e dentro cada dupla propriedade: valor; — a anatomia de toda regra CSS, sem exceção.",
    },
  ],
  "css-layout": [
    {
      tipo: "quiz",
      q: "O que flex-direction: column faz num container flex?",
      opts: [
        "Cria colunas de texto tipo jornal",
        "Empilha os filhos na VERTICAL em vez de enfileirar na horizontal",
        "Centraliza tudo",
        "Inverte a ordem dos filhos",
      ],
      correct: 1,
      explain:
        "O padrão do flex é row (fileira). column vira pilha — e atenção: o justify-content passa a agir na vertical, porque o eixo principal girou.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a regra que centraliza QUALQUER coisa na tela:",
      pecas: [
        ".tela {",
        "  display: flex;",
        "  justify-content: center;",
        "  align-items: center;",
        "}",
      ],
      explain:
        "O trio sagrado: vira flex, centraliza no eixo principal e no cruzado. Decorou essas 3 linhas, nunca mais sofre pra centralizar.",
    },
    {
      tipo: "quiz",
      q: "Pra que serve o gap no flexbox/grid?",
      opts: [
        "Cria espaço ENTRE os filhos, sem precisar de margin em cada um",
        "Esconde elementos",
        "Define a largura do container",
        "Só funciona no grid",
      ],
      correct: 0,
      explain:
        "gap: 12px espaça todo mundo de uma vez, só entre os itens (sem sobrar nas pontas). Funciona em flex E grid.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a media query que mostra o menu só em tela grande:",
      pecas: [
        "@media (min-width: 700px) {",
        "  .menu {",
        "    display: flex;",
        "  }",
        "}",
      ],
      explain:
        "A regra de dentro só vale quando a condição de fora é verdade. Repara: são DUAS chaves fechando — a da classe e a da media.",
    },
  ],
  "js-base": [
    {
      tipo: "quiz",
      q: "Quanto dá 2 + '2' no JavaScript?",
      opts: ["4", "'22' — vira texto, o + concatena", "Erro", "NaN"],
      correct: 1,
      explain:
        "Número + string = o JS converte tudo pra string e cola: '22'. Clássica pegadinha — por isso confira os tipos antes de somar.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a função de saudação com template string:",
      pecas: [
        "function saudacao(nome) {",
        "  return `Salve, ${nome}!`;",
        "}",
      ],
      explain:
        "Crase abre a template string e ${ } interpola a variável dentro. Bem mais limpo que 'Salve, ' + nome + '!'.",
    },
    {
      tipo: "quiz",
      q: "Qual linha declara um ARRAY corretamente?",
      opts: [
        "const lista = (1, 2, 3);",
        "const lista = [1, 2, 3];",
        "const lista = {1, 2, 3};",
        "array lista = 1, 2, 3;",
      ],
      correct: 1,
      explain:
        "Colchetes [ ] = array. Chaves { } = objeto. Parênteses agrupam expressões. Cada símbolo tem seu papel no JS.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o if/else que dá boa noite depois das 18h:",
      pecas: [
        "const hora = 19;",
        "if (hora >= 18) {",
        "  console.log('Boa noite!');",
        "} else {",
        "  console.log('Bom dia!');",
        "}",
      ],
      explain:
        "Variável antes, condição no if, e cada caminho no seu bloco. Com hora = 19, sai 'Boa noite!'.",
    },
  ],
  "js-dom": [
    {
      tipo: "quiz",
      q: "Diferença entre querySelector e querySelectorAll:",
      opts: [
        "Nenhuma",
        "querySelector pega o PRIMEIRO que casa; querySelectorAll pega TODOS (numa lista)",
        "querySelectorAll é mais rápido",
        "querySelector só aceita id",
      ],
      correct: 1,
      explain:
        "O All devolve uma NodeList — dá pra percorrer com forEach. O sem All devolve um elemento só (ou null se não achou).",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a criação de um item novo na lista, via JS:",
      pecas: [
        "const li = document.createElement('li');",
        "li.textContent = 'Novo corre';",
        "lista.appendChild(li);",
      ],
      explain:
        "Cria o elemento, dá o texto, e só ENTÃO pendura na página com appendChild. Antes do append, ele existe só na memória.",
    },
    {
      tipo: "quiz",
      q: "Qual evento dispara a CADA tecla digitada num campo de texto?",
      opts: ["'click'", "'input'", "'submit'", "'load'"],
      correct: 1,
      explain:
        "'input' dispara a cada mudança no campo — perfeito pra busca em tempo real. 'submit' é só quando o formulário é enviado.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o submit que NÃO recarrega a página:",
      pecas: [
        "form.addEventListener('submit', (e) => {",
        "  e.preventDefault();",
        "  console.log('enviado sem recarregar');",
        "});",
      ],
      explain:
        "O padrão do submit é recarregar a página inteira. O e.preventDefault() segura isso — primeiro passo de todo form em SPA.",
    },
  ],
  "js-avancado": [
    {
      tipo: "quiz",
      q: "Pra que serve o reduce?",
      opts: [
        "Diminuir o tamanho do array",
        "REDUZIR o array a um valor só: soma, média, total...",
        "Remover duplicados",
        "Ordenar os itens",
      ],
      correct: 1,
      explain:
        "precos.reduce((total, p) => total + p, 0) percorre acumulando. O segundo argumento (0) é o valor inicial do acumulador.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta o map que aplica 10% de taxa nos preços:",
      pecas: [
        "const precos = [10, 20, 30];",
        "const comTaxa = precos.map(p => p * 1.1);",
        "console.log(comTaxa);",
      ],
      explain:
        "map transforma cada item e devolve um array NOVO — o precos original fica intacto. Imutabilidade que o React agradece.",
    },
    {
      tipo: "quiz",
      q: "O que const copia = { ...pessoa } faz?",
      opts: [
        "Aponta pro MESMO objeto",
        "Cria uma cópia rasa: objeto novo com as mesmas propriedades",
        "Apaga o objeto original",
        "Converte pra array",
      ],
      correct: 1,
      explain:
        "O spread espalha as propriedades num objeto novo. 'Rasa' porque objetos aninhados ainda são compartilhados — atenção nisso.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a busca async com try/catch segurando o erro:",
      pecas: [
        "async function busca() {",
        "  try {",
        "    const res = await fetch('/api');",
        "    return await res.json();",
        "  } catch (erro) {",
        "    console.log('deu ruim:', erro);",
        "  }",
        "}",
      ],
      explain:
        "Com await, o erro do fetch cai direto no catch — o equivalente async do .catch() das Promises. Rede SEMPRE pode falhar: trata.",
    },
  ],
  "ts-mini": [
    {
      tipo: "quiz",
      q: "O que const notas: number[] declara?",
      opts: [
        "Um número só",
        "Um ARRAY onde todo item tem que ser number",
        "Uma matriz",
        "Um número opcional",
      ],
      correct: 1,
      explain:
        "tipo[] é array daquele tipo. notas.push('dez') nem compila — o TS barra antes de rodar. Existe também a forma Array<number>.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a função tipada que decide se é maior de idade:",
      pecas: [
        "function ehMaior(idade: number): boolean {",
        "  return idade >= 18;",
        "}",
      ],
      explain:
        "Parâmetro tipado na entrada, boolean prometido na saída. Quem chamar ehMaior('vinte') leva bronca do compilador na hora.",
    },
    {
      tipo: "quiz",
      q: "Como marcar uma propriedade OPCIONAL numa interface?",
      opts: [
        "Com * depois do nome",
        "Com ? depois do nome: desconto?: number",
        "Com optional na frente",
        "Não existe propriedade opcional",
      ],
      correct: 1,
      explain:
        "O ? diz: pode vir, pode faltar. Aí o TS te obriga a tratar o caso undefined ao usar — segurança em dobro.",
    },
    {
      tipo: "encaixe",
      enunciado: "Monta a interface e o objeto que cumpre o contrato:",
      pecas: [
        "interface Usuario {",
        "  nome: string;",
        "  idade: number;",
        "}",
        'const edu: Usuario = { nome: "Edu", idade: 25 };',
      ],
      explain:
        "Primeiro o contrato (interface), depois o objeto anotado com ele. Faltou propriedade ou errou tipo? O TS aponta na linha.",
    },
  ],
};

/* ---------- AS LINHAS (cursos disponíveis) ---------- */

export const CURSOS = [
  {
    id: "web",
    rota: "LINHA 6X-SUL · SENTIDO WEB",
    titulo: "Web + React",
    sub: "do HTML ao CRUD em React + TypeScript",
    desc: "Fundamentos da web, aplicação JavaScript com CRUD e dashboard, migração para React e tipagem completa com TypeScript.",
    finalTxt:
      "Você construiu a base, um CRUD em JavaScript e a migração para React + TypeScript. Agora conecta esse front a uma API real. 🚀",
    modules: [
      ...MODULES_WEB.slice(0, MODULES_WEB.length - 1),
      WEB_PROJECT_MODULES[0],
      WEB_PROJECT_MODULES[1],
      WEB_PROJECT_MODULES[2],
      MODULES_WEB[MODULES_WEB.length - 1],
      WEB_PROJECT_MODULES[3],
    ],
  },
  {
    id: "fullstack",
    rota: "LINHA 5X-SUL · SENTIDO FULLSTACK",
    titulo: "Fullstack React + Java",
    sub: "API, auth, dashboard, testes e deploy",
    desc: "Continuação da linha Web: React no front, Java e Spring no back, banco real, autenticação, autorização e publicação do sistema completo.",
    finalTxt:
      "CRUD, autenticação, dashboard, testes e deploy concluídos. O projeto final agora é uma entrega verificável, não só uma demonstração. 🚀",
    modules: [...MODULES_FULLSTACK, ...FULLSTACK_PROJECT_MODULES],
  },
];
