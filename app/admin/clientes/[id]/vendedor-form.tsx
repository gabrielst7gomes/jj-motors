"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { atualizarVendedorPlano, type EstadoConfiguracoes } from "@/app/admin/configuracoes/actions";

const ESTADO_INICIAL: EstadoConfiguracoes = {};

type Vendedor = { id: string; nome_completo: string };

function BotaoSalvar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </Button>
  );
}

export function VendedorForm({
  planoId,
  vendedorAtualId,
  vendedores,
}: {
  planoId: string;
  vendedorAtualId: string | null;
  vendedores: Vendedor[];
}) {
  const [estado, formAction] = useActionState(
    atualizarVendedorPlano,
    ESTADO_INICIAL,
  );

  return (
    <form action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="planoId" value={planoId} />
      <div className="space-y-2">
        <Label htmlFor="vendedorId">Vendedor responsável</Label>
        <Select
          id="vendedorId"
          name="vendedorId"
          defaultValue={vendedorAtualId ?? ""}
          className="w-64"
        >
          <option value="">Nenhum</option>
          {vendedores.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nome_completo}
            </option>
          ))}
        </Select>
      </div>
      <BotaoSalvar />
      {estado.erro && <p className="txt-pequeno text-ambar">{estado.erro}</p>}
      {estado.sucesso && (
        <p className="txt-pequeno text-ciano">Salvo.</p>
      )}
    </form>
  );
}
