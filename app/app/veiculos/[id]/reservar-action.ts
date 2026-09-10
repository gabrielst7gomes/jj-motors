"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const entradaSchema = z.object({
  veiculoId: z.string().uuid(),
});

export type ResultadoReserva =
  | { ok: true; reservaId: string }
  | { ok: false; erro: string };

/**
 * Chama a RPC transacional `criar_reserva` (lock + revalida elegibilidade no
 * servidor — nunca confiamos no client). Ver supabase/migrations/
 * 20260101000700_rpc_reserva.sql.
 */
export async function reservarVeiculoAction(
  input: unknown,
): Promise<ResultadoReserva> {
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

  const { data, error } = await supabase.rpc("criar_reserva", {
    p_veiculo_id: parsed.data.veiculoId,
  });

  if (error) {
    return { ok: false, erro: mensagemAmigavel(error.message) };
  }

  revalidatePath("/app");
  revalidatePath("/app/elegiveis");
  revalidatePath("/app/estoque");
  revalidatePath(`/app/veiculos/${parsed.data.veiculoId}`);

  return { ok: true, reservaId: data.id };
}

function mensagemAmigavel(mensagemOriginal: string): string {
  if (mensagemOriginal.includes("não está disponível")) {
    return "Este veículo acabou de ser reservado por outro cliente.";
  }
  if (mensagemOriginal.includes("Saldo insuficiente")) {
    return "Seu saldo não é mais suficiente para este veículo.";
  }
  if (mensagemOriginal.includes("sem plano ativo")) {
    return "Você não tem um plano ativo no momento.";
  }
  return "Não foi possível reservar este veículo. Tente novamente.";
}
