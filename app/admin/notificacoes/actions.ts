"use server";

import { revalidatePath } from "next/cache";

import { exigirPermissao } from "@/app/admin/_actions/autorizacao";

export type EstadoReenvio = { erro?: string; sucesso?: boolean };

/**
 * Reenvio manual: volta a notificação para 'fila' com `agendado_para = now()`
 * para que o worker (Fase 6) a pegue na próxima execução. Não chama o
 * provider diretamente daqui — a fila é a única porta de entrada de envio,
 * para manter rate limit e dedupe centralizados no worker.
 */
export async function reenviarNotificacao(
  notificacaoId: string,
): Promise<EstadoReenvio> {
  const { supabase } = await exigirPermissao("notificacoes.gerenciar");

  const { data: notificacao } = await supabase
    .from("notificacoes")
    .select("status")
    .eq("id", notificacaoId)
    .single();

  if (!notificacao || notificacao.status !== "falha") {
    return { erro: "Só é possível reenviar notificações com falha." };
  }

  const { error } = await supabase
    .from("notificacoes")
    .update({ status: "fila", agendado_para: new Date().toISOString(), erro: null })
    .eq("id", notificacaoId);

  if (error) {
    return { erro: `Erro ao reenviar: ${error.message}` };
  }

  revalidatePath("/admin/notificacoes");
  return { sucesso: true };
}
