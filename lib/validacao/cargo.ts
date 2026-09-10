import { z } from "zod";

export const cargoSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome do cargo"),
  percentualComissao: z.coerce.number().min(0).max(1),
  descricao: z.string().trim().optional().or(z.literal("")),
});

export type CargoInput = z.infer<typeof cargoSchema>;

export const vendedorSchema = z.object({
  nomeCompleto: z.string().trim().min(1, "Informe o nome completo"),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => /^\d{11}$/.test(v), "CPF deve ter 11 dígitos"),
  telefoneE164: z
    .string()
    .trim()
    .regex(/^\+\d{10,15}$/, "Telefone deve estar em E.164, ex.: +5562999999999"),
  email: z.string().trim().email("E-mail inválido"),
  cargoId: z.string().uuid("Selecione um cargo"),
});

export type VendedorInput = z.infer<typeof vendedorSchema>;
