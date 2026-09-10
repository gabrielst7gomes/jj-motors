import { z } from "zod";

import { parseBRL } from "@/lib/money";

const centavosSchema = z.string().min(1).transform((valor, ctx) => {
  try {
    return parseBRL(valor);
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valor inválido" });
    return z.NEVER;
  }
});

/** Espelha profiles_cpf_formato e profiles_telefone_e164_formato do banco. */
export const clienteSchema = z.object({
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
});

export type ClienteInput = z.infer<typeof clienteSchema>;

export const planoSchema = z.object({
  clienteId: z.string().uuid(),
  percentualMinimo: z.coerce.number().min(0.01).max(1),
  aporteMensalPrevisto: centavosSchema,
  diaVencimento: z.coerce.number().int().min(1).max(28),
  veiculoAlvoId: z.string().uuid().optional().or(z.literal("")),
  vendedorId: z.string().uuid().optional().or(z.literal("")),
  observacoes: z.string().trim().optional().or(z.literal("")),
});

export type PlanoInput = z.infer<typeof planoSchema>;

/**
 * CRM de preferência de veículo — captura o desejo do cliente (marca/modelo/
 * ano + valor-meta) independente do estoque atual. Ver
 * supabase/migrations/20260101001600_preferencias_veiculo.sql.
 */
const valorMetaOpcionalSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((valor, ctx) => {
    if (!valor) return undefined;
    try {
      return parseBRL(valor);
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valor inválido" });
      return z.NEVER;
    }
  });

const anoOpcionalSchema = z.coerce
  .number()
  .int()
  .min(1990)
  .max(2100)
  .optional()
  .or(z.literal(""));

/**
 * Duas formas de registrar a preferência (decisão do usuário: "Catálogo +
 * opção 'outro' livre"):
 *   - catalogoModeloId preenchido → marca/modelo/anos vêm do catálogo (o RPC
 *     resolve; aqui marca/modelo podem vir vazios).
 *   - catalogoModeloId vazio → marca e modelo são obrigatórios (texto livre).
 */
export const preferenciaVeiculoSchema = z
  .object({
    catalogoModeloId: z.string().uuid().optional().or(z.literal("")),
    marca: z.string().trim().optional().or(z.literal("")),
    modelo: z.string().trim().optional().or(z.literal("")),
    anoMin: anoOpcionalSchema,
    anoMax: anoOpcionalSchema,
    valorMeta: valorMetaOpcionalSchema,
    observacoes: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((dados, ctx) => {
    if (!dados.catalogoModeloId) {
      if (!dados.marca) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe a marca",
          path: ["marca"],
        });
      }
      if (!dados.modelo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o modelo",
          path: ["modelo"],
        });
      }
    }
  });

export type PreferenciaVeiculoInput = z.infer<typeof preferenciaVeiculoSchema>;

/** Item do catálogo de modelos pré-fixados (gerenciado no /admin). */
export const catalogoModeloSchema = z
  .object({
    marca: z.string().trim().min(1, "Informe a marca"),
    modelo: z.string().trim().min(1, "Informe o modelo"),
    anoMin: anoOpcionalSchema,
    anoMax: anoOpcionalSchema,
    observacoes: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((dados, ctx) => {
    if (dados.anoMin && dados.anoMax && Number(dados.anoMin) > Number(dados.anoMax)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O ano inicial não pode ser maior que o final",
        path: ["anoMax"],
      });
    }
  });

export type CatalogoModeloInput = z.infer<typeof catalogoModeloSchema>;
