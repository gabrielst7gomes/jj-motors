import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCargoPorId,
  getCatalogoPermissoes,
  getPermissoesDoCargo,
} from "@/lib/dados/admin";

import { PermissoesForm } from "./permissoes-form";

export default async function DetalheCargoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cargo = await getCargoPorId(id);
  if (!cargo) notFound();

  const [permissoes, ativas] = await Promise.all([
    getCatalogoPermissoes(),
    getPermissoesDoCargo(id),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="txt-titulo">{cargo.nome}</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          {(cargo.percentual_comissao * 100).toFixed(2)}% de comissão sobre a
          venda
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <PermissoesForm
            cargoId={id}
            permissoes={permissoes}
            permissoesAtivas={ativas}
          />
        </CardContent>
      </Card>
    </div>
  );
}
