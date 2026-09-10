"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type EstadoNegociacao = { erro?: string; sucesso?: boolean };

type StatusNegociacao = Database["public"]["Enums"]["status_negociacao"];

/**
 * Muda o status de uma negociação (nova / em_andamento / perdida). Fechar
 * como venda é `converterNegociacaoEmVenda` — vai por outra RPC porque gera
 * comissão. A RPC `atualizar_status_negociacao` já checa se o chamador é
 * staff OU o vendedor dono (defesa em profundidade); aqui só passamos adiante.
 */
export async function atualizarStatusNegociacao(
  negociacaoId: string,
  status: Exclude<StatusNegociacao, "fechada">,
): Promise<EstadoNegociacao> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Não autenticado" };

  const { error } = await supabase.rpc("atualizar_status_negociacao", {
    p_negociacao_id: negociacaoId,
    p_status: status,
  });

  if (error) {
    return { erro: error.message.includes("permissão")
      ? "Você não pode alterar esta negociação."
      : "Não foi possível atualizar o status." };
  }

  revalidatePath("/admin/negociacoes");
  return { sucesso: true };
}

/**
 * Fecha a negociação como venda: veículo -> vendido, outras negociações do
 * mesmo veículo -> perdida, gera comissão pendente se o plano tiver vendedor.
 * Requer permissão reservas.gerenciar (a RPC checa).
 */
export async function converterNegociacaoEmVenda(
  negociacaoId: string,
): Promise<EstadoNegociacao> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { erro: "Não autenticado" };

  const { error } = await supabase.rpc("converter_negociacao_em_venda", {
    p_negociacao_id: negociacaoId,
  });

  if (error) {
    return { erro: error.message.includes("permissão")
      ? "Só a equipe da JJ Motors pode marcar como vendido."
      : error.message };
  }

  revalidatePath("/admin/negociacoes");
  revalidatePath("/admin/estoque");
  revalidatePath("/admin/comissoes");
  return { sucesso: true };
}
