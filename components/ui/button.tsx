import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Botão — mundo "instrumentação de bordo". Quatro papéis fixos:
 *
 *   primario     gradiente vermelho + glow curto — a ÚNICA ação primária
 *   contorno     moldura translúcida — ação secundária
 *   destrutivo   contorno vinho + confirmação no call site — nunca preenchido
 *   fantasma     sem moldura, texto cinza — ação terciária
 *
 * Rótulo em Chakra Petch, levemente tracked (fica "de painel"). Canto técnico
 * (--radius-sm 4px). Feedback de pressão: scale(0.97) em :active, curva
 * ease-out-ui, <180ms.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-mostrador text-[0.8125rem] font-semibold uppercase tracking-[0.06em] outline-none transition-[background-color,border-color,color,transform,box-shadow,filter] duration-150 [transition-timing-function:var(--ease-out-ui)] focus-visible:ring-2 focus-visible:ring-ciano focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primario:
          "gradiente-vermelho text-branco shadow-[var(--glow-vermelho)] hover:brightness-110",
        contorno:
          "border border-white/15 bg-white/[0.02] text-branco hover:border-white/30 hover:bg-white/[0.05]",
        destrutivo:
          "border border-vinho-contorno/70 bg-transparent text-branco hover:border-vinho-contorno hover:bg-vinho-contorno/12",
        fantasma: "bg-transparent text-cinza-texto hover:text-branco",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-[0.6875rem]",
        lg: "h-12 px-8 text-[0.875rem]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primario",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
