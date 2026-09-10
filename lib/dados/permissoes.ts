import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * Permissões efetivas do usuário staff atual: admin/operador têm TODAS
 * (retorna null, convencionado como "sem restrição" — ver uso em
 * getLinksPermitidos); vendedor tem só as do próprio cargo.
 */
export async function getMinhasPermissoes(
  supabase: SupabaseClient<Database>,
): Promise<Set<string> | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data: profile } = await supabase
    .from("profiles")
    .select("papel, cargo_id")
    .eq("id", user.id)
    .single();

  if (profile?.papel === "admin" || profile?.papel === "operador") {
    return null; // null = irrestrito
  }

  if (profile?.papel !== "vendedor" || !profile.cargo_id) {
    return new Set();
  }

  const { data } = await supabase
    .from("cargo_permissoes")
    .select("permissao_chave")
    .eq("cargo_id", profile.cargo_id);

  return new Set((data ?? []).map((p) => p.permissao_chave));
}

export function temPermissao(
  permissoes: Set<string> | null,
  chave: string,
): boolean {
  return permissoes === null || permissoes.has(chave);
}
