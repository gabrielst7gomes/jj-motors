import Link from "next/link";
import type { Route } from "next";

import { CardVeiculo } from "@/components/card-veiculo";
import { formatarData } from "@/lib/carencia";
import {
  getCapasVeiculos,
  getMeuPlanoAtivo,
  getMinhaElegibilidade,
} from "@/lib/dados/cliente";

export default async function VeiculosElegiveisPage() {
  const plano = await getMeuPlanoAtivo();
  if (!plano) {
    return <p className="txt-corpo text-cinza-texto">Nenhum plano ativo.</p>;
  }

  const elegibilidade = await getMinhaElegibilidade(plano.id);
  const comSaldo = elegibilidade.filter((v) => v.saldo_ok);
  const liberados = comSaldo.filter((v) => v.elegivel);
  const emCarencia = comSaldo.filter((v) => !v.elegivel);
  const capas = await getCapasVeiculos(comSaldo.map((v) => v.veiculo_id));
  const carenciaAte = emCarencia[0]?.carencia_ate ?? null;

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-3">
        <h1 className="txt-titulo text-branco">
          {comSaldo.length}{" "}
          {comSaldo.length === 1 ? "carro ao seu alcance" : "carros ao seu alcance"}
        </h1>
        <p className="mt-1.5 max-w-[54ch] txt-pequeno text-cinza-texto">
          Seu saldo cobre a entrada de 50%. O restante fica em promissória
          direto com a JJ Motors — sem banco.
        </p>
      </div>

      {comSaldo.length === 0 ? (
        <div className="mostrador p-8 text-center">
          <p className="txt-corpo text-cinza-texto">
            Nenhum carro ao seu alcance ainda.
          </p>
          <Link
            href="/app/estoque"
            className="mt-3 inline-flex items-center gap-1 font-mostrador text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-ciano hover:text-branco"
          >
            Ver estoque e o quanto falta
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {liberados.length > 0 && (
            <div>
              <p className="rotulo-instrumento text-vermelho-texto">
                Liberados agora
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
                {liberados.map((v) => (
                  <CardVeiculo
                    key={v.veiculo_id}
                    href={`/app/veiculos/${v.veiculo_id}` as Route}
                    marca={v.marca}
                    modelo={v.modelo}
                    versao={v.versao}
                    precoVendaCentavos={BigInt(v.preco_venda_centavos)}
                    capaUrl={capas.get(v.veiculo_id)}
                    saldoOk
                    elegivel
                    entradaCentavos={BigInt(v.saldo_confirmado_centavos)}
                  />
                ))}
              </div>
            </div>
          )}

          {emCarencia.length > 0 && (
            <div>
              <p className="rotulo-instrumento text-ciano">
                Saldo pronto · liberam em {carenciaAte ? formatarData(carenciaAte) : "breve"}
              </p>
              <p className="mt-1.5 max-w-[54ch] txt-pequeno text-cinza-texto">
                A compra libera após 3 meses de Compra Programada. Seu saldo já
                cobre a entrada destes — continue aportando para ter mais
                opções quando a carência passar.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
                {emCarencia.map((v) => (
                  <CardVeiculo
                    key={v.veiculo_id}
                    href={`/app/veiculos/${v.veiculo_id}` as Route}
                    marca={v.marca}
                    modelo={v.modelo}
                    versao={v.versao}
                    precoVendaCentavos={BigInt(v.preco_venda_centavos)}
                    capaUrl={capas.get(v.veiculo_id)}
                    saldoOk
                    carenciaAte={v.carencia_ate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
