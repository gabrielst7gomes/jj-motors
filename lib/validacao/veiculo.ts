import { z } from "zod";

import { parseBRL } from "@/lib/money";

/**
 * Aceita tanto uma string formatada ("R$ 45.000,00") quanto um número puro de
 * centavos vindo de um <input type="hidden">. Sempre resolve para bigint —
 * este é o único ponto de conversão de dinheiro vindo do formulário.
 */
const centavosSchema = z
  .string()
  .min(1, "Informe o valor")
  .transform((valor, ctx) => {
    try {
      return parseBRL(valor);
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valor inválido" });
      return z.NEVER;
    }
  });

export const veiculoSchema = z
  .object({
    marca: z.string().trim().min(1, "Informe a marca"),
    modelo: z.string().trim().min(1, "Informe o modelo"),
    versao: z.string().trim().optional().or(z.literal("")),
    anoFabricacao: z.coerce.number().int().min(1950).max(2100),
    anoModelo: z.coerce.number().int().min(1950).max(2101),
    km: z.coerce.number().int().min(0),
    cor: z.string().trim().optional().or(z.literal("")),
    combustivel: z.string().trim().optional().or(z.literal("")),
    cambio: z.string().trim().optional().or(z.literal("")),
    placa: z.string().trim().min(1, "Informe a placa"),
    chassi: z.string().trim().optional().or(z.literal("")),
    renavam: z.string().trim().optional().or(z.literal("")),
    precoVenda: centavosSchema,
    precoCusto: centavosSchema.optional().or(z.literal("")),
    status: z.enum(["disponivel", "reservado", "vendido", "inativo"]),
    destaque: z.coerce.boolean().optional().default(false),
  })
  // Espelha a constraint veiculos_anos_plausiveis do banco (ver
  // supabase/migrations/20260101000100_tabelas.sql) — validamos aqui só para
  // dar um erro de formulário legível; o banco continua sendo a garantia real.
  .refine((v) => v.anoModelo >= v.anoFabricacao && v.anoModelo <= v.anoFabricacao + 1, {
    message: "Ano do modelo deve ser igual ou até 1 ano após o de fabricação",
    path: ["anoModelo"],
  });

export type VeiculoInput = z.infer<typeof veiculoSchema>;

export const alterarPrecoSchema = z.object({
  veiculoId: z.string().uuid(),
  novoPreco: centavosSchema,
});
