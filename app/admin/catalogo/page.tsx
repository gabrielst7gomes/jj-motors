import { getCatalogoModelos } from "@/lib/dados/admin";

import { LinhaCatalogo } from "./modelo-form";
import { NovoModeloCatalogo } from "./novo-modelo";

export default async function CatalogoPage() {
  const modelos = await getCatalogoModelos();
  const ativos = modelos.filter((m) => m.ativo).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="txt-titulo text-branco">Catálogo de modelos</h1>
          <p className="mt-0.5 max-w-[60ch] txt-pequeno text-cinza-texto">
            Modelos pré-fixados que o cliente pode escolher como &quot;carro
            desejado&quot;. Quando um veículo desses entra no estoque, o
            cliente é avisado — mesmo sem ter os 50% do valor.
            {" "}
            {ativos} de {modelos.length} ativos.
          </p>
        </div>
        <NovoModeloCatalogo />
      </div>

      <div className="mostrador overflow-hidden">
        {modelos.length === 0 ? (
          <p className="p-6 txt-pequeno text-cinza-texto">
            Nenhum modelo no catálogo ainda.
          </p>
        ) : (
          modelos.map((m) => (
            <LinhaCatalogo
              key={m.id}
              modelo={m}
              preferenciasVinculadas={
                (m.preferencias_veiculo as { count: number }[] | null)?.[0]
                  ?.count ?? 0
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
