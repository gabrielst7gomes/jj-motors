import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge de status — forma + cor, nunca só cor (daltônicos). Cada variant
 * renderiza um indicador geométrico antes do texto. Rótulo em Chakra Petch
 * tracked, canto técnico (--radius-xs), sem preenchimento chapado — é uma
 * legenda de instrumento, não um selo.
 *
 * variant -> significado (não usar fora deste papel):
 *   elegivel    vermelho, círculo cheio + glow  — elegível / liberado
 *   progresso   ciano, círculo vazado           — em progresso / a financiar
 *   pendente    âmbar, triângulo                — pendente / aguardando
 *   confirmado  ciano, quadrado                 — confirmado / concluído
 *   falha       âmbar, X                        — rejeitado / falha (nunca vinho)
 *   neutro      cinza, sem indicador            — informativo sem veredito
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-xs border px-2 py-[3px] font-mostrador text-[0.625rem] font-semibold uppercase tracking-[0.1em]",
  {
    variants: {
      variant: {
        elegivel: "border-vermelho/50 bg-vermelho/10 text-branco",
        progresso: "border-ciano/30 bg-transparent text-ciano",
        pendente: "border-ambar/30 bg-transparent text-ambar",
        confirmado: "border-ciano/30 bg-transparent text-ciano",
        falha: "border-ambar/30 bg-transparent text-ambar",
        neutro: "border-white/12 bg-transparent text-cinza-texto",
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
    <span
      className="h-1.5 w-1.5 shrink-0 rounded-full bg-vermelho shadow-[0_0_6px_0_hsl(var(--vermelho)/0.8)]"
      aria-hidden
    />
  ),
  progresso: (
    <span
      className="h-1.5 w-1.5 shrink-0 rounded-full border border-ciano"
      aria-hidden
    />
  ),
  pendente: (
    <span
      className="h-0 w-0 shrink-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-ambar"
      aria-hidden
    />
  ),
  confirmado: <span className="h-1.5 w-1.5 shrink-0 bg-ciano" aria-hidden />,
  falha: (
    <span className="text-[0.625rem] leading-none text-ambar" aria-hidden>
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
