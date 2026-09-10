import Image from "next/image";
import { notFound } from "next/navigation";

import { Dinheiro } from "@/components/dinheiro";
import { formatarData } from "@/lib/carencia";
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
  const saldoOk = minhaElegibilidade?.saldo_ok ?? false;
  const elegivel = minhaElegibilidade?.elegivel ?? false;
  const emCarencia = saldoOk && !elegivel;
  const entrada = saldoOk
    ? BigInt(minhaElegibilidade!.saldo_confirmado_centavos)
    : 0n;
  const aFinanciar = preco - entrada > 0n ? preco - entrada : 0n;

  const capa = fotos.find((f) => f.capa) ?? fotos[0];

  const ficha: [string, string][] = [
    ["Ano", `${veiculo.ano_fabricacao}/${veiculo.ano_modelo}`],
    ["Km", `${veiculo.km.toLocaleString("pt-BR")} km`],
    ["Cor", veiculo.cor ?? "—"],
    ["Combustível", veiculo.combustivel ?? "—"],
    ["Câmbio", veiculo.cambio ?? "—"],
    ["Placa", veiculo.placa_mascarada ?? "—"],
  ];

  return (
    <div className="-mx-4 -mt-5 md:-mx-12 md:-mt-10">
      {/* Foto full-bleed */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-recuo md:aspect-[21/9]">
        {capa ? (
          <Image
            src={capa.url}
            alt={`${veiculo.marca} ${veiculo.modelo}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="grid h-full place-items-center">
            <span className="rotulo-campo text-cinza-inativo">Sem foto</span>
          </div>
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-base to-transparent"
          aria-hidden
        />
        {elegivel && (
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-xs border border-vermelho/50 bg-base/70 px-2.5 py-1.5 backdrop-blur-sm">
            <span
              className="h-1.5 w-1.5 rounded-full bg-vermelho shadow-[0_0_6px_0_hsl(var(--vermelho)/0.9)]"
              aria-hidden
            />
            <span className="font-mostrador text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-branco">
              Liberado para você
            </span>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-2xl space-y-6 px-4 pb-10 pt-6 md:px-12">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="txt-titulo text-branco">
              {veiculo.marca} {veiculo.modelo}
            </h1>
            {veiculo.status === "vendido" && (
              <span className="mt-1.5 shrink-0 rotulo-campo text-cinza-inativo">
                Vendido
              </span>
            )}
          </div>
          {veiculo.versao && (
            <p className="mt-1 txt-pequeno text-cinza-texto">{veiculo.versao}</p>
          )}
          <Dinheiro
            centavos={preco}
            className="leitura leitura-lg mt-3 block text-branco"
          />
        </div>

        {saldoOk && (
          <div className="mostrador grid grid-cols-2 divide-x divide-white/10 p-0">
            <div className="p-4">
              <p className="rotulo-campo">Entrada · seu saldo</p>
              <Dinheiro
                centavos={entrada}
                className="leitura leitura-md mt-2 block text-branco"
                tamanhoCentavos={false}
              />
            </div>
            <div className="p-4">
              <p className="rotulo-campo">A financiar</p>
              <Dinheiro
                centavos={aFinanciar}
                className="leitura leitura-md mt-2 block text-ciano"
                tamanhoCentavos={false}
              />
            </div>
          </div>
        )}

        {emCarencia && minhaElegibilidade?.carencia_ate && (
          <div className="rounded-sm border border-ciano/25 bg-ciano-fundo p-3.5">
            <p className="txt-pequeno text-ciano">
              Seu saldo já cobre a entrada. A compra libera após 3 meses de
              Compra Programada —{" "}
              <b className="font-semibold">
                a partir de {formatarData(minhaElegibilidade.carencia_ate)}
              </b>
              . Você pode abrir negociação agora para adiantar as condições
              com um consultor.
            </p>
          </div>
        )}

        {minhaElegibilidade && !minhaElegibilidade.saldo_ok && (
          <div className="rounded-sm border border-ambar/25 bg-ambar-fundo p-3.5">
            <p className="txt-pequeno text-ambar">
              Faltam{" "}
              <b className="font-semibold">
                <Dinheiro
                  centavos={BigInt(minhaElegibilidade.valor_faltante_centavos)}
                  className="font-mostrador"
                  tamanhoCentavos={false}
                />
              </b>{" "}
              no seu saldo para cobrir a entrada — mas você já pode abrir
              negociação e acertar as condições com um consultor.
            </p>
          </div>
        )}

        {plano && veiculo.status !== "vendido" && (
          <SimularParcelas veiculoId={id} elegivel={saldoOk} />
        )}

        <div className="mostrador p-5">
          <p className="rotulo-instrumento">Ficha técnica</p>
          <dl className="mt-3 grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-y-0">
            {ficha.map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between gap-3 py-2.5 sm:px-1"
              >
                <dt className="rotulo-campo">{k}</dt>
                <dd className="txt-pequeno text-branco">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
