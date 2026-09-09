import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Client Supabase para Server Components, Route Handlers e Server Actions.
 * Usa a chave anônima + cookies da sessão do usuário. Respeita RLS.
 *
 * NÃO usar para operações privilegiadas — para isso, ver `lib/supabase/admin.ts`.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` chamado de um Server Component — pode ser ignorado quando
            // há um middleware atualizando a sessão nas requisições.
          }
        },
      },
    },
  );
}
