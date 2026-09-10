import Link from "next/link";
import type { Route } from "next";

import { CardVeiculo } from "@/components/card-veiculo";
import {
  getCapasVeiculos,
  getMeuPlanoAtivo,
  getMinhaElegibilidade,
} from "@/lib/dados/cliente";

export default async function VeiculosElegiveisPage() {
  const plano = await getMeuPlanoAtivo();
  if (!plano) {
    return (
      <p className="txt-corpo text-cinza-texto">Nenhum plano ativo.</p>
    );
  }

  const elegibilidade = await getMinhaElegibilidade(plano.id);
  const elegiveis = elegibilidade.filter((v) => v.elegivel);
  const capas = await getCapasVeiculos(elegiveis.map((v) => v.veiculo_id));

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-3">
        <h1 className="txt-titulo text-branco">
          {elegiveis.length}{" "}
          {elegiveis.length === 1 ? "veículo liberado" : "veículos liberados"}{" "}
          para você
        </h1>
        <p className="mt-1.5 max-w-[54ch] txt-pequeno text-cinza-texto">
          Seu saldo cobre a entrada. O restante fica em promissória direto com
          a JJ Motors — sem banco.
        </p>
      </div>

      {elegiveis.length === 0 ? (
        <div className="mostrador p-8 text-center">
          <p className="txt-corpo text-cinza-texto">
            Nenhum veículo liberado ainda.
          </p>
          <Link
            href="/app/estoque"
            className="mt-3 inline-flex items-center gap-1 font-mostrador text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-ciano hover:text-branco"
          >
            Ver estoque e o quanto falta
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {elegiveis.map((v) => (
            <CardVeiculo
              key={v.veiculo_id}
              href={`/app/veiculos/${v.veiculo_id}` as Route}
              marca={v.marca}
              modelo={v.modelo}
              versao={v.versao}
              precoVendaCentavos={BigInt(v.preco_venda_centavos)}
              capaUrl={capas.get(v.veiculo_id)}
              elegivel
              entradaCentavos={BigInt(v.saldo_confirmado_centavos)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
