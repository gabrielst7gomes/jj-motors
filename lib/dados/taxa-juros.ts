import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * Resolução da taxa de juros mensal efetiva de um plano:
 *   taxa do plano (se definida) -> taxa global (configuracoes) -> 0.02 (fallback)
 *
 * Espelha exatamente a função SQL `taxa_juros_do_plano()` (ver migration
 * 20260101001200_taxa_juros_configuravel.sql) — mantidas em sincronia para
 * o valor usado na simulação (aqui) bater com o que a RPC de reserva usa
 * ao gravar a proposta (Fase 5).
 */
export async function getTaxaJurosEfetiva(
  supabase: SupabaseClient<Database>,
  planoId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc("taxa_juros_do_plano", {
    p_plano_id: planoId,
  });

  if (error || data == null) {
    // Fallback defensivo — nunca deveria acontecer (a função sempre resolve
    // para algum valor), mas simular com juros indefinido seria pior.
    return 0.02;
  }

  return data;
}

export const TAXA_JUROS_MENSAL_PADRAO_CHAVE = "taxa_juros_mensal_padrao";

export async function getTaxaJurosGlobal(
  supabase: SupabaseClient<Database>,
): Promise<number> {
  const { data } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", TAXA_JUROS_MENSAL_PADRAO_CHAVE)
    .maybeSingle();

  const valor = data ? Number(data.valor) : NaN;
  return Number.isFinite(valor) ? valor : 0.02;
}
