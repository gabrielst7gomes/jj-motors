"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { criarCargo, type EstadoCargo } from "./actions";

const ESTADO_INICIAL: EstadoCargo = {};

function BotaoCriar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Criando..." : "Criar cargo"}
    </Button>
  );
}

export function NovoCargoForm() {
  const [estado, formAction] = useActionState(criarCargo, ESTADO_INICIAL);

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          action={formAction}
          className="grid grid-cols-1 items-end gap-4 sm:grid-cols-4"
        >
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do cargo</Label>
            <Input id="nome" name="nome" placeholder="Vendedor Júnior" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="percentualComissao">% de comissão</Label>
            <Input
              id="percentualComissao"
              name="percentualComissao"
              type="number"
              step="0.0001"
              min="0"
              max="1"
              placeholder="0.02"
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Input id="descricao" name="descricao" />
          </div>
          <div className="sm:col-span-4">
            <BotaoCriar />
          </div>
          {estado.erro && (
            <p role="alert" className="text-sm text-ambar sm:col-span-4">
              {estado.erro}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
