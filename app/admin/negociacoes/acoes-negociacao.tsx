"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

import {
  atualizarStatusNegociacao,
  converterNegociacaoEmVenda,
} from "./actions";

type Status = "nova" | "em_andamento" | "fechada" | "perdida";

const OPCOES: { valor: Exclude<Status, "fechada">; label: string }[] = [
  { valor: "nova", label: "Aguardando" },
  { valor: "em_andamento", label: "Em andamento" },
  { valor: "perdida", label: "Encerrada" },
];

/**
 * Ações da linha de negociação: mudar status (dropdown, salva no onChange) e
 * "marcar como vendido" (só quando ainda não fechada, gera comissão).
 * Botão de WhatsApp fica na própria célula da tabela (é só um link).
 */
export function AcoesNegociacao({
  negociacaoId,
  status,
}: {
  negociacaoId: string;
  status: Status;
}) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  if (status === "fechada") {
    return <span className="txt-pequeno font-semibold text-vermelho">Vendido</span>;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Select
        value={status}
        disabled={pending}
        className="h-9 w-40"
        onChange={(e) => {
          const novo = e.target.value as Exclude<Status, "fechada">;
          setErro(null);
          startTransition(async () => {
            const r = await atualizarStatusNegociacao(negociacaoId, novo);
            if (r.erro) setErro(r.erro);
          });
        }}
      >
        {OPCOES.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.label}
          </option>
        ))}
      </Select>

      <Button
        type="button"
        size="sm"
        variant="contorno"
        disabled={pending}
        onClick={() => {
          if (
            !window.confirm(
              "Marcar como vendido? O veículo sai do estoque, as outras negociações dele são encerradas e a comissão do vendedor é gerada.",
            )
          )
            return;
          setErro(null);
          startTransition(async () => {
            const r = await converterNegociacaoEmVenda(negociacaoId);
            if (r.erro) setErro(r.erro);
          });
        }}
      >
        Marcar como vendido
      </Button>

      {erro && <p className="txt-micro text-ambar">{erro}</p>}
    </div>
  );
}
