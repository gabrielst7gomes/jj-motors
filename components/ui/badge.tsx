import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge de status — design/IDENTIDADE.md seção 7: forma + cor, nunca só cor
 * (pensado para daltônicos). Cada variant renderiza um indicador geométrico
 * fixo antes do texto (círculo cheio, círculo vazado, triângulo, quadrado,
 * X) — a cor sozinha nunca carrega o significado.
 *
 * Mapeamento de variant -> significado (não usar fora deste papel):
 *   elegivel    vermelho, círculo cheio       — elegível / liberado
 *   progresso   azul-claro, círculo vazado    — em progresso / a financiar
 *   pendente    âmbar, triângulo              — pendente / aguardando
 *   confirmado  azul-claro, quadrado          — confirmado / concluído
 *   falha       âmbar, X                      — rejeitado / falha (nunca vinho — vinho é só ação destrutiva)
 *   neutro      cinza-texto, sem indicador    — informativo sem veredito (ex.: "inativo")
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 border px-2 py-0.5 txt-micro font-medium",
  {
    variants: {
      variant: {
        elegivel: "border-vermelho/50 bg-vermelho-fundo text-branco",
        progresso: "border-azul-claro/30 bg-transparent text-azul-claro",
        pendente: "border-ambar/30 bg-transparent text-ambar",
        confirmado: "border-azul-claro/30 bg-transparent text-azul-claro",
        falha: "border-ambar/30 bg-transparent text-ambar",
        neutro: "border-white/10 bg-transparent text-cinza-texto",
      },
    },
    defaultVariants: {
      variant: "neutro",
    },
  },
);

const INDICADOR: Record<
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>,
  React.ReactNode
> = {
  elegivel: (
    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-vermelho" aria-hidden />
  ),
  progresso: (
    <span
      className="h-1.5 w-1.5 shrink-0 rounded-full border border-azul-claro"
      aria-hidden
    />
  ),
  pendente: (
    <span
      className="h-0 w-0 shrink-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-ambar"
      aria-hidden
    />
  ),
  confirmado: (
    <span className="h-1.5 w-1.5 shrink-0 bg-azul-claro" aria-hidden />
  ),
  falha: (
    <span className="txt-micro leading-none text-ambar" aria-hidden>
      ✕
    </span>
  ),
  neutro: null,
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  const v = variant ?? "neutro";
  return (
    <div className={cn(badgeVariants({ variant: v }), className)} {...props}>
      {INDICADOR[v]}
      {props.children}
    </div>
  );
}

export { Badge, badgeVariants };
