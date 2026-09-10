/**
 * lib/money.ts — helpers de dinheiro.
 *
 * REGRA 3.1: todo valor monetário é `bigint` em CENTAVOS. Nunca float, nunca
 * numeric no código de aplicação. Estes helpers são a única porta de entrada e
 * saída de strings de dinheiro — nenhum outro lugar do código deve fazer
 * parsing/formatação de moeda por conta própria.
 */

/**
 * Formata centavos como moeda brasileira.
 *
 * Ex.: 1900000n -> "R$ 19.000,00"; -100000n -> "-R$ 1.000,00".
 *
 * Internamente convertemos para number só no fim, na fronteira de exibição —
 * nunca fazemos aritmética em number. Para valores dentro do intervalo seguro
 * de um double (até ~9 * 10^13 centavos, ou R$ 900 bilhões), a conversão é
 * exata; valores maiores que isso não existem no domínio deste sistema.
 */
export function formatBRL(centavos: bigint): string {
  const negativo = centavos < 0n;
  const absCentavos = negativo ? -centavos : centavos;

  const reais = absCentavos / 100n;
  const restoCentavos = absCentavos % 100n;

  const reaisFormatado = reais.toLocaleString("pt-BR");
  const centavosFormatado = restoCentavos.toString().padStart(2, "0");

  const valor = `R$ ${reaisFormatado},${centavosFormatado}`;
  return negativo ? `-${valor}` : valor;
}

/**
 * Converte uma string de dinheiro (formato brasileiro) em centavos.
 *
 * Aceita formatos comuns: "R$ 19.000,00", "19000,00", "19.000,00", "19000",
 * "-1.000,00" (negativo, usado para estornos). Lança erro para entradas
 * inválidas — nunca retorna um valor "aproximado".
 *
 * Regras:
 *  - Símbolo "R$" e espaços são ignorados.
 *  - "." é separador de milhar (removido).
 *  - "," é separador decimal (se presente, deve ter exatamente 2 dígitos após).
 *  - Sinal "-" opcional no início.
 */
export function parseBRL(valor: string): bigint {
  const original = valor;
  let s = valor.trim();

  if (s === "") {
    throw new Error(`parseBRL: valor vazio ("${original}")`);
  }

  let negativo = false;
  if (s.startsWith("-")) {
    negativo = true;
    s = s.slice(1).trim();
  }

  s = s.replace(/^R\$\s*/i, "").trim();

  if (s === "") {
    throw new Error(`parseBRL: valor inválido ("${original}")`);
  }

  // Com separador decimal explícito (vírgula): milhar é "." e decimal é ",".
  // Sem vírgula: aceitamos apenas dígitos (nenhum separador de milhar), para
  // não adivinhar se um "." solto é decimal ou milhar.
  let reaisStr: string;
  let centavosStr: string;

  if (s.includes(",")) {
    const partes = s.split(",");
    if (partes.length !== 2) {
      throw new Error(`parseBRL: formato inválido ("${original}")`);
    }
    const parteInteira = partes[0] ?? "";
    const parteDecimal = partes[1] ?? "";
    if (!/^\d{2}$/.test(parteDecimal)) {
      throw new Error(
        `parseBRL: parte decimal deve ter 2 dígitos ("${original}")`,
      );
    }
    const inteiraSemMilhar = parteInteira.replace(/\./g, "");
    if (!/^\d+$/.test(inteiraSemMilhar)) {
      throw new Error(`parseBRL: formato inválido ("${original}")`);
    }
    reaisStr = inteiraSemMilhar;
    centavosStr = parteDecimal;
  } else {
    if (!/^\d+$/.test(s)) {
      throw new Error(`parseBRL: formato inválido ("${original}")`);
    }
    reaisStr = s;
    centavosStr = "00";
  }

  const totalCentavos = BigInt(reaisStr) * 100n + BigInt(centavosStr);
  return negativo ? -totalCentavos : totalCentavos;
}
