"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Label de campo de formulário — no mundo "instrumentação de bordo" o rótulo
 * de campo é técnico: Chakra Petch, tracked, caixa alta (classe
 * `.rotulo-campo`). Isso NÃO é o kicker decorativo proibido (rótulo tracked
 * ACIMA de um título de página) — é o rótulo que nomeia um controle, que é
 * legítimo e combina com o painel.
 */
const labelVariants = cva(
  "rotulo-campo peer-disabled:cursor-not-allowed peer-disabled:opacity-40",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
