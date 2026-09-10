"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

import { confirmarAporte, rejeitarAporte, type EstadoFormulario } from "./actions";

const ESTADO_INICIAL: EstadoFormulario = {};

function BotaoAcao({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "primario" | "destrutivo";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant={variant} disabled={pending}>
      {variant === "destrutivo" && (
        <span aria-hidden className="text-ambar">
          ⚠
        </span>
      )}
      {pending ? "..." : children}
    </Button>
  );
}

export function AcoesAporte({ aporteId }: { aporteId: string }) {
  const [estadoConfirmar, actionConfirmar] = useActionState(
    confirmarAporte,
    ESTADO_INICIAL,
  );
  const [estadoRejeitar, actionRejeitar] = useActionState(
    rejeitarAporte,
    ESTADO_INICIAL,
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-2">
        <form action={actionConfirmar}>
          <input type="hidden" name="aporteId" value={aporteId} />
          <BotaoAcao variant="primario">Confirmar</BotaoAcao>
        </form>
        <form
          action={actionRejeitar}
          onSubmit={(e) => {
            if (!window.confirm("Rejeitar este aporte? A ação não pode ser desfeita.")) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="aporteId" value={aporteId} />
          <BotaoAcao variant="destrutivo">Rejeitar</BotaoAcao>
        </form>
      </div>
      {(estadoConfirmar.erro || estadoRejeitar.erro) && (
        <p className="txt-pequeno text-ambar">
          {estadoConfirmar.erro || estadoRejeitar.erro}
        </p>
      )}
    </div>
  );
}
