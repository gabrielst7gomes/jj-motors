/**
 * lib/elegibilidade.ts — regra de elegibilidade como função pura.
 *
 * REGRA 3.3:
 *   meta            = ROUND(preco_venda * percentual_minimo)   [half-up, decisão A1]
 *   elegivel        = saldo_confirmado >= meta
 *   valor_faltante  = meta - saldo_confirmado   (>= 0; 0 quando elegível)
 *
 * Espelha exatamente a view SQL `vw_elegibilidade` e a função `meta_centavos`.
 *
 * Implementação completa + testes (saldo no limite, 1 centavo abaixo, percentual
 * customizado, preço alterado após elegibilidade) chegam na FASE 2.
 */

export type EntradaElegibilidade = {
  saldoConfirmadoCentavos: bigint;
  precoVendaCentavos: bigint;
  /** Fração do preço exigida. Padrão 0.5. Configurável por plano. */
  percentualMinimo: number;
};

export type ResultadoElegibilidade = {
  metaCentavos: bigint;
  elegivel: boolean;
  valorFaltanteCentavos: bigint;
};

export function calcularElegibilidade(
  _entrada: EntradaElegibilidade,
): ResultadoElegibilidade {
  throw new Error("calcularElegibilidade: implementado na Fase 2");
}
