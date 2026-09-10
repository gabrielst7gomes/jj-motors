"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { criarClienteComPlano, type EstadoNovoCliente } from "../actions";

const ESTADO_INICIAL: EstadoNovoCliente = {};

function BotaoCriar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Criando..." : "Criar cliente e plano"}
    </Button>
  );
}

type Vendedor = { id: string; nome_completo: string };

export function NovoClienteForm({ vendedores }: { vendedores: Vendedor[] }) {
  const [estado, formAction] = useActionState(
    criarClienteComPlano,
    ESTADO_INICIAL,
  );

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="txt-pequeno font-semibold text-cinza-texto">Dados do cliente</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nomeCompleto">Nome completo</Label>
            <Input id="nomeCompleto" name="nomeCompleto" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" name="cpf" placeholder="000.000.000-00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefoneE164">Telefone (WhatsApp)</Label>
            <Input
              id="telefoneE164"
              name="telefoneE164"
              placeholder="+5562999999999"
              required
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="txt-pequeno font-semibold text-cinza-texto">Plano de compra programada</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="percentualMinimo">% mínimo p/ elegibilidade</Label>
            <Input
              id="percentualMinimo"
              name="percentualMinimo"
              type="number"
              step="0.01"
              min="0.01"
              max="1"
              defaultValue="0.5"
            />
          </div>
        </div>
        <p className="txt-micro text-cinza-texto">
          Os aportes são livres — o cliente aporta qualquer valor, em qualquer
          data. A elegibilidade para comprar libera 3 meses após a adesão.
        </p>
        <div className="space-y-2">
          <Label htmlFor="vendedorId">Vendedor responsável (opcional)</Label>
          <Select id="vendedorId" name="vendedorId">
            <option value="">Nenhum</option>
            {vendedores.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome_completo}
              </option>
            ))}
          </Select>
          <p className="txt-micro text-cinza-texto">
            O vendedor vinculado recebe comissão quando este cliente comprar
            um veículo.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Input id="observacoes" name="observacoes" />
        </div>
      </fieldset>

      {estado.erro && (
        <p role="alert" className="text-sm text-ambar">
          {estado.erro}
        </p>
      )}

      <BotaoCriar />
    </form>
  );
}
