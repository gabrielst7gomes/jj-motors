import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * Client Supabase com a chave `service_role` — IGNORA RLS.
 *
 * REGRAS DE USO:
 *  - Só pode ser importado em Route Handlers (app/api/**), cron jobs e scripts.
 *  - NUNCA importar em Client Components nem em Server Components de página.
 *  - O import de "server-only" acima faz o build falhar se isso for violado.
 *  - Toda escrita feita por aqui DEVE validar o input com Zod e recalcular
 *    dinheiro/elegibilidade no servidor antes de tocar no banco.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "createAdminClient: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.",
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
