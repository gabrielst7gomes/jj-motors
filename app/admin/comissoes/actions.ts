"use server";

import { revalidatePath } from "next/cache";

import { exigirStaff } from "@/app/admin/_actions/autorizacao";

export type EstadoComissao = { erro?: string; sucesso?: boolean };

export async function marcarComissaoPaga(
  comissaoId: string,
): Promise<EstadoComissao> {
  const { supabase } = await exigirStaff();

  const { error } = await supabase.rpc("marcar_comissao_paga", {
    p_comissao_id: comissaoId,
  });

  if (error) {
    return { erro: error.message };
  }

  revalidatePath("/admin/comissoes");
  return { sucesso: true };
}
