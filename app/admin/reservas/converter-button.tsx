"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { converterReservaEmVenda } from "./actions";

export function ConverterButton({ reservaId }: { reservaId: string }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setErro(null);
            const resultado = await converterReservaEmVenda(reservaId);
            if (!resultado.sucesso) {
              setErro(resultado.erro ?? "Erro ao converter");
            }
          })
        }
      >
        {pending ? "..." : "Marcar como vendido"}
      </Button>
      {erro && <p className="txt-pequeno text-ambar">{erro}</p>}
    </div>
  );
}
