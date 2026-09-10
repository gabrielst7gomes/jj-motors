import { z } from "zod";

export const taxaJurosGlobalSchema = z.object({
  taxaJurosMensal: z.coerce.number().min(0).max(1),
});

export const taxaJurosPlanoSchema = z.object({
  planoId: z.string().uuid(),
  // string vazia = "usar taxa global" (grava null)
  taxaJurosMensal: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0 && v <= 1), {
      message: "Taxa deve estar entre 0 e 1 (ex.: 0.02 = 2%)",
    }),
});
