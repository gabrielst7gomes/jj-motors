"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

import { atualizarPermissoesCargo, type EstadoPermissoes } from "../actions";

const ESTADO_INICIAL: EstadoPermissoes = {};

function BotaoSalvar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar permissões"}
    </Button>
  );
}

export function PermissoesForm({
  cargoId,
  permissoes,
  permissoesAtivas,
}: {
  cargoId: string;
  permissoes: { chave: string; descricao: string }[];
  permissoesAtivas: Set<string>;
}) {
  const action = atualizarPermissoesCargo.bind(null, cargoId);
  const [estado, formAction] = useActionState(action, ESTADO_INICIAL);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-3">
        {permissoes.map((p) => (
          <label
            key={p.chave}
            className="flex items-start gap-3 rounded-md border p-3"
          >
            <input
              type="checkbox"
              name="permissoes"
              value={p.chave}
              defaultChecked={permissoesAtivas.has(p.chave)}
              className="mt-0.5 h-4 w-4"
            />
            <div>
              <p className="txt-pequeno font-semibold text-cinza-texto">{p.chave}</p>
              <p className="txt-micro text-cinza-texto">{p.descricao}</p>
            </div>
          </label>
        ))}
      </div>

      {estado.erro && <p className="text-sm text-ambar">{estado.erro}</p>}
      {estado.sucesso && <p className="text-sm text-azul-claro">Permissões salvas.</p>}

      <BotaoSalvar />
    </form>
  );
}
