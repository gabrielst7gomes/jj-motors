"use server";

import { revalidatePath } from "next/cache";

import { veiculoSchema, alterarPrecoSchema } from "@/lib/validacao/veiculo";
import { registrarAuditoria, paraJson } from "@/app/admin/_actions/auditoria";
import { exigirPermissao } from "@/app/admin/_actions/autorizacao";

export type EstadoFormularioVeiculo = {
  erro?: string;
  sucesso?: boolean;
  veiculoId?: string;
};

/**
 * Cria um veículo. Ao salvar com status 'disponivel', o trigger de banco
 * `veiculos_notif_insert` já enfileira as notificações — não fazemos isso
 * aqui (Fase 6). O que a tela mostra como "prévia de X clientes notificados"
 * é calculado separadamente (ver getPreviaNotificacao) sem gravar nada.
 */
export async function criarVeiculo(
  _estadoAnterior: EstadoFormularioVeiculo,
  formData: FormData,
): Promise<EstadoFormularioVeiculo> {
  const { supabase, userId } = await exigirPermissao("estoque.editar");

  const resultado = veiculoSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const dados = resultado.data;

  const { data: veiculo, error } = await supabase
    .from("veiculos")
    .insert({
      marca: dados.marca,
      modelo: dados.modelo,
      versao: dados.versao || null,
      ano_fabricacao: dados.anoFabricacao,
      ano_modelo: dados.anoModelo,
      km: dados.km,
      cor: dados.cor || null,
      combustivel: dados.combustivel || null,
      cambio: dados.cambio || null,
      placa: dados.placa,
      chassi: dados.chassi || null,
      renavam: dados.renavam || null,
      preco_venda_centavos: Number(dados.precoVenda),
      preco_custo_centavos: dados.precoCusto ? Number(dados.precoCusto) : null,
      status: dados.status,
      destaque: dados.destaque,
      publicado_em: dados.status === "disponivel" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !veiculo) {
    return { erro: `Erro ao salvar veículo: ${error?.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "criar_veiculo",
    entidade: "veiculos",
    entidadeId: veiculo.id,
    dadosDepois: paraJson(dados),
  });

  revalidatePath("/admin/estoque");
  return { sucesso: true, veiculoId: veiculo.id };
}

export async function atualizarVeiculo(
  veiculoId: string,
  _estadoAnterior: EstadoFormularioVeiculo,
  formData: FormData,
): Promise<EstadoFormularioVeiculo> {
  const { supabase, userId } = await exigirPermissao("estoque.editar");

  const resultado = veiculoSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const dados = resultado.data;

  const { data: antes } = await supabase
    .from("veiculos")
    .select("*")
    .eq("id", veiculoId)
    .single();

  if (!antes) {
    return { erro: "Veículo não encontrado" };
  }

  // Preço é alterado por uma ação dedicada (alterarPreco) para que o
  // histórico (veiculo_precos_historico) e a notificação de "preço reduzido"
  // fiquem associados a uma intenção explícita, não a uma edição genérica.
  const { error } = await supabase
    .from("veiculos")
    .update({
      marca: dados.marca,
      modelo: dados.modelo,
      versao: dados.versao || null,
      ano_fabricacao: dados.anoFabricacao,
      ano_modelo: dados.anoModelo,
      km: dados.km,
      cor: dados.cor || null,
      combustivel: dados.combustivel || null,
      cambio: dados.cambio || null,
      placa: dados.placa,
      chassi: dados.chassi || null,
      renavam: dados.renavam || null,
      preco_custo_centavos: dados.precoCusto ? Number(dados.precoCusto) : null,
      status: dados.status,
      destaque: dados.destaque,
      publicado_em:
        dados.status === "disponivel" && !antes.publicado_em
          ? new Date().toISOString()
          : antes.publicado_em,
    })
    .eq("id", veiculoId);

  if (error) {
    return { erro: `Erro ao atualizar veículo: ${error.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "atualizar_veiculo",
    entidade: "veiculos",
    entidadeId: veiculoId,
    dadosAntes: paraJson(antes),
    dadosDepois: paraJson(dados),
  });

  revalidatePath("/admin/estoque");
  revalidatePath(`/admin/estoque/${veiculoId}`);
  return { sucesso: true, veiculoId };
}

export type EstadoAlterarPreco = { erro?: string; sucesso?: boolean };

/**
 * Ação dedicada para alterar o preço de venda. O trigger de banco
 * `veiculos_historico_preco` grava veiculo_precos_historico automaticamente;
 * se o preço CAIU e o veículo está disponível, `veiculos_notif_update`
 * enfileira a notificação de 'preco_reduzido' (Fase 6).
 */
export async function alterarPreco(
  _estadoAnterior: EstadoAlterarPreco,
  formData: FormData,
): Promise<EstadoAlterarPreco> {
  const { supabase, userId } = await exigirPermissao("estoque.editar");

  const resultado = alterarPrecoSchema.safeParse(Object.fromEntries(formData));
  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const { veiculoId, novoPreco } = resultado.data;

  const { data: antes } = await supabase
    .from("veiculos")
    .select("preco_venda_centavos")
    .eq("id", veiculoId)
    .single();

  if (!antes) {
    return { erro: "Veículo não encontrado" };
  }

  const { error } = await supabase
    .from("veiculos")
    .update({ preco_venda_centavos: Number(novoPreco) })
    .eq("id", veiculoId);

  if (error) {
    return { erro: `Erro ao alterar preço: ${error.message}` };
  }

  await registrarAuditoria(supabase, {
    usuarioId: userId,
    acao: "alterar_preco",
    entidade: "veiculos",
    entidadeId: veiculoId,
    dadosAntes: { preco_venda_centavos: antes.preco_venda_centavos },
    dadosDepois: { preco_venda_centavos: Number(novoPreco) },
  });

  revalidatePath("/admin/estoque");
  revalidatePath(`/admin/estoque/${veiculoId}`);
  return { sucesso: true };
}

// A venda (antigo "marcar como vendido") parte de uma NEGOCIAÇÃO — é a RPC
// converter_negociacao_em_venda, chamada em app/admin/negociacoes/actions.ts.
// É a negociação que sabe qual plano/cliente comprou e, por tabela, qual
// vendedor recebe a comissão.

/**
 * Prévia de "X clientes serão notificados" mostrada no formulário ANTES de
 * salvar (pedida na Fase 4). Reaproveita a mesma regra de elegibilidade — não
 * grava nada, não substitui o enfileiramento real que o trigger faz.
 */
export async function getPreviaNotificacao(
  precoVendaCentavos: bigint,
): Promise<number> {
  const { supabase } = await exigirPermissao("estoque.editar");

  const [{ data: planos }, { data: saldos }] = await Promise.all([
    supabase.from("planos").select("id, percentual_minimo").eq("status", "ativo"),
    supabase.from("vw_saldo_cliente").select("plano_id, saldo_confirmado_centavos"),
  ]);

  if (!planos) return 0;

  const saldoPorPlano = new Map(
    (saldos ?? []).map((s) => [s.plano_id, s.saldo_confirmado_centavos ?? 0]),
  );

  let elegiveis = 0;
  for (const plano of planos) {
    const saldo = saldoPorPlano.get(plano.id) ?? 0;
    const meta = Math.round(Number(precoVendaCentavos) * plano.percentual_minimo);
    if (saldo >= meta) elegiveis++;
  }
  return elegiveis;
}
