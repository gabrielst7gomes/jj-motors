"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  atualizarTaxaJurosPlano,
  type EstadoConfiguracoes,
} from "@/app/admin/configuracoes/actions";

const ESTADO_INICIAL: EstadoConfiguracoes = {};

function BotaoSalvar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </Button>
  );
}

export function TaxaJurosPlanoForm({
  planoId,
  taxaAtual,
  taxaGlobal,
}: {
  planoId: string;
  taxaAtual: number | null;
  taxaGlobal: number;
}) {
  const [estado, formAction] = useActionState(
    atualizarTaxaJurosPlano,
    ESTADO_INICIAL,
  );

  return (
    <form action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="planoId" value={planoId} />
      <div className="space-y-2">
        <Label htmlFor="taxaJurosMensal">Taxa mensal deste cliente</Label>
        <Input
          id="taxaJurosMensal"
          name="taxaJurosMensal"
          type="number"
          step="0.0001"
          min="0"
          max="1"
          defaultValue={taxaAtual ?? ""}
          placeholder={`vazio = usa a global (${(taxaGlobal * 100).toFixed(2)}%)`}
          className="w-64"
        />
      </div>
      <BotaoSalvar />
      {estado.erro && <p className="text-sm text-ambar">{estado.erro}</p>}
      {estado.sucesso && <p className="text-sm text-azul-claro">Salvo.</p>}
    </form>
  );
}
