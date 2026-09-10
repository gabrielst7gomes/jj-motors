import { z } from "zod";

import { parseBRL } from "@/lib/money";

export const lancarAporteSchema = z.object({
  planoId: z.string().uuid(),
  valor: z
    .string()
    .min(1, "Informe o valor")
    .transform((valor, ctx) => {
      try {
        const centavos = parseBRL(valor);
        if (centavos <= 0n) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "O valor do aporte deve ser positivo",
          });
          return z.NEVER;
        }
        return centavos;
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valor inválido" });
        return z.NEVER;
      }
    }),
  meioPagamento: z.enum(["pix", "dinheiro", "ted", "cartao", "outro"]),
  dataCompetencia: z.string().min(1, "Informe a data de competência"),
  comprovanteUrl: z.string().url().optional().or(z.literal("")),
});

export const confirmarAporteSchema = z.object({
  aporteId: z.string().uuid(),
});

export const rejeitarAporteSchema = z.object({
  aporteId: z.string().uuid(),
  motivo: z.string().trim().min(1, "Informe o motivo da rejeição").optional(),
});

export const estornarAporteSchema = z.object({
  aporteOriginalId: z.string().uuid(),
  motivo: z.string().trim().min(1, "Informe o motivo do estorno"),
});
