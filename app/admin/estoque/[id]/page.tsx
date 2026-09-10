import { notFound } from "next/navigation";

import { getFotosVeiculoAdmin, getVeiculoPorId } from "@/lib/dados/admin";

import { VeiculoForm } from "../veiculo-form";
import { AlterarPrecoForm } from "./alterar-preco-form";
import { FotosUploader } from "./fotos-uploader";

export default async function EditarVeiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const veiculo = await getVeiculoPorId(id);
  if (!veiculo) notFound();

  const fotos = await getFotosVeiculoAdmin(id);

  return (
    <div className="max-w-4xl space-y-9">
      <div>
        <h1 className="txt-titulo text-branco">
          {veiculo.marca} {veiculo.modelo}
        </h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">{veiculo.placa}</p>
      </div>

      <section>
        <h2 className="border-b border-white/10 pb-2.5 txt-pequeno text-cinza-texto">
          Preço de venda
        </h2>
        <div className="pt-4">
          <AlterarPrecoForm veiculoId={id} />
        </div>
      </section>

      <section>
        <h2 className="border-b border-white/10 pb-2.5 txt-pequeno text-cinza-texto">
          Fotos
        </h2>
        <div className="pt-4">
          <FotosUploader veiculoId={id} fotos={fotos} />
        </div>
      </section>

      <section>
        <h2 className="border-b border-white/10 pb-2.5 txt-pequeno text-cinza-texto">
          Dados do veículo
        </h2>
        <div className="pt-4">
          <VeiculoForm veiculo={veiculo} />
        </div>
      </section>
    </div>
  );
}
