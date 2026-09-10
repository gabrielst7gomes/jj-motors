"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { calcularElegibilidade } from "@/lib/elegibilidade";
import { simularPromissoria, type ResultadoPromissoria } from "@/lib/promissoria";
import { getTaxaJurosEfetiva } from "@/lib/dados/taxa-juros";

const entradaSchema = z.object({
  veiculoId: z.string().uuid(),
  qtdParcelas: z.coerce.number().int().min(1).max(60),
});

export type ResultadoSimulacao =
  | { ok: true; resultado: ResultadoPromissoria; taxaJurosMensal: number }
  | { ok: false; erro: string };

/**
 * Simula a promissória INTEIRAMENTE no servidor: preço, entrada (saldo) e
 * taxa de juros são todos recalculados a partir do banco — o client só
 * escolhe a quantidade de parcelas. Nunca confiamos em preço/saldo/taxa
 * vindos do client (regra de convenção 7).
 */
export async function simularParcelasAction(
  input: unknown,
): Promise<ResultadoSimulacao> {
  const parsed = entradaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, erro: "Dados inválidos" };
  }
  const { veiculoId, qtdParcelas } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, erro: "Não autenticado" };
  }

  const { data: plano } = await supabase
    .from("planos")
    .select("id, percentual_minimo")
    .eq("cliente_id", user.id)
    .eq("status", "ativo")
    .order("data_adesao", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!plano) {
    return { ok: false, erro: "Nenhum plano ativo" };
  }

  const { data: veiculo } = await supabase
    .from("vw_veiculos_publico")
    .select("preco_venda_centavos")
    .eq("id", veiculoId)
    .maybeSingle();

  if (!veiculo) {
    return { ok: false, erro: "Veículo não encontrado" };
  }

  const { data: saldo } = await supabase
    .from("vw_saldo_cliente")
    .select("saldo_confirmado_centavos")
    .eq("plano_id", plano.id)
    .maybeSingle();

  const saldoConfirmado = BigInt(saldo?.saldo_confirmado_centavos ?? 0);
  const precoVenda = BigInt(veiculo.preco_venda_centavos ?? 0);

  const elegibilidade = calcularElegibilidade({
    saldoConfirmadoCentavos: saldoConfirmado,
    precoVendaCentavos: precoVenda,
    percentualMinimo: plano.percentual_minimo,
  });

  if (!elegibilidade.elegivel) {
    return { ok: false, erro: "Você ainda não é elegível para este veículo" };
  }

  const taxaJurosMensal = await getTaxaJurosEfetiva(supabase, plano.id);

  try {
    const resultado = simularPromissoria({
      precoVeiculoCentavos: precoVenda,
      entradaCentavos: saldoConfirmado,
      qtdParcelas,
      taxaJurosMensal,
    });
    return { ok: true, resultado, taxaJurosMensal };
  } catch (e) {
    return {
      ok: false,
      erro: e instanceof Error ? e.message : "Erro ao simular",
    };
  }
}
