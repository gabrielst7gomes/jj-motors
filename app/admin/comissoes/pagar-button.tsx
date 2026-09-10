"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { marcarComissaoPaga } from "./actions";

export function PagarButton({ comissaoId }: { comissaoId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="contorno"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await marcarComissaoPaga(comissaoId);
        })
      }
    >
      {pending ? "..." : "Marcar como paga"}
    </Button>
  );
}
