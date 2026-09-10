import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Botão — design/IDENTIDADE.md V2. Quatro variantes, cada uma com um papel
 * fixo — nunca usar fora dele (seção 2, "ação destrutiva nunca é preenchida"):
 *
 *   primario     gradiente vermelho + sombra colorida — a ÚNICA ação primária
 *   contorno     borda branca translúcida — ação secundária
 *   destrutivo   contorno vinho-contorno + ícone de alerta — nunca preenchido
 *   fantasma     sem borda, texto cinza-texto — ação terciária/discreta
 *
 * Cantos arredondados (--radius-sm), V2.2. Feedback de pressão:
 * scale(0.97) em :active, só a propriedade `transform` transicionando (nunca
 * `transition: all`). Toda transição fica sob 200ms com uma curva ease-out
 * reforçada — o CSS `ease` nativo é fraco demais para passar sensação de
 * resposta imediata.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm txt-corpo font-semibold outline-none transition-[background-color,border-color,color,transform,box-shadow] duration-150 [transition-timing-function:var(--ease-out-forte)] focus-visible:ring-2 focus-visible:ring-azul-claro focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primario:
          "gradiente-vermelho text-branco shadow-vermelho hover:brightness-110",
        contorno:
          "border border-white/15 bg-white/[0.03] text-branco hover:border-white/30 hover:bg-white/[0.06]",
        destrutivo:
          "border-2 border-vinho-contorno bg-transparent text-branco hover:bg-vinho-contorno/10",
        fantasma: "bg-transparent text-cinza-texto hover:text-branco",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 txt-pequeno",
        lg: "h-12 px-8",
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
