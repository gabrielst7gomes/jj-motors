import Image from "next/image";
import Link from "next/link";

import { Dinheiro } from "@/components/dinheiro";
import {
  getCapasVeiculos,
  getEstoquePublico,
  getMeuPlanoAtivo,
  getMinhaElegibilidade,
} from "@/lib/dados/cliente";

type SearchParams = Promise<{ marca?: string }>;

export default async function EstoqueCompletoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { marca: filtroMarca } = await searchParams;

  const [estoque, plano] = await Promise.all([
    getEstoquePublico(),
    getMeuPlanoAtivo(),
  ]);

  const elegibilidade = plano ? await getMinhaElegibilidade(plano.id) : [];
  const elegibilidadePorVeiculo = new Map(
    elegibilidade.map((e) => [e.veiculo_id, e]),
  );
  const capas = await getCapasVeiculos(estoque.map((v) => v.id));

  const marcas = Array.from(new Set(estoque.map((v) => v.marca))).sort();
  const veiculosFiltrados = filtroMarca
    ? estoque.filter((v) => v.marca === filtroMarca)
    : estoque;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="txt-titulo">Estoque completo</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          {estoque.length} veículos disponíveis
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-5">
        <Link
          href="/app/estoque"
          className={
            !filtroMarca
              ? "gradiente-vermelho rounded-sm px-3 py-1 txt-pequeno font-semibold text-branco shadow-vermelho"
              : "rounded-sm border border-white/15 px-3 py-1 txt-pequeno text-cinza-texto transition-colors duration-150 [transition-timing-function:var(--ease-out-forte)] hover:border-white/30"
          }
        >
          Todas as marcas
        </Link>
        {marcas.map((marca) => (
          <Link
            key={marca}
            href={`/app/estoque?marca=${encodeURIComponent(marca)}`}
            className={
              filtroMarca === marca
                ? "gradiente-vermelho rounded-sm px-3 py-1 txt-pequeno font-semibold text-branco shadow-vermelho"
                : "rounded-sm border border-white/15 px-3 py-1 txt-pequeno text-cinza-texto transition-colors duration-150 [transition-timing-function:var(--ease-out-forte)] hover:border-white/30"
            }
          >
            {marca}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {veiculosFiltrados.map((v) => {
          const elegibilidadeVeiculo = elegibilidadePorVeiculo.get(v.id);
          const preco = BigInt(v.preco_venda_centavos);
          const eEligivel = elegibilidadeVeiculo?.elegivel ?? false;
          const capa = capas.get(v.id);

          return (
            <Link
              key={v.id}
              href={`/app/veiculos/${v.id}`}
              className={
                eEligivel
                  ? "flex flex-col overflow-hidden rounded-lg border border-vermelho/40 bg-vermelho-fundo shadow-vermelho transition-transform duration-150 [transition-timing-function:var(--ease-out-forte)] hover:scale-[1.015]"
                  : "flex flex-col overflow-hidden rounded-lg border border-white/10 bg-superficie shadow-card transition-transform duration-150 [transition-timing-function:var(--ease-out-forte)] hover:scale-[1.015]"
              }
            >
              <div className="grid aspect-[4/3] place-items-center border-b border-white/10 bg-elevado">
                {capa ? (
                  <Image
                    src={capa}
                    alt=""
                    width={220}
                    height={165}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="txt-micro text-cinza-inativo">
                    sem foto
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="txt-corpo font-semibold leading-tight">
                    {v.marca} {v.modelo}
                  </h3>
                  {eEligivel && (
                    <span
                      className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-vermelho"
                      aria-hidden
                    />
                  )}
                </div>
                <p className="mt-0.5 txt-pequeno text-cinza-texto">
                  {v.versao ? `${v.versao} · ` : ""}
                  {v.ano_modelo} · {v.km.toLocaleString("pt-BR")} km
                </p>

                <div className="mt-auto flex items-end justify-between pt-4">
                  <Dinheiro
                    centavos={preco}
                    className="fonte-expandida txt-subtitulo font-bold"
                  />
                  {elegibilidadeVeiculo &&
                    (eEligivel ? (
                      <span className="txt-micro font-semibold text-vermelho">
                        Elegível
                      </span>
                    ) : (
                      <div className="text-right">
                        <p className="txt-micro text-cinza-texto">Faltam</p>
                        <Dinheiro
                          centavos={BigInt(
                            elegibilidadeVeiculo.valor_faltante_centavos,
                          )}
                          className="txt-pequeno font-semibold text-ambar"
                          tamanhoCentavos={false}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
