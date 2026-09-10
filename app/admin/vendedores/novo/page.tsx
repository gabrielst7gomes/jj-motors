import { Card, CardContent } from "@/components/ui/card";
import { getCargos } from "@/lib/dados/admin";

import { NovoVendedorForm } from "./novo-vendedor-form";

export default async function NovoVendedorPage() {
  const cargos = await getCargos();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="txt-titulo">Novo vendedor</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          Cria o acesso do vendedor e o vincula a um cargo.
        </p>
      </div>

      {cargos.length === 0 ? (
        <p className="text-sm text-ambar">
          Cadastre pelo menos um cargo antes de criar um vendedor.
        </p>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <NovoVendedorForm cargos={cargos} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
