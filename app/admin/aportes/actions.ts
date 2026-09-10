"use server";

import { revalidatePath } from "next/cache";

import {
  lancarAporteSchema,
  confirmarAporteSchema,
  rejeitarAporteSchema,
  estornarAporteSchema,
} from "@/lib/validacao/aporte";
import { registrarAuditoria } from "@/app/admin/_actions/auditoria";
import { exigirPermissao } from "@/app/admin/_actions/autorizacao";

import { uploadComprovante } from "./upload-comprovante";

export type EstadoFormulario = { erro?: string; sucesso?: boolean };

/** Lança um aporte como 'pendente'. Confirmação é uma ação separada (fluxo de dois passos). */
export async function lancarAporte(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase } = await exigirPermissao("aportes.confirmar");

  const camposTexto = Object.fromEntries(
    Array.from(formData.entries()).filter(([, v]) => typeof v === "string"),
  );
  const resultado = lancarAporteSchema
    .omit({ comprovanteUrl: true })
    .safeParse(camposTexto);
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const dados = resultado.data;

  const { data: plano } = await supabase
    .from("planos")
    .select("cliente_id")
    .eq("id", dados.planoId)
    .single();
  if (!plano) {
    return { erro: "Plano não encontrado" };
  }

  let comprovanteUrl: string | null = null;
  const arquivo = formData.get("comprovante");
  if (arquivo instanceof File && arquivo.size > 0) {
    const resultadoUpload = await uploadComprovante(plano.cliente_id, arquivo);
    if ("erro" in resultadoUpload) {
      return { erro: resultadoUpload.erro };
    }
    comprovanteUrl = resultadoUpload.url;
  }

  const { error } = await supabase.from("aportes").insert({
    plano_id: dados.planoId,
    valor_centavos: Number(dados.valor),
    tipo: "aporte",
    status: "pendente",
    meio_pagamento: dados.meioPagamento,
    data_competencia: dados.dataCompetencia,
    comprovante_url: comprovanteUrl,
  });

  if (error) {
    return { erro: `Erro ao lançar aporte: ${error.message}` };
  }

  revalidatePath("/admin/aportes");
  return { sucesso: true };
}

/**
 * Confirma um aporte pendente. É a única transição permitida pelo trigger
 * `aportes_guarda_mutacao` além de rejeitar — depois disso o lançamento é
 * imutável (regra 3.2: ledger append-only).
 */
export async function confirmarAporte(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase, userId } = await exigirPermissao("aportes.confirmar");

  const resultado = confirmarAporteSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: "Dados inválidos" };
  }
  const { aporteId } = resultado.data;

  const { data: antes } = await supabase
    .from("aportes")
    .select("*")
    .eq("id", aporteId)
    .single();

  if (!antes || antes.status !== "pendente") {
    return { erro: "Aporte não está mais pendente." };
  }

  const { error } = await supabase
    .from("aportes")
    .update({
      status: "confirmado",
      confirmado_por: userId,
      confirmado_em: new Date().toISOString(),
    })
    .eq("id", aporteId);

  if (error) {
    return { erro: `Erro ao confirmar aporte: ${error.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "confirmar_aporte",
    entidade: "aportes",
    entidadeId: aporteId,
    dadosAntes: { status: antes.status },
    dadosDepois: { status: "confirmado" },
  });

  revalidatePath("/admin/aportes");
  return { sucesso: true };
}

export async function rejeitarAporte(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase, userId } = await exigirPermissao("aportes.confirmar");

  const resultado = rejeitarAporteSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const { aporteId, motivo } = resultado.data;

  const { data: antes } = await supabase
    .from("aportes")
    .select("status")
    .eq("id", aporteId)
    .single();

  if (!antes || antes.status !== "pendente") {
    return { erro: "Aporte não está mais pendente." };
  }

  const { error } = await supabase
    .from("aportes")
    .update({ status: "rejeitado" })
    .eq("id", aporteId);

  if (error) {
    return { erro: `Erro ao rejeitar aporte: ${error.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "rejeitar_aporte",
    entidade: "aportes",
    entidadeId: aporteId,
    dadosAntes: { status: antes.status },
    dadosDepois: { status: "rejeitado", motivo },
  });

  revalidatePath("/admin/aportes");
  return { sucesso: true };
}

/**
 * Correção de erro em aporte confirmado (regra 3.2): NUNCA um UPDATE — sempre
 * um novo lançamento de estorno com valor negativo, referenciando o original.
 */
export async function estornarAporte(
  _estadoAnterior: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const { supabase, userId } = await exigirPermissao("aportes.confirmar");

  const resultado = estornarAporteSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const { aporteOriginalId, motivo } = resultado.data;

  const { data: original } = await supabase
    .from("aportes")
    .select("*")
    .eq("id", aporteOriginalId)
    .single();

  if (!original || original.status !== "confirmado") {
    return { erro: "Só é possível estornar um aporte confirmado." };
  }

  const { data: estorno, error } = await supabase
    .from("aportes")
    .insert({
      plano_id: original.plano_id,
      valor_centavos: -original.valor_centavos,
      tipo: "estorno",
      status: "confirmado",
      meio_pagamento: original.meio_pagamento,
      data_competencia: new Date().toISOString().slice(0, 10),
      estorno_de_id: original.id,
      confirmado_por: userId,
      confirmado_em: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !estorno) {
    return { erro: `Erro ao estornar: ${error?.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "estornar_aporte",
    entidade: "aportes",
    entidadeId: estorno.id,
    dadosAntes: { aporte_original_id: original.id, valor: original.valor_centavos },
    dadosDepois: { estorno_id: estorno.id, valor: -original.valor_centavos, motivo },
  });

  revalidatePath("/admin/aportes");
  return { sucesso: true };
}
