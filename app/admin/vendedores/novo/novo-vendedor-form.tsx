"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { criarVendedor, type EstadoVendedor } from "../../cargos/actions";

const ESTADO_INICIAL: EstadoVendedor = {};

type Cargo = { id: string; nome: string; percentual_comissao: number };

function BotaoCriar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Criando..." : "Criar vendedor"}
    </Button>
  );
}

export function NovoVendedorForm({ cargos }: { cargos: Cargo[] }) {
  const [estado, formAction] = useActionState(criarVendedor, ESTADO_INICIAL);

  return (
    <form action={formAction} className="space-y-4">
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
          <Label htmlFor="telefoneE164">Telefone</Label>
          <Input
            id="telefoneE164"
            name="telefoneE164"
            placeholder="+5562999999999"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="cargoId">Cargo</Label>
          <Select id="cargoId" name="cargoId" required>
            <option value="">Selecione...</option>
            {cargos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({(c.percentual_comissao * 100).toFixed(2)}%)
              </option>
            ))}
          </Select>
        </div>
      </div>

      {estado.erro && (
        <p role="alert" className="text-sm text-ambar">
          {estado.erro}
        </p>
      )}

      <BotaoCriar />
    </form>
  );
}
