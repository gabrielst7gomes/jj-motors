import { z } from "zod";

/**
 * Schemas de validação de autenticação. Usados tanto no client (React Hook
 * Form) quanto revalidados na Server Action antes de tocar no Supabase Auth.
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Informe o e-mail" })
    .trim()
    .min(1, "Informe o e-mail")
    .email("E-mail inválido"),
  senha: z
    .string({ required_error: "Informe a senha" })
    .min(1, "Informe a senha"),
});

export type LoginInput = z.infer<typeof loginSchema>;
