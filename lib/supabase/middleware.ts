import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/database.types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Atualiza a sessão do usuário a cada requisição e faz o roteamento por role.
 *
 * Nesta fase (1) apenas mantém a sessão viva e disponibiliza o padrão. A
 * proteção de rota e o redirect por role entram na Fase 3, onde este arquivo
 * será estendido para ler `profiles.role` e barrar acesso cruzado entre
 * `/app` (cliente) e `/admin` (staff).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: não colocar lógica entre createServerClient e getUser().
  await supabase.auth.getUser();

  return supabaseResponse;
}
