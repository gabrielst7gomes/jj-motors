import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input — superfície `--elevado`, um degrau acima do card que o contém
 * (design/IDENTIDADE.md V2.1). Cantos arredondados (--radius-sm), borda que
 * acende em azul-claro no foco.
 */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-sm border border-white/10 bg-elevado px-3 py-1 txt-corpo text-branco shadow-none outline-none transition-[border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-out-forte)] file:border-0 file:bg-transparent file:txt-pequeno file:font-medium placeholder:text-cinza-inativo focus-visible:border-azul-claro focus-visible:shadow-[0_0_0_3px_hsl(var(--azul-claro)/0.15)] disabled:cursor-not-allowed disabled:opacity-40",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
