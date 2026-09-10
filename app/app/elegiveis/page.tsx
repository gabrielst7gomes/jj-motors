import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Dinheiro } from "@/components/dinheiro";
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
  const elegiveis = elegibilidade.filter((v) => v.elegivel);
  const capas = await getCapasVeiculos(elegiveis.map((v) => v.veiculo_id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="txt-titulo">Meus veículos elegíveis</h1>
        <p className="mt-0.5 max-w-[52ch] txt-pequeno text-cinza-texto">
          Seu saldo já cobre a entrada destes veículos. O restante fica em
          promissória direto com a JJ Motors.
        </p>
      </div>

      {elegiveis.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-superficie p-8 text-center shadow-card">
          <p className="txt-corpo text-cinza-texto">
            Nenhum veículo elegível no momento.
          </p>
          <Link
            href="/app/estoque"
            className="mt-3 inline-block border-b border-azul-claro/40 txt-pequeno font-semibold text-azul-claro hover:border-azul-claro"
          >
            Ver o estoque completo e o quanto falta
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {elegiveis.map((v) => {
            const entrada = BigInt(v.saldo_confirmado_centavos);
            const preco = BigInt(v.preco_venda_centavos);
            const aFinanciar = preco - entrada > 0n ? preco - entrada : 0n;
            const capa = capas.get(v.veiculo_id);

            return (
              <div
                key={v.veiculo_id}
                className="flex flex-col overflow-hidden rounded-lg border border-vermelho/40 bg-vermelho-fundo shadow-vermelho transition-transform duration-150 [transition-timing-function:var(--ease-out-forte)] hover:scale-[1.015]"
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
                    <span className="flex shrink-0 items-center gap-1.5 txt-micro font-medium text-vermelho">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-vermelho"
                        aria-hidden
                      />
                      Elegível
                    </span>
                  </div>
                  {v.versao && (
                    <p className="mt-0.5 txt-pequeno text-cinza-texto">
                      {v.versao}
                    </p>
                  )}

                  <div className="mt-3 flex justify-between txt-pequeno">
                    <span className="text-cinza-texto">Sua entrada</span>
                    <Dinheiro
                      centavos={entrada}
                      className="txt-pequeno font-semibold"
                      tamanhoCentavos={false}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between txt-pequeno">
                    <span className="text-cinza-texto">A financiar</span>
                    <Dinheiro
                      centavos={aFinanciar}
                      className="txt-pequeno font-semibold"
                      tamanhoCentavos={false}
                    />
                  </div>

                  <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
                    <span className="txt-micro text-cinza-texto">Preço</span>
                    <Dinheiro
                      centavos={preco}
                      className="fonte-expandida txt-subtitulo font-bold"
                    />
                  </div>

                  <Button asChild className="mt-4 w-full" size="sm">
                    <Link href={`/app/veiculos/${v.veiculo_id}`}>
                      Abrir negociação
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
