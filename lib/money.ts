/**
 * lib/money.ts — helpers de dinheiro.
 *
 * REGRA 3.1: todo valor monetário é `bigint` em CENTAVOS. Nunca float, nunca
 * numeric no código de aplicação. Estes helpers são a única porta de entrada e
 * saída de strings de dinheiro.
 *
 * Implementação completa + testes chegam na FASE 2. Este stub existe só para o
 * scaffold compilar; as assinaturas já são as definitivas.
 */

/** Formata centavos como moeda brasileira. Ex.: 1900000n -> "R$ 19.000,00". */
export function formatBRL(_centavos: bigint): string {
  throw new Error("formatBRL: implementado na Fase 2");
}

/** Converte uma string de dinheiro em centavos. Ex.: "R$ 19.000,00" -> 1900000n. */
export function parseBRL(_valor: string): bigint {
  throw new Error("parseBRL: implementado na Fase 2");
}
