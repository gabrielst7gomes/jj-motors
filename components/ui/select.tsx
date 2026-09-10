import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Select nativo no vocabulário do sistema — mesmo poço de instrumento do
 * Input (fundo `--recuo`, moldura 1px, canto técnico, foco ciano). Seta
 * customizada em ciano via background SVG para não herdar o chevron do SO.
 */
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          "poco flex h-11 w-full appearance-none rounded-sm bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-3 pr-9 txt-corpo text-branco outline-none transition-[border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-out-ui)] focus-visible:border-ciano/70 focus-visible:shadow-[0_0_0_3px_hsl(var(--ciano)/0.14)] disabled:cursor-not-allowed disabled:opacity-40",
          className,
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234DD8FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        ref={ref}
        {...props}
      />
    );
  },
);
Select.displayName = "Select";

export { Select };
