import Link from "next/link";
import type { Route } from "next";

import { CardVeiculo } from "@/components/card-veiculo";
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

  const pill = (ativo: boolean) =>
    "rounded-sm border px-3 py-1.5 font-mostrador text-[0.6875rem] font-semibold uppercase tracking-[0.08em] transition-colors duration-150 [transition-timing-function:var(--ease-out-ui)] " +
    (ativo
      ? "border-vermelho/50 bg-vermelho/10 text-branco"
      : "border-white/12 text-cinza-texto hover:border-white/25 hover:text-branco");

  return (
    <div className="space-y-6">
      <h1 className="border-b border-white/10 pb-3 txt-titulo text-branco">
        {filtroMarca ? `${filtroMarca} · ` : ""}
        {veiculosFiltrados.length}{" "}
        {veiculosFiltrados.length === 1 ? "veículo" : "veículos"}
        {filtroMarca ? "" : " no estoque"}
      </h1>

      <div className="flex flex-wrap gap-2">
        <Link href="/app/estoque" className={pill(!filtroMarca)}>
          Todas
        </Link>
        {marcas.map((marca) => (
          <Link
            key={marca}
            href={`/app/estoque?marca=${encodeURIComponent(marca)}`}
            className={pill(filtroMarca === marca)}
          >
            {marca}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {veiculosFiltrados.map((v) => {
          const e = elegibilidadePorVeiculo.get(v.id);
          return (
            <CardVeiculo
              key={v.id}
              href={`/app/veiculos/${v.id}` as Route}
              marca={v.marca}
              modelo={v.modelo}
              versao={v.versao}
              anoModelo={v.ano_modelo}
              km={v.km}
              precoVendaCentavos={BigInt(v.preco_venda_centavos)}
              capaUrl={capas.get(v.id)}
              saldoOk={e?.saldo_ok}
              elegivel={e?.elegivel}
              carenciaAte={e?.carencia_ate}
              valorFaltanteCentavos={
                e && !e.saldo_ok
                  ? BigInt(e.valor_faltante_centavos)
                  : undefined
              }
              entradaCentavos={
                e?.elegivel ? BigInt(e.saldo_confirmado_centavos) : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
