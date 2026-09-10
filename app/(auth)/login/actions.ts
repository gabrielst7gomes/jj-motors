"use server";

import { redirect } from "next/navigation";

import { loginSchema } from "@/lib/validacao/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoLogin = {
  erro?: string;
};

/**
 * Server Action de login. Valida com Zod ANTES de tocar no Supabase (regra de
 * convenção 7: nunca confiar em input do client sem revalidar no servidor).
 * O redirect por papel é resolvido pelo middleware na próxima navegação.
 */
export async function entrar(
  _estadoAnterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const resultado = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!resultado.success) {
    return { erro: resultado.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: resultado.data.email,
    password: resultado.data.senha,
  });

  if (error) {
    return { erro: "E-mail ou senha incorretos." };
  }

  redirect("/pos-login");
}

/** Server Action de logout, usada pelo botão "Sair" nas duas áreas. */
export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
