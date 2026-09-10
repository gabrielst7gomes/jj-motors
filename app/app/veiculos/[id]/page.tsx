import Image from "next/image";
import { notFound } from "next/navigation";

import { Dinheiro } from "@/components/dinheiro";
import {
  getFotosVeiculo,
  getMeuPlanoAtivo,
  getMinhaElegibilidade,
  getVeiculoPublicoPorId,
} from "@/lib/dados/cliente";

import { SimularParcelas } from "./simular-parcelas";

export default async function DetalheVeiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const veiculo = await getVeiculoPublicoPorId(id);
  if (!veiculo) {
    notFound();
  }

  const [fotos, plano] = await Promise.all([
    getFotosVeiculo(id),
    getMeuPlanoAtivo(),
  ]);

  const elegibilidade = plano ? await getMinhaElegibilidade(plano.id) : [];
  const minhaElegibilidade = elegibilidade.find((e) => e.veiculo_id === id);

  const preco = BigInt(veiculo.preco_venda_centavos);
  const entrada = minhaElegibilidade?.elegivel
    ? BigInt(minhaElegibilidade.saldo_confirmado_centavos)
    : 0n;
  const aFinanciar = preco - entrada > 0n ? preco - entrada : 0n;

  const capa = fotos.find((f) => f.capa) ?? fotos[0];

  return (
    <div className="-mx-[18px] md:-mx-12 md:-mt-10">
      {/* Foto full-bleed — sangra até a borda do container, sem base sob o
          logotipo (nenhum texto/marca é sobreposto à imagem — design/
          IDENTIDADE.md seção 7 de ativos: nunca logo direto sobre foto). */}
      {capa ? (
        <Image
          src={capa.url}
          alt={`${veiculo.marca} ${veiculo.modelo}`}
          width={960}
          height={720}
          className="aspect-[4/3] w-full object-cover md:aspect-[16/9]"
          priority
        />
      ) : (
        <div className="grid aspect-[4/3] place-items-center bg-elevado md:aspect-[16/9]">
          <span className="txt-pequeno text-cinza-inativo">Sem foto</span>
        </div>
      )}

      {/* Dados de compra sobre a base, logo abaixo da foto. */}
      <div className="space-y-6 bg-base px-[18px] pb-8 pt-6 md:px-12">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="txt-titulo">
              {veiculo.marca} {veiculo.modelo}
            </h1>
            {minhaElegibilidade?.elegivel ? (
              <span className="mt-1.5 flex shrink-0 items-center gap-1.5 txt-pequeno font-semibold text-vermelho">
                <span
                  className="h-2 w-2 rounded-full bg-vermelho"
                  aria-hidden
                />
                Elegível
              </span>
            ) : veiculo.status === "vendido" ? (
              <span className="mt-1.5 shrink-0 txt-pequeno font-medium text-cinza-inativo">
                Vendido
              </span>
            ) : null}
          </div>
          {veiculo.versao && (
            <p className="mt-0.5 txt-pequeno text-cinza-texto">
              {veiculo.versao}
            </p>
          )}
          <Dinheiro
            centavos={preco}
            className="fonte-expandida mt-2 block txt-titulo font-extrabold"
          />
        </div>

        {minhaElegibilidade?.elegivel && (
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-white/10 bg-superficie p-4 shadow-card">
            <div>
              <p className="txt-pequeno text-cinza-texto">
                Entrada (seu saldo)
              </p>
              <Dinheiro
                centavos={entrada}
                className="mt-0.5 block txt-subtitulo font-bold"
              />
            </div>
            <div>
              <p className="txt-pequeno text-cinza-texto">A financiar</p>
              <Dinheiro
                centavos={aFinanciar}
                className="mt-0.5 block txt-subtitulo font-bold"
              />
            </div>
          </div>
        )}

        {minhaElegibilidade && !minhaElegibilidade.elegivel && (
          <p className="rounded-sm border border-ambar/30 bg-ambar/5 p-3 txt-pequeno text-ambar">
            Faltam{" "}
            <Dinheiro
              centavos={BigInt(minhaElegibilidade.valor_faltante_centavos)}
              className="font-semibold"
              tamanhoCentavos={false}
            />{" "}
            no seu saldo para ficar elegível — mas você já pode abrir uma
            negociação e acertar as condições com um consultor.
          </p>
        )}

        {plano && veiculo.status !== "vendido" && (
          <SimularParcelas
            veiculoId={id}
            elegivel={minhaElegibilidade?.elegivel ?? false}
          />
        )}

        <details className="group border-t border-white/10 pt-4">
          <summary className="cursor-pointer txt-pequeno font-semibold text-cinza-texto group-open:text-branco">
            Ficha técnica
          </summary>
          <dl className="mt-3 grid grid-cols-2 gap-y-2.5 txt-pequeno">
            <dt className="text-cinza-texto">Ano</dt>
            <dd className="text-right tabular-nums">
              {veiculo.ano_fabricacao}/{veiculo.ano_modelo}
            </dd>
            <dt className="text-cinza-texto">Km</dt>
            <dd className="text-right tabular-nums">
              {veiculo.km.toLocaleString("pt-BR")} km
            </dd>
            <dt className="text-cinza-texto">Cor</dt>
            <dd className="text-right">{veiculo.cor ?? "—"}</dd>
            <dt className="text-cinza-texto">Combustível</dt>
            <dd className="text-right">{veiculo.combustivel ?? "—"}</dd>
            <dt className="text-cinza-texto">Câmbio</dt>
            <dd className="text-right">{veiculo.cambio ?? "—"}</dd>
            <dt className="text-cinza-texto">Placa</dt>
            <dd className="text-right font-mono tabular-nums">
              {veiculo.placa_mascarada ?? "—"}
            </dd>
          </dl>
        </details>
      </div>
    </div>
  );
}
