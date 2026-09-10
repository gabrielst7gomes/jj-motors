import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

/**
 * Acesso a dados da área do cliente. Todas as funções aqui assumem que o
 * usuário já está autenticado (o middleware garante isso para /app/**) e
 * dependem inteiramente da RLS para limitar o que é lido — nenhuma delas
 * filtra por `cliente_id` manualmente, porque a política do banco já faz
 * isso (defesa em profundidade: mesmo um bug aqui não vazaria dado de
 * outro cliente).
 *
 * NORMALIZAÇÃO DE NULABILIDADE: `supabase gen types` marca toda coluna de
 * VIEW como nullable, porque a introspecção de views não carrega a
 * informação NOT NULL das tabelas de origem. As colunas abaixo são, na
 * prática, sempre não-nulas (a própria definição SQL da view usa
 * `coalesce`/`greatest` para garantir isso — ver
 * supabase/migrations/20260101000300_views.sql). Normalizamos aqui, uma
 * única vez, em vez de espalhar `?? 0` por cada página que consome a view.
 */

type VwSaldoCliente = Database["public"]["Views"]["vw_saldo_cliente"]["Row"];
type VwElegibilidade = Database["public"]["Views"]["vw_elegibilidade"]["Row"];
type VwVeiculosPublico =
  Database["public"]["Views"]["vw_veiculos_publico"]["Row"];

function normalizarSaldo(row: VwSaldoCliente) {
  return {
    ...row,
    plano_id: row.plano_id!,
    cliente_id: row.cliente_id!,
    plano_codigo: row.plano_codigo!,
    percentual_minimo: row.percentual_minimo!,
    saldo_confirmado_centavos: row.saldo_confirmado_centavos ?? 0,
    saldo_pendente_centavos: row.saldo_pendente_centavos ?? 0,
  };
}

function normalizarElegibilidade(row: VwElegibilidade) {
  return {
    ...row,
    plano_id: row.plano_id!,
    cliente_id: row.cliente_id!,
    veiculo_id: row.veiculo_id!,
    marca: row.marca!,
    modelo: row.modelo!,
    preco_venda_centavos: row.preco_venda_centavos!,
    saldo_confirmado_centavos: row.saldo_confirmado_centavos ?? 0,
    meta_centavos: row.meta_centavos!,
    elegivel: row.elegivel ?? false,
    valor_faltante_centavos: row.valor_faltante_centavos ?? 0,
  };
}

function normalizarVeiculoPublico(row: VwVeiculosPublico) {
  return {
    ...row,
    id: row.id!,
    marca: row.marca!,
    modelo: row.modelo!,
    ano_fabricacao: row.ano_fabricacao!,
    ano_modelo: row.ano_modelo!,
    km: row.km ?? 0,
    preco_venda_centavos: row.preco_venda_centavos!,
    status: row.status!,
    destaque: row.destaque ?? false,
  };
}

export async function getUsuarioAtual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getMeuProfile() {
  const supabase = await createClient();
  const usuario = await getUsuarioAtual();
  if (!usuario) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", usuario.id)
    .single();
  return data;
}

/** O plano ativo mais antigo do cliente (mesma regra usada em criar_reserva). */
export async function getMeuPlanoAtivo() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("planos")
    .select("*")
    .eq("status", "ativo")
    .order("data_adesao", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getMeusPlanos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("planos")
    .select("*")
    .order("data_adesao", { ascending: false });
  return data ?? [];
}

export async function getMeuSaldo(planoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vw_saldo_cliente")
    .select("*")
    .eq("plano_id", planoId)
    .maybeSingle();
  return data ? normalizarSaldo(data) : null;
}

/** Cruzamento estoque × saldo para o plano informado (view vw_elegibilidade). */
export async function getMinhaElegibilidade(planoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vw_elegibilidade")
    .select("*")
    .eq("plano_id", planoId)
    .order("preco_venda_centavos", { ascending: true });
  return (data ?? []).map(normalizarElegibilidade);
}

export async function getEstoquePublico() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vw_veiculos_publico")
    .select("*")
    .order("preco_venda_centavos", { ascending: true });
  return (data ?? []).map(normalizarVeiculoPublico);
}

export async function getVeiculoPublicoPorId(veiculoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vw_veiculos_publico")
    .select("*")
    .eq("id", veiculoId)
    .maybeSingle();
  return data ? normalizarVeiculoPublico(data) : null;
}

export async function getFotosVeiculo(veiculoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("veiculo_fotos")
    .select("*")
    .eq("veiculo_id", veiculoId)
    .order("ordem", { ascending: true });
  return data ?? [];
}

/** Mapa veiculo_id -> url da foto de capa, para os N ids informados. */
export async function getCapasVeiculos(
  veiculoIds: string[],
): Promise<Map<string, string>> {
  if (veiculoIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase
    .from("veiculo_fotos")
    .select("veiculo_id, url")
    .in("veiculo_id", veiculoIds)
    .eq("capa", true);
  return new Map((data ?? []).map((f) => [f.veiculo_id, f.url]));
}

export async function getMeuExtrato(planoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("aportes")
    .select("*")
    .eq("plano_id", planoId)
    .order("criado_em", { ascending: false });
  return data ?? [];
}

/** Preferências de veículo (CRM) ativas do plano informado. */
export async function getMinhasPreferenciasVeiculo(planoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("preferencias_veiculo")
    .select("*")
    .eq("plano_id", planoId)
    .eq("ativa", true)
    .order("criado_em", { ascending: true });
  return data ?? [];
}

/** Catálogo de modelos pré-fixados que o cliente pode escolher (só ativos). */
export async function getCatalogoModelosAtivos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("catalogo_modelos")
    .select("id, marca, modelo, ano_min, ano_max")
    .eq("ativo", true)
    .order("marca", { ascending: true })
    .order("modelo", { ascending: true });
  return data ?? [];
}

/** Negociações abertas pelo cliente (RLS já limita às dele). */
export async function getMinhasNegociacoes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("negociacoes")
    .select("*, veiculos(marca, modelo, versao, preco_venda_centavos, status)")
    .order("criado_em", { ascending: false });
  return data ?? [];
}
