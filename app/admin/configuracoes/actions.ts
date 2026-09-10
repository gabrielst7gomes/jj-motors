"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { taxaJurosGlobalSchema, taxaJurosPlanoSchema } from "@/lib/validacao/configuracoes";
import { TAXA_JUROS_MENSAL_PADRAO_CHAVE } from "@/lib/dados/taxa-juros";
import { registrarAuditoria } from "@/app/admin/_actions/auditoria";
import { exigirPermissao, exigirStaff } from "@/app/admin/_actions/autorizacao";

export type EstadoConfiguracoes = { erro?: string; sucesso?: boolean };

/** Define a taxa de juros mensal GLOBAL (usada por todo plano sem taxa própria). */
export async function atualizarTaxaJurosGlobal(
  _estadoAnterior: EstadoConfiguracoes,
  formData: FormData,
): Promise<EstadoConfiguracoes> {
  const { supabase, userId } = await exigirPermissao("juros.editar");

  const resultado = taxaJurosGlobalSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Valor inválido" };
  }

  const { data: antes } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", TAXA_JUROS_MENSAL_PADRAO_CHAVE)
    .maybeSingle();

  const { error } = await supabase
    .from("configuracoes")
    .update({
      valor: String(resultado.data.taxaJurosMensal),
      atualizado_em: new Date().toISOString(),
    })
    .eq("chave", TAXA_JUROS_MENSAL_PADRAO_CHAVE);

  if (error) {
    return { erro: `Erro ao salvar: ${error.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "atualizar_taxa_juros_global",
    entidade: "configuracoes",
    entidadeId: TAXA_JUROS_MENSAL_PADRAO_CHAVE,
    dadosAntes: { valor: antes?.valor },
    dadosDepois: { valor: String(resultado.data.taxaJurosMensal) },
  });

  revalidatePath("/admin/configuracoes");
  return { sucesso: true };
}

/**
 * Define (ou remove) a taxa de juros PRÓPRIA de um plano/cliente. String
 * vazia grava NULL, ou seja, o plano volta a usar a taxa global.
 */
export async function atualizarTaxaJurosPlano(
  _estadoAnterior: EstadoConfiguracoes,
  formData: FormData,
): Promise<EstadoConfiguracoes> {
  const { supabase, userId } = await exigirPermissao("juros.editar");

  const resultado = taxaJurosPlanoSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Valor inválido" };
  }
  const { planoId, taxaJurosMensal } = resultado.data;

  const { data: antes } = await supabase
    .from("planos")
    .select("taxa_juros_mensal")
    .eq("id", planoId)
    .single();

  if (!antes) {
    return { erro: "Plano não encontrado" };
  }

  const { error } = await supabase
    .from("planos")
    .update({ taxa_juros_mensal: taxaJurosMensal })
    .eq("id", planoId);

  if (error) {
    return { erro: `Erro ao salvar: ${error.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "atualizar_taxa_juros_plano",
    entidade: "planos",
    entidadeId: planoId,
    dadosAntes: { taxa_juros_mensal: antes.taxa_juros_mensal },
    dadosDepois: { taxa_juros_mensal: taxaJurosMensal },
  });

  revalidatePath(`/admin/clientes/${planoId}`);
  return { sucesso: true };
}

const vendedorPlanoSchema = z.object({
  planoId: z.string().uuid(),
  vendedorId: z.string().uuid().optional().or(z.literal("")),
});

/** Vincula (ou desvincula) o vendedor responsável por um plano. */
export async function atualizarVendedorPlano(
  _estadoAnterior: EstadoConfiguracoes,
  formData: FormData,
): Promise<EstadoConfiguracoes> {
  const { supabase, userId } = await exigirStaff();

  const resultado = vendedorPlanoSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: "Dados inválidos" };
  }
  const { planoId, vendedorId } = resultado.data;

  const { data: antes } = await supabase
    .from("planos")
    .select("vendedor_id")
    .eq("id", planoId)
    .single();

  if (!antes) {
    return { erro: "Plano não encontrado" };
  }

  const { error } = await supabase
    .from("planos")
    .update({ vendedor_id: vendedorId || null })
    .eq("id", planoId);

  if (error) {
    return { erro: `Erro ao salvar: ${error.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "atualizar_vendedor_plano",
    entidade: "planos",
    entidadeId: planoId,
    dadosAntes: { vendedor_id: antes.vendedor_id },
    dadosDepois: { vendedor_id: vendedorId || null },
  });

  revalidatePath(`/admin/clientes/${planoId}`);
  return { sucesso: true };
}
