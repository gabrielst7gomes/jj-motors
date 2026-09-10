import { getVendedores } from "@/lib/dados/admin";

import { NovoClienteForm } from "./novo-cliente-form";

export default async function NovoClientePage() {
  const vendedores = await getVendedores();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="txt-titulo text-branco">Novo cliente</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          Cria o acesso do cliente e o plano de compra programada.
        </p>
      </div>

      <NovoClienteForm vendedores={vendedores} />
    </div>
  );
}
