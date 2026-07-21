/* MODO TREINO 💪 — problemas de código estilo entrevista técnica.
   O aluno escolhe JS ou TS, escreve uma função NOMEADA e roda uma
   bateria de casos entrada→saída (uns visíveis, uns ocultos pra evitar
   decoreba). Roda de verdade no sandbox (ver montaSrcDocTeste).

   Formato de cada problema:
   { id, titulo, nivel, tema, funcao, enunciado, starter,
     casos: [{ entrada: [...args], esperado, oculto? }],
     dicas: [...], gabarito }

   `funcao` é o nome que o enunciado pede — o harness chama ela.
   `entrada` é o array de ARGUMENTOS (spread na chamada). */

export const TRILHAS_PRATICA = [
  {
    id: "mercado",
    nome: "Prepara pro Mercado",
    tag: "MODO TREINO · ENTREVISTA TÉCNICA 💪",
    desc: "Problemas do tipo que caem em teste de vaga júnior. Escreve a função, roda os casos, passou tudo = fechou. JS ou TS, você escolhe.",
    problemas: [
      {
        id: "soma-lista",
        titulo: "Soma da lista",
        nivel: "Fácil",
        tema: "Arrays",
        funcao: "somaLista",
        enunciado:
          "Implemente somaLista(nums) que recebe um array de números e devolve a soma de todos. Lista vazia soma 0.",
        starter: "function somaLista(nums) {\n  // seu código aqui\n}\n",
        casos: [
          { entrada: [[1, 2, 3]], esperado: 6 },
          { entrada: [[10, -4, 2]], esperado: 8 },
          { entrada: [[]], esperado: 0, oculto: true },
          { entrada: [[7]], esperado: 7, oculto: true },
        ],
        dicas: [
          "Um acumulador começando em 0 e um for já resolve.",
          "Ou, num golpe só: nums.reduce((a, b) => a + b, 0).",
        ],
        gabarito:
          "function somaLista(nums) {\n  return nums.reduce((a, b) => a + b, 0);\n}\n",
      },
      {
        id: "inverte-texto",
        titulo: "Inverte o texto",
        nivel: "Fácil",
        tema: "Strings",
        funcao: "inverte",
        enunciado:
          'Implemente inverte(texto) que devolve a string de trás pra frente. Ex: inverte("corre") → "erroc".',
        starter: "function inverte(texto) {\n  // seu código aqui\n}\n",
        casos: [
          { entrada: ["corre"], esperado: "erroc" },
          { entrada: ["dev"], esperado: "ved" },
          { entrada: [""], esperado: "", oculto: true },
          { entrada: ["a"], esperado: "a", oculto: true },
        ],
        dicas: [
          "String vira array com .split(''), array inverte com .reverse().",
          'Depois volta pra texto com .join(""). Encaixa os três.',
        ],
        gabarito:
          'function inverte(texto) {\n  return texto.split("").reverse().join("");\n}\n',
      },
      {
        id: "conta-vogais",
        titulo: "Conta as vogais",
        nivel: "Fácil",
        tema: "Strings",
        funcao: "contaVogais",
        enunciado:
          'Implemente contaVogais(texto) que devolve QUANTAS vogais (a, e, i, o, u) tem no texto. Considere só minúsculas. Ex: contaVogais("banana") → 3.',
        starter: "function contaVogais(texto) {\n  // seu código aqui\n}\n",
        casos: [
          { entrada: ["banana"], esperado: 3 },
          { entrada: ["ritmo"], esperado: 1 },
          { entrada: ["xyz"], esperado: 0, oculto: true },
          { entrada: ["aeiou"], esperado: 5, oculto: true },
        ],
        dicas: [
          'Percorre letra a letra e testa se ela está em "aeiou".',
          'Dá pra usar um contador, ou "aeiou".includes(letra) dentro do loop.',
        ],
        gabarito:
          'function contaVogais(texto) {\n  let n = 0;\n  for (const c of texto) {\n    if ("aeiou".includes(c)) n++;\n  }\n  return n;\n}\n',
      },
      {
        id: "fizzbuzz",
        titulo: "FizzBuzz de um número",
        nivel: "Médio",
        tema: "Lógica",
        funcao: "fizzbuzz",
        enunciado:
          'Clássico de entrevista. Implemente fizzbuzz(n): devolve "FizzBuzz" se n é múltiplo de 3 E de 5, "Fizz" se só de 3, "Buzz" se só de 5, senão devolve o próprio número (como número, não string).',
        starter: "function fizzbuzz(n) {\n  // seu código aqui\n}\n",
        casos: [
          { entrada: [15], esperado: "FizzBuzz" },
          { entrada: [9], esperado: "Fizz" },
          { entrada: [10], esperado: "Buzz" },
          { entrada: [7], esperado: 7 },
          { entrada: [30], esperado: "FizzBuzz", oculto: true },
          { entrada: [1], esperado: 1, oculto: true },
        ],
        dicas: [
          "Múltiplo de 3 é n % 3 === 0. Testa o caso 3 E 5 PRIMEIRO.",
          "A ordem dos if importa: se checar o 3 antes do 3-e-5, o 15 vira só Fizz.",
        ],
        gabarito:
          'function fizzbuzz(n) {\n  if (n % 15 === 0) return "FizzBuzz";\n  if (n % 3 === 0) return "Fizz";\n  if (n % 5 === 0) return "Buzz";\n  return n;\n}\n',
      },
      {
        id: "palindromo",
        titulo: "É palíndromo?",
        nivel: "Médio",
        tema: "Strings",
        funcao: "ehPalindromo",
        enunciado:
          'Implemente ehPalindromo(texto) que devolve true se o texto é igual de trás pra frente, senão false. Ex: ehPalindromo("arara") → true.',
        starter: "function ehPalindromo(texto) {\n  // seu código aqui\n}\n",
        casos: [
          { entrada: ["arara"], esperado: true },
          { entrada: ["corre"], esperado: false },
          { entrada: ["ana"], esperado: true, oculto: true },
          { entrada: [""], esperado: true, oculto: true },
        ],
        dicas: [
          "Você já sabe inverter uma string (viu no desafio do inverte).",
          "Compara o texto com ele invertido: são iguais? então é palíndromo.",
        ],
        gabarito:
          'function ehPalindromo(texto) {\n  const invertido = texto.split("").reverse().join("");\n  return texto === invertido;\n}\n',
      },
    ],
  },
];
