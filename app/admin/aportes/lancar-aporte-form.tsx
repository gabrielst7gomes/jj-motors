"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

import { lancarAporte, type EstadoFormulario } from "./actions";

const ESTADO_INICIAL: EstadoFormulario = {};

type PlanoComCliente = {
  id: string;
  codigo: string;
  profiles: { nome_completo: string } | null;
};

function BotaoSalvar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Lançar aporte"}
    </Button>
  );
}

export function LancarAporteForm({ planos }: { planos: PlanoComCliente[] }) {
  const [estado, formAction] = useActionState(lancarAporte, ESTADO_INICIAL);

  return (
    <form
      action={formAction}
      className="mostrador grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div className="space-y-2">
        <Label htmlFor="planoId">Cliente / plano</Label>
        <Select id="planoId" name="planoId" required>
          <option value="">Selecione...</option>
          {planos.map((plano) => (
            <option key={plano.id} value={plano.id}>
              {plano.profiles?.nome_completo ?? "—"} · {plano.codigo}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="valor">Valor</Label>
        <Input id="valor" name="valor" placeholder="R$ 0,00" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meioPagamento">Meio de pagamento</Label>
        <Select id="meioPagamento" name="meioPagamento" required defaultValue="pix">
          <option value="pix">Pix</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="ted">TED</option>
          <option value="cartao">Cartão</option>
          <option value="outro">Outro</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dataCompetencia">Data de competência</Label>
        <Input
          id="dataCompetencia"
          name="dataCompetencia"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="comprovante">Comprovante (opcional)</Label>
        <Input
          id="comprovante"
          name="comprovante"
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
        />
      </div>

      <div className="flex items-end sm:col-span-2 lg:col-span-3">
        <BotaoSalvar />
      </div>

      {estado.erro && (
        <p role="alert" className="txt-pequeno text-ambar sm:col-span-3">
          {estado.erro}
        </p>
      )}
      {estado.sucesso && (
        <p className="txt-pequeno text-ciano sm:col-span-3">
          Aporte lançado como pendente.
        </p>
      )}
    </form>
  );
}
