import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input — poço de instrumento: fundo `--recuo` (afunda, não eleva), moldura
 * de 1px, canto técnico. A moldura acende em ciano no foco, com um anel curto.
 */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "poco flex h-11 w-full rounded-sm px-3 py-1 txt-corpo text-branco outline-none transition-[border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-out-ui)] file:border-0 file:bg-transparent file:txt-pequeno file:font-medium placeholder:text-cinza-inativo focus-visible:border-ciano/70 focus-visible:shadow-[0_0_0_3px_hsl(var(--ciano)/0.14)] disabled:cursor-not-allowed disabled:opacity-40",
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
