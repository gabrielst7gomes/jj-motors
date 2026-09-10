"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clienteSchema, planoSchema } from "@/lib/validacao/plano";
import { createAdminClient } from "@/lib/supabase/admin";
import { registrarAuditoria } from "@/app/admin/_actions/auditoria";
import { exigirPermissao } from "@/app/admin/_actions/autorizacao";

export type EstadoNovoCliente = { erro?: string };

/**
 * Cria o usuário no Auth (Admin API, requer service_role) e, em seguida, o
 * plano de compra programada. O trigger `handle_new_user` já materializa o
 * `profile` a partir de `raw_user_meta_data` — não inserimos em `profiles`
 * diretamente aqui.
 *
 * Senha temporária: o cliente novo entra sem senha definida (o fluxo de
 * "esqueci minha senha" do Supabase Auth é o caminho para ele definir a
 * própria senha — fora do escopo desta fase implementar o e-mail de convite
 * customizado; o Studio/Admin API já dispara o e-mail padrão do GoTrue).
 */
export async function criarClienteComPlano(
  _estadoAnterior: EstadoNovoCliente,
  formData: FormData,
): Promise<EstadoNovoCliente> {
  const { supabase, userId } = await exigirPermissao("clientes.criar");

  const dadosCliente = clienteSchema.safeParse({
    nomeCompleto: formData.get("nomeCompleto"),
    cpf: formData.get("cpf"),
    telefoneE164: formData.get("telefoneE164"),
    email: formData.get("email"),
  });
  if (!dadosCliente.success) {
    return { erro: dadosCliente.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const dadosPlano = planoSchema.safeParse({
    clienteId: "00000000-0000-0000-0000-000000000000", // placeholder, preenchido após criar o usuário
    percentualMinimo: formData.get("percentualMinimo") || "0.5",
    veiculoAlvoId: formData.get("veiculoAlvoId") ?? "",
    vendedorId: formData.get("vendedorId") ?? "",
    observacoes: formData.get("observacoes") ?? "",
  });
  if (!dadosPlano.success) {
    return { erro: dadosPlano.error.issues[0]?.message ?? "Dados do plano inválidos" };
  }

  const admin = createAdminClient();
  const { data: novoUsuario, error: erroAuth } =
    await admin.auth.admin.createUser({
      email: dadosCliente.data.email,
      email_confirm: true,
      user_metadata: {
        nome_completo: dadosCliente.data.nomeCompleto,
        cpf: dadosCliente.data.cpf,
        telefone_e164: dadosCliente.data.telefoneE164,
        papel: "cliente",
      },
    });

  if (erroAuth || !novoUsuario.user) {
    return { erro: `Erro ao criar usuário: ${erroAuth?.message}` };
  }

  const { data: plano, error: erroPlano } = await supabase
    .from("planos")
    .insert({
      cliente_id: novoUsuario.user.id,
      // codigo é gerado pelo trigger planos_gerar_codigo quando vazio (ver
      // supabase/migrations/20260101000100_tabelas.sql). O tipo gerado marca
      // a coluna como obrigatória porque a introspecção não enxerga defaults
      // vindos de trigger.
      codigo: "",
      percentual_minimo: dadosPlano.data.percentualMinimo,
      veiculo_alvo_id: dadosPlano.data.veiculoAlvoId || null,
      vendedor_id: dadosPlano.data.vendedorId || null,
      observacoes: dadosPlano.data.observacoes || null,
    })
    .select("id")
    .single();

  if (erroPlano || !plano) {
    // Usuário do Auth já foi criado; não desfazemos automaticamente para não
    // mascarar o erro — o operador pode reaproveitar o usuário criando o
    // plano manualmente, ou remover o usuário pelo Studio.
    return { erro: `Cliente criado, mas erro ao criar plano: ${erroPlano?.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "criar_cliente_com_plano",
    entidade: "planos",
    entidadeId: plano.id,
    // Json não aceita bigint — serializamos com o valor já em centavos (number).
    dadosDepois: {
      cliente_id: novoUsuario.user.id,
      percentualMinimo: dadosPlano.data.percentualMinimo,
      veiculoAlvoId: dadosPlano.data.veiculoAlvoId || null,
      observacoes: dadosPlano.data.observacoes || null,
    },
  });

  revalidatePath("/admin/clientes");
  redirect(`/admin/clientes/${plano.id}`);
}
