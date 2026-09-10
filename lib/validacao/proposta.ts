import { z } from "zod";

/**
 * Schema de input da simulação de promissória feita pelo cliente na tela de
 * detalhe do veículo. O número de parcelas é a única escolha do usuário — o
 * preço e a entrada (saldo) são SEMPRE recalculados no servidor a partir do
 * banco, nunca aceitos do client (regra 7: nunca confiar em dinheiro vindo
 * do client).
 */
export const simulacaoSchema = z.object({
  veiculoId: z.string().uuid(),
  qtdParcelas: z.coerce
    .number()
    .int()
    .min(1, "Mínimo de 1 parcela")
    .max(60, "Máximo de 60 parcelas"),
});

export type SimulacaoInput = z.infer<typeof simulacaoSchema>;
