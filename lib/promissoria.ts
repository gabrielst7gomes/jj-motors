/**
 * lib/promissoria.ts — simulação da promissória (crédito direto ao consumidor).
 *
 * DECISÃO A2: Tabela Price.
 *   PMT = PV * i / (1 - (1 + i)^-n)
 *   - PV = saldo a financiar (preço - entrada), em centavos
 *   - i  = taxa de juros mensal (default configurável, placeholder 0.02 = 2% a.m.)
 *   - n  = quantidade de parcelas
 *   Cada parcela é arredondada ao centavo; o resíduo acumulado vai na última.
 *
 * Implementação completa + testes chegam na FASE 2 (o núcleo de cálculo).
 */

export type EntradaPromissoria = {
  precoVeiculoCentavos: bigint;
  entradaCentavos: bigint;
  qtdParcelas: number;
  taxaJurosMensal: number;
};

export type ParcelaSimulada = {
  numero: number;
  valorCentavos: bigint;
};

export type ResultadoPromissoria = {
  saldoFinanciadoCentavos: bigint;
  valorParcelaCentavos: bigint;
  totalPagoCentavos: bigint;
  parcelas: ParcelaSimulada[];
};

export function simularPromissoria(
  _entrada: EntradaPromissoria,
): ResultadoPromissoria {
  throw new Error("simularPromissoria: implementado na Fase 2");
}
