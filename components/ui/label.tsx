"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Label — sentence case sempre, nunca all-caps espaçado (design/IDENTIDADE.md
 * seção 8: proibido explicitamente "label all-caps espaçado acima de cada
 * título" — inclui labels de formulário, que é onde o hábito mais se esconde).
 */
const labelVariants = cva(
  "txt-pequeno font-medium text-cinza-texto peer-disabled:cursor-not-allowed peer-disabled:opacity-40",
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
