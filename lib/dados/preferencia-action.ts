"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { preferenciaVeiculoSchema } from "@/lib/validacao/plano";

export type EstadoPreferencia = { erro?: string; sucesso?: boolean };

/**
 * Cliente registra/atualiza o carro desejado (CRM de preferência) — pedido
 * do usuário: "pergunte a ele qual valor da meta dele, pergunte
 * Marca/Modelo/Ano do carro que ele deseja". Chama a RPC
 * `definir_preferencia_veiculo` (SECURITY DEFINER, resolve o plano ativo do
 * chamador — nunca recebe plano_id do client). Ver supabase/migrations/
 * 20260101001600_preferencias_veiculo.sql.
 */
export async function definirPreferenciaVeiculoAction(
  _estadoAnterior: EstadoPreferencia,
  formData: FormData,
): Promise<EstadoPreferencia> {
  const resultado = preferenciaVeiculoSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { erro: "Não autenticado" };
  }

  const { anoMin, anoMax, valorMeta, observacoes, marca, modelo, catalogoModeloId } =
    resultado.data;

  const { error } = await supabase.rpc("definir_preferencia_veiculo", {
    p_marca: marca || undefined,
    p_modelo: modelo || undefined,
    p_ano_min: anoMin ? Number(anoMin) : undefined,
    p_ano_max: anoMax ? Number(anoMax) : undefined,
    p_valor_meta_centavos: valorMeta != null ? Number(valorMeta) : undefined,
    p_observacoes: observacoes || undefined,
    p_catalogo_modelo_id: catalogoModeloId || undefined,
  });

  if (error) {
    return { erro: "Não foi possível salvar sua preferência. Tente novamente." };
  }

  revalidatePath("/app");
  revalidatePath("/app/plano");

  return { sucesso: true };
}

export async function removerPreferenciaVeiculoAction(
  _estadoAnterior: EstadoPreferencia,
  formData: FormData,
): Promise<EstadoPreferencia> {
  const preferenciaId = String(formData.get("preferenciaId") ?? "");
  if (!preferenciaId) {
    return { erro: "Preferência inválida" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { erro: "Não autenticado" };
  }

  const { error } = await supabase.rpc("remover_preferencia_veiculo", {
    p_preferencia_id: preferenciaId,
  });

  if (error) {
    return { erro: "Não foi possível remover esta preferência." };
  }

  revalidatePath("/app/plano");

  return { sucesso: true };
}
