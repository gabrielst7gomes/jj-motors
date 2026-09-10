"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { reenviarNotificacao } from "./actions";

export function ReenviarButton({ notificacaoId }: { notificacaoId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="contorno"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await reenviarNotificacao(notificacaoId);
        })
      }
    >
      {pending ? "..." : "Reenviar"}
    </Button>
  );
}
