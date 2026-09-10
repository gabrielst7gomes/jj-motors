import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Acesso a dados do painel admin. O client usado aqui é o client de sessão
 * (anon key + cookies), NÃO o service_role — a política `*_staff_tudo` de RLS
 * já dá acesso total a quem é admin/operador autenticado. `service_role` fica
 * reservado para: (a) Admin API do Auth (criar/editar usuários) e (b) uploads
 * de Storage feitos em nome do operador (ver lib/supabase/admin.ts).
 */

export async function getDashboardAdmin() {
  const supabase = await createClient();
  const primeiroDiaDoMes = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .slice(0, 10);

  const [
    { data: saldoTotal },
    { count: clientesAtivos },
    { count: veiculosParados },
    { data: aportesDoMes },
  ] = await Promise.all([
    supabase.from("vw_saldo_cliente").select("saldo_confirmado_centavos"),
    supabase
      .from("planos")
      .select("id", { count: "exact", head: true })
      .eq("status", "ativo"),
    supabase
      .from("veiculos")
      .select("id", { count: "exact", head: true })
      .eq("status", "disponivel"),
    supabase
      .from("aportes")
      .select("valor_centavos")
      .eq("status", "confirmado")
      .gte("data_competencia", primeiroDiaDoMes),
  ]);

  // Colunas de VIEW vêm tipadas como nullable pelo gerador (limite conhecido
  // da introspecção sobre views — ver nota em lib/dados/cliente.ts), mas
  // saldo_confirmado_centavos nunca é nulo de fato (a view usa coalesce/sum).
  const totalEmCaixa = (saldoTotal ?? []).reduce(
    (acc, row) => acc + BigInt(row.saldo_confirmado_centavos ?? 0),
    0n,
  );
  const totalAportesMes = (aportesDoMes ?? []).reduce(
    (acc, row) => acc + BigInt(row.valor_centavos),
    0n,
  );

  return {
    totalEmCaixaCentavos: totalEmCaixa,
    totalAportesMesCentavos: totalAportesMes,
    clientesAtivos: clientesAtivos ?? 0,
    veiculosParados: veiculosParados ?? 0,
  };
}

export async function getClientesComPlanos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("planos")
    .select("*, profiles!planos_cliente_id_fkey(nome_completo, cpf, telefone_e164)")
    .order("data_adesao", { ascending: false });
  return data ?? [];
}

export async function getPlanoPorId(planoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("planos")
    .select("*, profiles!planos_cliente_id_fkey(nome_completo, cpf, telefone_e164)")
    .eq("id", planoId)
    .maybeSingle();
  return data;
}

export async function getSaldoPlano(planoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vw_saldo_cliente")
    .select("*")
    .eq("plano_id", planoId)
    .maybeSingle();
  return data;
}

export async function getElegibilidadePlano(planoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vw_elegibilidade")
    .select("*")
    .eq("plano_id", planoId)
    .order("preco_venda_centavos", { ascending: true });
  return data ?? [];
}

export async function getExtratoPlano(planoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("aportes")
    .select("*")
    .eq("plano_id", planoId)
    .order("criado_em", { ascending: false });
  return data ?? [];
}

export async function getAportesPendentes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("aportes")
    .select("*, planos(codigo, cliente_id, profiles!planos_cliente_id_fkey(nome_completo))")
    .eq("status", "pendente")
    .order("criado_em", { ascending: true });
  return data ?? [];
}

export async function getTodosVeiculos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veiculos")
    .select("*")
    .order("criado_em", { ascending: false });
  return data ?? [];
}

export async function getVeiculoPorId(veiculoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veiculos")
    .select("*")
    .eq("id", veiculoId)
    .maybeSingle();
  return data;
}

export async function getFotosVeiculoAdmin(veiculoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veiculo_fotos")
    .select("*")
    .eq("veiculo_id", veiculoId)
    .order("ordem", { ascending: true });
  return data ?? [];
}

export async function getReservas() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reservas")
    .select(
      "*, planos(codigo, cliente_id, profiles!planos_cliente_id_fkey(nome_completo)), veiculos(marca, modelo, preco_venda_centavos)",
    )
    .order("criado_em", { ascending: false });
  return data ?? [];
}

export async function getNotificacoes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notificacoes")
    .select(
      "*, profiles!notificacoes_cliente_id_fkey(nome_completo), veiculos(marca, modelo)",
    )
    .order("criado_em", { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function getAuditLog() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("*, profiles!audit_log_usuario_id_fkey(nome_completo)")
    .order("criado_em", { ascending: false })
    .limit(200);
  return data ?? [];
}

// -----------------------------------------------------------------------------
// Cargos, permissões, vendedores e comissões
// -----------------------------------------------------------------------------

export async function getCargos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cargos")
    .select("*")
    .order("nome", { ascending: true });
  return data ?? [];
}

export async function getCargoPorId(cargoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cargos")
    .select("*")
    .eq("id", cargoId)
    .maybeSingle();
  return data;
}

export async function getCatalogoPermissoes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("permissoes")
    .select("*")
    .order("chave", { ascending: true });
  return data ?? [];
}

export async function getPermissoesDoCargo(cargoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cargo_permissoes")
    .select("permissao_chave")
    .eq("cargo_id", cargoId);
  return new Set((data ?? []).map((p) => p.permissao_chave));
}

export async function getVendedores() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*, cargos(nome, percentual_comissao)")
    .eq("papel", "vendedor")
    .order("nome_completo", { ascending: true });
  return data ?? [];
}

export async function getComissoes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comissoes")
    .select(
      "*, profiles!comissoes_vendedor_id_fkey(nome_completo), veiculos(marca, modelo), planos(codigo)",
    )
    .order("criado_em", { ascending: false });
  return data ?? [];
}

/**
 * Catálogo de modelos pré-fixados. Inclui itens inativos para o admin (a
 * policy staff_tudo dá acesso a tudo; a policy de leitura pública só filtra
 * ativo=true para não-staff).
 */
export async function getCatalogoModelos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("catalogo_modelos")
    .select("*, preferencias_veiculo(count)")
    .order("marca", { ascending: true })
    .order("modelo", { ascending: true });
  return data ?? [];
}
