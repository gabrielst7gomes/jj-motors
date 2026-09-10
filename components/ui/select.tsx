import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Select nativo estilizado no vocabulário do sistema — mesma superfície
 * `--elevado` do Input (design/IDENTIDADE.md V2.1), cantos arredondados.
 */
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-11 w-full rounded-sm border border-white/10 bg-elevado px-3 txt-corpo text-branco outline-none transition-[border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-out-forte)] focus-visible:border-azul-claro focus-visible:shadow-[0_0_0_3px_hsl(var(--azul-claro)/0.15)] disabled:cursor-not-allowed disabled:opacity-40",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Select.displayName = "Select";

export { Select };
