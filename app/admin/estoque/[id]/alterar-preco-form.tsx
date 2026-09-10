"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { alterarPreco, type EstadoAlterarPreco } from "../actions";

const ESTADO_INICIAL: EstadoAlterarPreco = {};

function BotaoAlterar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Salvando..." : "Alterar preço"}
    </Button>
  );
}

export function AlterarPrecoForm({ veiculoId }: { veiculoId: string }) {
  const [estado, formAction] = useActionState(alterarPreco, ESTADO_INICIAL);

  return (
    <form action={formAction} className="flex items-end gap-2">
      <input type="hidden" name="veiculoId" value={veiculoId} />
      <div className="space-y-2">
        <Label htmlFor="novoPreco">Novo preço de venda</Label>
        <Input id="novoPreco" name="novoPreco" placeholder="45.000,00" required />
      </div>
      <BotaoAlterar />
      {estado.erro && <p className="text-sm text-ambar">{estado.erro}</p>}
      {estado.sucesso && (
        <p className="text-sm text-ciano">
          Preço alterado. Se reduzido, clientes elegíveis são notificados.
        </p>
      )}
    </form>
  );
}
