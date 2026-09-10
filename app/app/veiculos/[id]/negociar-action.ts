"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const entradaSchema = z.object({
  veiculoId: z.string().uuid(),
  mensagem: z.string().trim().max(500).optional().or(z.literal("")),
});

export type ResultadoNegociacao =
  | { ok: true; negociacaoId: string }
  | { ok: false; erro: string };

/**
 * Cliente abre negociação de um veículo — pedido do usuário: "ao invés de
 * aparecer para reservar, coloque 'abrir negociação'". Chama a RPC
 * `abrir_negociacao` (SECURITY DEFINER, sem trava de veículo e sem exigir os
 * 50%). Idempotente: se já houver negociação viva, devolve ela.
 * Ver supabase/migrations/20260101001800_negociacoes.sql.
 */
export async function abrirNegociacaoAction(
  input: unknown,
): Promise<ResultadoNegociacao> {
  const parsed = entradaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, erro: "Dados inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, erro: "Não autenticado" };
  }

  const { data, error } = await supabase.rpc("abrir_negociacao", {
    p_veiculo_id: parsed.data.veiculoId,
    p_mensagem: parsed.data.mensagem || undefined,
  });

  if (error) {
    return { ok: false, erro: mensagemAmigavel(error.message) };
  }

  revalidatePath("/app");
  revalidatePath("/app/negociacoes");
  revalidatePath(`/app/veiculos/${parsed.data.veiculoId}`);

  return { ok: true, negociacaoId: data.id };
}

function mensagemAmigavel(mensagemOriginal: string): string {
  if (mensagemOriginal.includes("já foi vendido")) {
    return "Este veículo já foi vendido.";
  }
  if (mensagemOriginal.includes("sem plano ativo")) {
    return "Você não tem um plano ativo no momento.";
  }
  return "Não foi possível abrir a negociação. Tente novamente.";
}
