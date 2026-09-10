"use server";

import { revalidatePath } from "next/cache";

import { exigirPermissao } from "@/app/admin/_actions/autorizacao";

export type EstadoConversao = { erro?: string; sucesso?: boolean };

/**
 * Converte uma reserva ativa em venda via RPC transacional
 * `converter_reserva_em_venda` (lock + gera comissão se o plano tiver
 * vendedor vinculado). Ver supabase/migrations/20260101001400_rpc_converter_reserva.sql.
 * A RPC também checa a permissão internamente (defesa em profundidade); a
 * checagem aqui só antecipa o erro antes de qualquer round-trip de RPC.
 */
export async function converterReservaEmVenda(
  reservaId: string,
): Promise<EstadoConversao> {
  const { supabase } = await exigirPermissao("reservas.gerenciar");

  const { error } = await supabase.rpc("converter_reserva_em_venda", {
    p_reserva_id: reservaId,
  });

  if (error) {
    return { erro: error.message };
  }

  revalidatePath("/admin/reservas");
  revalidatePath("/admin/estoque");
  revalidatePath("/admin/comissoes");
  return { sucesso: true };
}
