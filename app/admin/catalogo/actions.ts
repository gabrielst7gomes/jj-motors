"use server";

import { revalidatePath } from "next/cache";

import { catalogoModeloSchema } from "@/lib/validacao/plano";
import { registrarAuditoria, paraJson } from "@/app/admin/_actions/auditoria";
import { exigirPermissao } from "@/app/admin/_actions/autorizacao";

export type EstadoCatalogo = { erro?: string; sucesso?: boolean };

function anoOuNull(valor: number | "" | undefined): number | null {
  return valor ? Number(valor) : null;
}

/** Gerenciar o catálogo exige a permissão de estoque (é dado de estoque). */
export async function criarModeloCatalogo(
  _estadoAnterior: EstadoCatalogo,
  formData: FormData,
): Promise<EstadoCatalogo> {
  const { supabase, userId } = await exigirPermissao("estoque.editar");

  const resultado = catalogoModeloSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const dados = resultado.data;

  const { data: modelo, error } = await supabase
    .from("catalogo_modelos")
    .insert({
      marca: dados.marca,
      modelo: dados.modelo,
      ano_min: anoOuNull(dados.anoMin),
      ano_max: anoOuNull(dados.anoMax),
      observacoes: dados.observacoes || null,
    })
    .select("id")
    .single();

  if (error || !modelo) {
    if (error?.code === "23505") {
      return { erro: "Já existe um item igual no catálogo." };
    }
    return { erro: `Erro ao adicionar ao catálogo: ${error?.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "criar_modelo_catalogo",
    entidade: "catalogo_modelos",
    entidadeId: modelo.id,
    dadosDepois: paraJson(dados),
  });

  revalidatePath("/admin/catalogo");
  return { sucesso: true };
}

export async function editarModeloCatalogo(
  modeloId: string,
  _estadoAnterior: EstadoCatalogo,
  formData: FormData,
): Promise<EstadoCatalogo> {
  const { supabase, userId } = await exigirPermissao("estoque.editar");

  const resultado = catalogoModeloSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const dados = resultado.data;

  const { data: antes } = await supabase
    .from("catalogo_modelos")
    .select("*")
    .eq("id", modeloId)
    .single();

  const { error } = await supabase
    .from("catalogo_modelos")
    .update({
      marca: dados.marca,
      modelo: dados.modelo,
      ano_min: anoOuNull(dados.anoMin),
      ano_max: anoOuNull(dados.anoMax),
      observacoes: dados.observacoes || null,
    })
    .eq("id", modeloId);

  if (error) {
    if (error.code === "23505") {
      return { erro: "Já existe um item igual no catálogo." };
    }
    return { erro: `Erro ao salvar: ${error.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "editar_modelo_catalogo",
    entidade: "catalogo_modelos",
    entidadeId: modeloId,
    dadosAntes: paraJson(antes ?? {}),
    dadosDepois: paraJson(dados),
  });

  revalidatePath("/admin/catalogo");
  return { sucesso: true };
}

/** Ativa/desativa um item. Desativar não apaga preferências ligadas (FK SET NULL só no delete). */
export async function alternarAtivoModeloCatalogo(
  _estadoAnterior: EstadoCatalogo,
  formData: FormData,
): Promise<EstadoCatalogo> {
  const { supabase, userId } = await exigirPermissao("estoque.editar");

  const modeloId = String(formData.get("modeloId") ?? "");
  const ativar = formData.get("ativar") === "true";
  if (!modeloId) return { erro: "Item inválido" };

  const { error } = await supabase
    .from("catalogo_modelos")
    .update({ ativo: ativar })
    .eq("id", modeloId);

  if (error) {
    return { erro: `Erro ao atualizar: ${error.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: ativar ? "ativar_modelo_catalogo" : "desativar_modelo_catalogo",
    entidade: "catalogo_modelos",
    entidadeId: modeloId,
  });

  revalidatePath("/admin/catalogo");
  return { sucesso: true };
}
