import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Toda Server Action do admin chama isto (ou exigirPermissao) ANTES de
 * qualquer escrita. A RLS já bloqueia clientes no banco, mas esta checagem dá
 * um erro explícito cedo e evita depender só da RLS para autorização de
 * Server Actions (defesa em profundidade — regra de convenção 7: nunca
 * confiar em input do client).
 *
 * Use exigirStaff() para ações exclusivas de admin/operador (gerenciar
 * cargos, criar vendedores — nada disso é delegável por permissão de cargo).
 * Use exigirPermissao(chave) para ações que um vendedor com a permissão
 * certa também pode fazer (editar estoque, confirmar aporte, etc.).
 */
export async function exigirStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("papel")
    .eq("id", user.id)
    .single();

  if (profile?.papel !== "admin" && profile?.papel !== "operador") {
    throw new Error("Acesso negado: ação restrita à equipe da JJ Motors.");
  }

  return { supabase, userId: user.id };
}

/**
 * Exige que o usuário seja staff (admin/operador, sempre autorizado) OU
 * vendedor com a permissão `chave` no seu cargo. Espelha a função SQL
 * `tem_permissao()` usada nas policies de RLS — mantidas em sincronia.
 */
export async function exigirPermissao(chave: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado.");
  }

  const { data: autorizado, error } = await supabase.rpc("tem_permissao", {
    p_permissao: chave,
  });

  if (error || !autorizado) {
    throw new Error(`Acesso negado: falta a permissão "${chave}".`);
  }

  return { supabase, userId: user.id };
}
