import { Card, CardContent } from "@/components/ui/card";

import { VeiculoForm } from "../veiculo-form";

export default function NovoVeiculoPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="txt-titulo">Novo veículo</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          Ao salvar com status &quot;Disponível&quot;, os clientes elegíveis
          são notificados automaticamente por WhatsApp.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <VeiculoForm />
        </CardContent>
      </Card>
    </div>
  );
}
