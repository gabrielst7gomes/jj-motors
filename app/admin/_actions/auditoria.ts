import "server-only";

import { headers } from "next/headers";

import type { Database, Json } from "@/lib/database.types";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * `Json` (o tipo aceito por dados_antes/dados_depois) não inclui `bigint`.
 * Dinheiro no domínio é sempre bigint (regra 3.1); para auditoria — um
 * registro informativo, não a fonte da verdade do valor — convertemos para
 * number antes de gravar. Aplica-se recursivamente para não obrigar cada
 * Server Action a serializar objetos aninhados na mão.
 */
export function paraJson(valor: unknown): Json {
  if (typeof valor === "bigint") return Number(valor);
  if (valor === undefined) return null;
  if (valor === null || typeof valor !== "object") return valor as Json;
  if (Array.isArray(valor)) return valor.map(paraJson);
  return Object.fromEntries(
    Object.entries(valor as Record<string, unknown>).map(([k, v]) => [
      k,
      paraJson(v),
    ]),
  );
}

/**
 * Grava uma linha em audit_log (regra 3.6). Chamada por toda Server Action
 * que executa uma ação sensível: confirmar aporte, estornar, alterar preço,
 * criar reserva, marcar como vendido.
 *
 * Recebe o client de SESSÃO (não o admin/service_role) para que `usuario_id`
 * seja resolvido corretamente e para respeitar a mesma RLS que os outros
 * dados — a policy `audit_log_staff_le` permite a leitura, e a escrita aqui é
 * feita pelo próprio staff autenticado (RLS permite: `*_staff_tudo`).
 */
export async function registrarAuditoria(
  supabase: SupabaseServerClient,
  entrada: {
    usuarioId: string;
    acao: string;
    entidade: string;
    entidadeId: string;
    dadosAntes?: Json | null;
    dadosDepois?: Json | null;
  },
) {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    null;

  const insert: Database["public"]["Tables"]["audit_log"]["Insert"] = {
    usuario_id: entrada.usuarioId,
    acao: entrada.acao,
    entidade: entrada.entidade,
    entidade_id: entrada.entidadeId,
    dados_antes: entrada.dadosAntes ?? null,
    dados_depois: entrada.dadosDepois ?? null,
    ip,
  };

  const { error } = await supabase.from("audit_log").insert(insert);
  if (error) {
    // Auditoria nunca deve derrubar a operação principal, mas o erro precisa
    // ficar visível nos logs do servidor para investigação.
    console.error("Falha ao registrar audit_log:", error);
  }
}
