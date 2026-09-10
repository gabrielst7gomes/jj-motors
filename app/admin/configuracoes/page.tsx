import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTaxaJurosGlobal } from "@/lib/dados/taxa-juros";
import { createClient } from "@/lib/supabase/server";

import { TaxaGlobalForm } from "./taxa-global-form";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const taxaAtual = await getTaxaJurosGlobal(supabase);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="txt-titulo text-branco">Configurações</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          Parâmetros globais do sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Taxa de juros mensal padrão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TaxaGlobalForm taxaAtual={taxaAtual} />
          <p className="mt-4 text-xs text-cinza-texto">
            Para definir uma taxa diferente para um cliente específico, acesse{" "}
            <span className="font-medium">Clientes e planos → detalhe do
            plano</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
