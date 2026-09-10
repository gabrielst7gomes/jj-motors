"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import {
  criarVeiculo,
  atualizarVeiculo,
  getPreviaNotificacao,
  type EstadoFormularioVeiculo,
} from "./actions";

const ESTADO_INICIAL: EstadoFormularioVeiculo = {};

type VeiculoExistente = {
  id: string;
  marca: string;
  modelo: string;
  versao: string | null;
  ano_fabricacao: number;
  ano_modelo: number;
  km: number;
  cor: string | null;
  combustivel: string | null;
  cambio: string | null;
  placa: string | null;
  chassi: string | null;
  renavam: string | null;
  preco_venda_centavos: number;
  preco_custo_centavos: number | null;
  status: "disponivel" | "reservado" | "vendido" | "inativo";
  destaque: boolean;
};

function centavosParaInputBRL(centavos: number | null): string {
  if (centavos == null) return "";
  const reais = Math.trunc(centavos / 100);
  const resto = Math.abs(centavos % 100);
  return `${reais.toLocaleString("pt-BR")},${resto.toString().padStart(2, "0")}`;
}

function BotaoSalvar({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : label}
    </Button>
  );
}

export function VeiculoForm({
  veiculo,
}: {
  veiculo?: VeiculoExistente;
}) {
  const action = veiculo ? atualizarVeiculo.bind(null, veiculo.id) : criarVeiculo;
  const [estado, formAction] = useActionState(action, ESTADO_INICIAL);

  const [statusSelecionado, setStatusSelecionado] = useState(
    veiculo?.status ?? "disponivel",
  );
  const [precoVenda, setPrecoVenda] = useState(
    centavosParaInputBRL(veiculo?.preco_venda_centavos ?? null),
  );
  const [previa, setPrevia] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (statusSelecionado !== "disponivel" || !precoVenda) {
      setPrevia(null);
      return;
    }
    const centavos = precoVenda
      .replace(/\./g, "")
      .replace(",", ".");
    const valor = Number(centavos);
    if (!Number.isFinite(valor) || valor <= 0) {
      setPrevia(null);
      return;
    }
    const handle = setTimeout(() => {
      startTransition(async () => {
        const qtd = await getPreviaNotificacao(BigInt(Math.round(valor * 100)));
        setPrevia(qtd);
      });
    }, 400);
    return () => clearTimeout(handle);
  }, [precoVenda, statusSelecionado]);

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <legend className="sr-only">Dados do veículo</legend>

        <div className="space-y-2">
          <Label htmlFor="marca">Marca</Label>
          <Input id="marca" name="marca" defaultValue={veiculo?.marca} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo</Label>
          <Input id="modelo" name="modelo" defaultValue={veiculo?.modelo} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="versao">Versão</Label>
          <Input id="versao" name="versao" defaultValue={veiculo?.versao ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="anoFabricacao">Ano de fabricação</Label>
          <Input
            id="anoFabricacao"
            name="anoFabricacao"
            type="number"
            defaultValue={veiculo?.ano_fabricacao}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="anoModelo">Ano do modelo</Label>
          <Input
            id="anoModelo"
            name="anoModelo"
            type="number"
            defaultValue={veiculo?.ano_modelo}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="km">Km</Label>
          <Input id="km" name="km" type="number" defaultValue={veiculo?.km ?? 0} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cor">Cor</Label>
          <Input id="cor" name="cor" defaultValue={veiculo?.cor ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="combustivel">Combustível</Label>
          <Input id="combustivel" name="combustivel" defaultValue={veiculo?.combustivel ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cambio">Câmbio</Label>
          <Input id="cambio" name="cambio" defaultValue={veiculo?.cambio ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="placa">Placa</Label>
          <Input
            id="placa"
            name="placa"
            defaultValue={veiculo?.placa ?? ""}
            required
            disabled={!!veiculo}
            title={veiculo ? "Placa não é editável após o cadastro" : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chassi">Chassi</Label>
          <Input id="chassi" name="chassi" defaultValue={veiculo?.chassi ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="renavam">Renavam</Label>
          <Input id="renavam" name="renavam" defaultValue={veiculo?.renavam ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="precoVenda">Preço de venda</Label>
          <Input
            id="precoVenda"
            name="precoVenda"
            value={precoVenda}
            onChange={(e) => setPrecoVenda(e.target.value)}
            placeholder="45.000,00"
            required
            disabled={!!veiculo}
            title={veiculo ? "Use 'Alterar preço' para mudar o preço de venda" : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="precoCusto">Preço de custo (interno)</Label>
          <Input
            id="precoCusto"
            name="precoCusto"
            defaultValue={centavosParaInputBRL(veiculo?.preco_custo_centavos ?? null)}
            placeholder="38.000,00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            value={statusSelecionado}
            onChange={(e) => setStatusSelecionado(e.target.value as typeof statusSelecionado)}
          >
            <option value="disponivel">Disponível</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido</option>
            <option value="inativo">Inativo</option>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="destaque"
            name="destaque"
            type="checkbox"
            value="true"
            defaultChecked={veiculo?.destaque}
            className="h-4 w-4"
          />
          <Label htmlFor="destaque">Destaque</Label>
        </div>
      </fieldset>

      {!veiculo && previa !== null && (
        <p className="rounded-sm border border-ciano/25 bg-ciano-fundo p-3 txt-pequeno text-ciano">
          {previa} cliente{previa === 1 ? "" : "s"} será{previa === 1 ? "" : "ão"}{" "}
          notificado{previa === 1 ? "" : "s"} por WhatsApp ao salvar este veículo.
        </p>
      )}

      {estado.erro && (
        <p role="alert" className="text-sm text-ambar">
          {estado.erro}
        </p>
      )}
      {estado.sucesso && (
        <p className="text-sm text-ciano">Veículo salvo com sucesso.</p>
      )}

      <BotaoSalvar label={veiculo ? "Salvar alterações" : "Cadastrar veículo"} />
    </form>
  );
}
