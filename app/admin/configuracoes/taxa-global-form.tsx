"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { atualizarTaxaJurosGlobal, type EstadoConfiguracoes } from "./actions";

const ESTADO_INICIAL: EstadoConfiguracoes = {};

function BotaoSalvar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar taxa global"}
    </Button>
  );
}

export function TaxaGlobalForm({ taxaAtual }: { taxaAtual: number }) {
  const [estado, formAction] = useActionState(
    atualizarTaxaJurosGlobal,
    ESTADO_INICIAL,
  );

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="taxaJurosMensal">Taxa de juros mensal (fração)</Label>
        <Input
          id="taxaJurosMensal"
          name="taxaJurosMensal"
          type="number"
          step="0.0001"
          min="0"
          max="1"
          defaultValue={taxaAtual}
          className="w-40"
        />
        <p className="txt-micro text-cinza-texto">
          Ex.: 0.02 = 2% ao mês. Aplicada a todo plano sem taxa própria.
        </p>
      </div>
      <BotaoSalvar />
      {estado.erro && <p className="text-sm text-ambar">{estado.erro}</p>}
      {estado.sucesso && <p className="text-sm text-azul-claro">Salvo.</p>}
    </form>
  );
}
