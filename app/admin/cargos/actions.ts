"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cargoSchema, vendedorSchema } from "@/lib/validacao/cargo";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrarAuditoria, paraJson } from "@/app/admin/_actions/auditoria";
import { exigirStaff } from "@/app/admin/_actions/autorizacao";

export type EstadoCargo = { erro?: string; sucesso?: boolean; cargoId?: string };

/** Só admin/operador (staff) pode gerenciar cargos — nunca um vendedor, mesmo com todas as permissões. */
export async function criarCargo(
  _estadoAnterior: EstadoCargo,
  formData: FormData,
): Promise<EstadoCargo> {
  const { supabase, userId } = await exigirStaff();

  const resultado = cargoSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const dados = resultado.data;

  const { data: cargo, error } = await supabase
    .from("cargos")
    .insert({
      nome: dados.nome,
      percentual_comissao: dados.percentualComissao,
      descricao: dados.descricao || null,
    })
    .select("id")
    .single();

  if (error || !cargo) {
    return { erro: `Erro ao criar cargo: ${error?.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "criar_cargo",
    entidade: "cargos",
    entidadeId: cargo.id,
    dadosDepois: paraJson(dados),
  });

  revalidatePath("/admin/cargos");
  return { sucesso: true, cargoId: cargo.id };
}

export type EstadoPermissoes = { erro?: string; sucesso?: boolean };

/**
 * Substitui o conjunto de permissões de um cargo pelo enviado (checkboxes
 * marcados). Simples de raciocinar: delete tudo + insere o que veio marcado.
 */
export async function atualizarPermissoesCargo(
  cargoId: string,
  _estadoAnterior: EstadoPermissoes,
  formData: FormData,
): Promise<EstadoPermissoes> {
  const { supabase, userId } = await exigirStaff();

  const permissoesMarcadas = formData.getAll("permissoes").map(String);

  const { data: antes } = await supabase
    .from("cargo_permissoes")
    .select("permissao_chave")
    .eq("cargo_id", cargoId);

  const { error: erroDelete } = await supabase
    .from("cargo_permissoes")
    .delete()
    .eq("cargo_id", cargoId);
  if (erroDelete) {
    return { erro: `Erro ao atualizar permissões: ${erroDelete.message}` };
  }

  if (permissoesMarcadas.length > 0) {
    const { error: erroInsert } = await supabase.from("cargo_permissoes").insert(
      permissoesMarcadas.map((chave) => ({
        cargo_id: cargoId,
        permissao_chave: chave,
      })),
    );
    if (erroInsert) {
      return { erro: `Erro ao atualizar permissões: ${erroInsert.message}` };
    }
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "atualizar_permissoes_cargo",
    entidade: "cargos",
    entidadeId: cargoId,
    dadosAntes: { permissoes: (antes ?? []).map((p) => p.permissao_chave) },
    dadosDepois: { permissoes: permissoesMarcadas },
  });

  revalidatePath(`/admin/cargos/${cargoId}`);
  return { sucesso: true };
}

export type EstadoVendedor = { erro?: string };

/** Cria um usuário no Auth com papel 'vendedor' e o vincula a um cargo. */
export async function criarVendedor(
  _estadoAnterior: EstadoVendedor,
  formData: FormData,
): Promise<EstadoVendedor> {
  const { supabase, userId } = await exigirStaff();

  const resultado = vendedorSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const dados = resultado.data;

  const admin = createAdminClient();
  const { data: novoUsuario, error: erroAuth } =
    await admin.auth.admin.createUser({
      email: dados.email,
      email_confirm: true,
      user_metadata: {
        nome_completo: dados.nomeCompleto,
        cpf: dados.cpf,
        telefone_e164: dados.telefoneE164,
        papel: "vendedor",
      },
    });

  if (erroAuth || !novoUsuario.user) {
    return { erro: `Erro ao criar usuário: ${erroAuth?.message}` };
  }

  const { error: erroCargo } = await supabase
    .from("profiles")
    .update({ cargo_id: dados.cargoId })
    .eq("id", novoUsuario.user.id);

  if (erroCargo) {
    return { erro: `Vendedor criado, mas erro ao vincular cargo: ${erroCargo.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "criar_vendedor",
    entidade: "profiles",
    entidadeId: novoUsuario.user.id,
    dadosDepois: paraJson(dados),
  });

  revalidatePath("/admin/vendedores");
  redirect("/admin/vendedores");
}
