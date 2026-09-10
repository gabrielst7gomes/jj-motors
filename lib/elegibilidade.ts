/**
 * lib/elegibilidade.ts — regra de elegibilidade como função pura.
 *
 * REGRA 3.3:
 *   meta            = ROUND(preco_venda * percentual_minimo)   [half-up, decisão A1]
 *   elegivel        = saldo_confirmado >= meta
 *   valor_faltante  = meta - saldo_confirmado   (>= 0; 0 quando elegível)
 *
 * Espelha EXATAMENTE a função SQL `meta_centavos()` e a view `vw_elegibilidade`
 * (supabase/migrations/20260101000000_extensions.sql e .../000300_views.sql).
 * Os testes de borda garantem que os dois lados concordam.
 *
 * Por que a fração é {numerador, denominador} e não `number`:
 * `percentual_minimo` é armazenado no banco como NUMERIC(4,3) (ex.: 0.500,
 * 0.600). Representá-lo como `number` em JS e multiplicar por um bigint exige
 * converter o bigint para number em algum momento, o que é exatamente o que a
 * regra 3.1 proíbe (perda de precisão em valores grandes). Em vez disso,
 * tratamos o percentual como uma fração exata de inteiros — para um
 * NUMERIC(4,3) isso é sempre round(percentual * 1000) / 1000 — e fazemos toda
 * a aritmética em BigInt.
 */

/** Percentual mínimo com 3 casas decimais, como vem de NUMERIC(4,3) no banco. */
export type PercentualMinimo = number;

export type EntradaElegibilidade = {
  saldoConfirmadoCentavos: bigint;
  precoVendaCentavos: bigint;
  /** Fração do preço exigida. Padrão 0.5. Configurável por plano. */
  percentualMinimo: PercentualMinimo;
};

export type ResultadoElegibilidade = {
  metaCentavos: bigint;
  elegivel: boolean;
  valorFaltanteCentavos: bigint;
};

/** Denominador fixo: percentual_minimo é NUMERIC(4,3) -> 3 casas decimais. */
const DENOMINADOR = 1000n;

/**
 * Converte o percentual (number, até 3 casas decimais) em numerador inteiro
 * sobre DENOMINADOR = 1000. Ex.: 0.5 -> 500n; 0.6 -> 600n; 0.505 -> 505n.
 *
 * Arredonda para o milésimo mais próximo antes de truncar, para absorver
 * imprecisão de ponto flutuante ao representar, por ex., 0.1 + 0.4.
 */
function percentualParaNumerador(percentual: number): bigint {
  if (!Number.isFinite(percentual) || percentual <= 0 || percentual > 1) {
    throw new Error(
      `percentualMinimo deve estar em (0, 1], recebido: ${percentual}`,
    );
  }
  return BigInt(Math.round(percentual * 1000));
}

/**
 * ROUND(preco * percentual), half-up, em aritmética inteira de BigInt.
 *
 * Equivale a: round(precoVendaCentavos * percentualMinimo) no SQL, para
 * percentual sempre positivo (half-up == half-away-from-zero nesse caso).
 *
 * Implementação: preco * numerador é sempre um bigint exato; dividimos por
 * DENOMINADOR "half-up" somando metade do denominador antes da divisão
 * inteira (válido porque preco > 0 e numerador > 0, logo o produto é >= 0).
 */
function metaCentavos(
  precoVendaCentavos: bigint,
  percentualMinimo: PercentualMinimo,
): bigint {
  if (precoVendaCentavos < 0n) {
    throw new Error(
      `precoVendaCentavos não pode ser negativo: ${precoVendaCentavos}`,
    );
  }
  const numerador = percentualParaNumerador(percentualMinimo);
  const produto = precoVendaCentavos * numerador;
  return (produto + DENOMINADOR / 2n) / DENOMINADOR;
}

export function calcularElegibilidade(
  entrada: EntradaElegibilidade,
): ResultadoElegibilidade {
  const { saldoConfirmadoCentavos, precoVendaCentavos, percentualMinimo } =
    entrada;

  const meta = metaCentavos(precoVendaCentavos, percentualMinimo);
  const elegivel = saldoConfirmadoCentavos >= meta;
  const valorFaltante = meta - saldoConfirmadoCentavos;

  return {
    metaCentavos: meta,
    elegivel,
    valorFaltanteCentavos: valorFaltante > 0n ? valorFaltante : 0n,
  };
}
