import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/database.types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const ROTAS_PUBLICAS = ["/", "/login"];

/**
 * Atualiza a sessão do usuário a cada requisição e aplica o roteamento por
 * papel (regra da Fase 3):
 *   - Sem sessão tentando acessar /app ou /admin -> /login
 *   - Cliente tentando acessar /admin -> /app (acesso cruzado negado)
 *   - Staff (admin/operador) ou vendedor tentando acessar /app -> /admin
 *   - Autenticado acessando /login -> /pos-login (que decide o destino certo)
 *
 * 'vendedor' acessa /admin como staff (visão restrita pelas permissões do seu
 * cargo, aplicada tela a tela e via RLS — não no middleware, que só decide
 * qual ÁREA o papel acessa).
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const ehRotaCliente = pathname === "/app" || pathname.startsWith("/app/");
  const ehRotaAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!user) {
    if (ehRotaCliente || ehRotaAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Autenticado. Resolve o papel só quando a rota depende disso, para não
  // pagar uma consulta extra em toda requisição pública.
  if (ehRotaCliente || ehRotaAdmin || pathname === "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("papel")
      .eq("id", user.id)
      .single();

    const acessaAdmin =
      profile?.papel === "admin" ||
      profile?.papel === "operador" ||
      profile?.papel === "vendedor";

    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/pos-login";
      return NextResponse.redirect(url);
    }

    if (ehRotaAdmin && !acessaAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/app";
      return NextResponse.redirect(url);
    }

    if (ehRotaCliente && acessaAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

// Mantido exportado para uso em testes/documentação de quais rotas são públicas.
export { ROTAS_PUBLICAS };
