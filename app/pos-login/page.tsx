import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Rota técnica de transição pós-login: lê o papel do usuário autenticado e
 * redireciona para a área correta. Existe como página (Server Component) em
 * vez de fazer o redirect dentro da Server Action de login porque a Server
 * Action já dispara `redirect()` para cá, e este é o lugar canônico onde
 * papel -> destino é decidido — o mesmo destino que o middleware aplica em
 * navegações subsequentes.
 */
export default async function PosLoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("papel")
    .eq("id", user.id)
    .single();

  if (
    profile?.papel === "admin" ||
    profile?.papel === "operador" ||
    profile?.papel === "vendedor"
  ) {
    redirect("/admin");
  }

  redirect("/app");
}
