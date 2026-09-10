"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  alternarAtivoModeloCatalogo,
  criarModeloCatalogo,
  editarModeloCatalogo,
  type EstadoCatalogo,
} from "./actions";

const ESTADO_INICIAL: EstadoCatalogo = {};

type ModeloCatalogo = {
  id: string;
  marca: string;
  modelo: string;
  ano_min: number | null;
  ano_max: number | null;
  observacoes: string | null;
};

function BotaoSalvar({ novo }: { novo: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending
        ? "Salvando..."
        : novo
          ? "Adicionar ao catálogo"
          : "Salvar alterações"}
    </Button>
  );
}

/**
 * Formulário de item do catálogo — cria (sem `modelo`) ou edita (com
 * `modelo`). Layout de coluna única no celular, campos lado a lado no
 * desktop (o admin é o uso de PC).
 */
export function ModeloCatalogoForm({
  modelo,
  onConcluido,
}: {
  modelo?: ModeloCatalogo;
  onConcluido?: () => void;
}) {
  const novo = !modelo;
  const acao = novo
    ? criarModeloCatalogo
    : editarModeloCatalogo.bind(null, modelo.id);
  const [estado, formAction] = useActionState(acao, ESTADO_INICIAL);

  useEffect(() => {
    if (estado.sucesso) onConcluido?.();
  }, [estado.sucesso, onConcluido]);

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="space-y-2">
        <Label htmlFor={`marca-${modelo?.id ?? "novo"}`}>Marca</Label>
        <Input
          id={`marca-${modelo?.id ?? "novo"}`}
          name="marca"
          required
          defaultValue={modelo?.marca}
          placeholder="Ex.: Hyundai"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`modelo-${modelo?.id ?? "novo"}`}>Modelo</Label>
        <Input
          id={`modelo-${modelo?.id ?? "novo"}`}
          name="modelo"
          required
          defaultValue={modelo?.modelo}
          placeholder="Ex.: Creta"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-2">
        <div className="space-y-2">
          <Label htmlFor={`anoMin-${modelo?.id ?? "novo"}`}>Ano (de)</Label>
          <Input
            id={`anoMin-${modelo?.id ?? "novo"}`}
            name="anoMin"
            type="number"
            min={1990}
            max={2100}
            defaultValue={modelo?.ano_min ?? ""}
            placeholder="Opcional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`anoMax-${modelo?.id ?? "novo"}`}>Ano (até)</Label>
          <Input
            id={`anoMax-${modelo?.id ?? "novo"}`}
            name="anoMax"
            type="number"
            min={1990}
            max={2100}
            defaultValue={modelo?.ano_max ?? ""}
            placeholder="Opcional"
          />
        </div>
      </div>
      <div className="space-y-2 sm:col-span-2 lg:col-span-4">
        <Label htmlFor={`observacoes-${modelo?.id ?? "novo"}`}>
          Observações (opcional)
        </Label>
        <Input
          id={`observacoes-${modelo?.id ?? "novo"}`}
          name="observacoes"
          defaultValue={modelo?.observacoes ?? ""}
        />
      </div>

      {estado.erro && (
        <p
          role="alert"
          className="txt-pequeno text-ambar sm:col-span-2 lg:col-span-4"
        >
          {estado.erro}
        </p>
      )}

      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
        <BotaoSalvar novo={novo} />
        {onConcluido && (
          <button
            type="button"
            onClick={onConcluido}
            className="txt-pequeno text-cinza-texto hover:text-branco"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

/** Linha da tabela de catálogo, com edição inline e toggle ativo/inativo. */
export function LinhaCatalogo({
  modelo,
  preferenciasVinculadas,
}: {
  modelo: ModeloCatalogo & { ativo: boolean };
  preferenciasVinculadas: number;
}) {
  const [editando, setEditando] = useState(false);
  const [estadoToggle, toggleAction] = useActionState(
    alternarAtivoModeloCatalogo,
    ESTADO_INICIAL,
  );

  const faixa =
    modelo.ano_min || modelo.ano_max
      ? [modelo.ano_min, modelo.ano_max].filter(Boolean).join(" – ")
      : "Qualquer ano";

  if (editando) {
    return (
      <div className="border-b border-white/10 bg-elevado/40 p-4">
        <ModeloCatalogoForm
          modelo={modelo}
          onConcluido={() => setEditando(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="txt-corpo font-semibold">
          {modelo.marca} {modelo.modelo}
          {!modelo.ativo && (
            <span className="ml-2 txt-micro font-semibold text-cinza-inativo">
              inativo
            </span>
          )}
        </p>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          {faixa}
          {preferenciasVinculadas > 0 &&
            ` · ${preferenciasVinculadas} cliente${preferenciasVinculadas > 1 ? "s" : ""} aguardando`}
        </p>
        {modelo.observacoes && (
          <p className="mt-1 txt-pequeno text-cinza-inativo">
            {modelo.observacoes}
          </p>
        )}
        {estadoToggle.erro && (
          <p className="mt-1 txt-pequeno text-ambar">{estadoToggle.erro}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="txt-pequeno font-semibold text-azul-claro hover:underline"
        >
          Editar
        </button>
        <form action={toggleAction}>
          <input type="hidden" name="modeloId" value={modelo.id} />
          <input
            type="hidden"
            name="ativar"
            value={modelo.ativo ? "false" : "true"}
          />
          <button
            type="submit"
            className="txt-pequeno text-cinza-texto hover:text-branco"
          >
            {modelo.ativo ? "Desativar" : "Reativar"}
          </button>
        </form>
      </div>
    </div>
  );
}
