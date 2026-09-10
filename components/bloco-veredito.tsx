import Link from "next/link";
import Image from "next/image";

import { formatBRL } from "@/lib/money";
import { Button } from "@/components/ui/button";

export type VeiculoElegivel = {
  veiculo_id: string;
  marca: string;
  modelo: string;
  versao: string | null;
  preco_venda_centavos: bigint;
  saldo_confirmado_centavos: bigint;
  capaUrl?: string | null;
};

/**
 * Bloco de veredito — design/IDENTIDADE.md seção 6.1. Aparece SOMENTE quando
 * há ≥1 veículo elegível. Fundo gradiente vermelho-fundo→base, cantos
 * arredondados e sombra colorida — o bloco mais expressivo da tela (V2).
 * Cards de veículo por dentro ficam em `superficie` para se distinguir do
 * card-mãe.
 */
export function BlocoVeredito({ veiculos }: { veiculos: VeiculoElegivel[] }) {
  if (veiculos.length === 0) return null;

  return (
    <section
      className="rounded-lg border border-vermelho/40 p-6 shadow-vermelho md:p-[30px]"
      style={{
        backgroundImage:
          "linear-gradient(160deg, hsl(var(--vermelho-fundo)), hsl(var(--base)) 70%)",
      }}
    >
      <h2 className="max-w-[16ch] txt-titulo font-semibold leading-[1.15]">
        Você já pode comprar {veiculos.length}{" "}
        {veiculos.length === 1 ? "carro" : "carros"}
      </h2>
      <p className="mt-2.5 max-w-[56ch] txt-corpo text-[#E8B6B2]">
        Seu saldo cobre a entrada de 50% deste{veiculos.length > 1 ? "s" : ""}{" "}
        veículo{veiculos.length > 1 ? "s" : ""}. O restante fica em
        promissória direto com a JJ Motors, sem banco.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {veiculos.map((v) => {
          const aFinanciar =
            v.preco_venda_centavos - v.saldo_confirmado_centavos > 0n
              ? v.preco_venda_centavos - v.saldo_confirmado_centavos
              : 0n;
          return (
            <Link
              key={v.veiculo_id}
              href={`/app/veiculos/${v.veiculo_id}`}
              className="grid grid-cols-[132px_1fr] overflow-hidden rounded-lg border border-white/10 bg-superficie shadow-card transition-transform duration-150 [transition-timing-function:var(--ease-out-forte)] hover:scale-[1.01]"
            >
              <div className="grid place-items-center border-r border-white/10 bg-elevado p-3">
                {v.capaUrl ? (
                  <Image
                    src={v.capaUrl}
                    alt=""
                    width={108}
                    height={80}
                    className="h-auto w-full object-contain opacity-90"
                  />
                ) : (
                  <span className="txt-micro text-cinza-inativo">
                    sem foto
                  </span>
                )}
              </div>
              <div className="p-[15px_17px_16px]">
                <h3 className="txt-corpo font-semibold leading-tight">
                  {v.marca} {v.modelo}
                </h3>
                {v.versao && (
                  <p className="mt-0.5 txt-pequeno text-cinza-texto">
                    {v.versao}
                  </p>
                )}
                <div className="mt-2.5 flex justify-between txt-pequeno">
                  <span className="text-cinza-texto">Sua entrada</span>
                  <span className="font-semibold tabular-nums">
                    {formatBRL(v.saldo_confirmado_centavos)}
                  </span>
                </div>
                <div className="mt-1.5 flex justify-between txt-pequeno">
                  <span className="text-cinza-texto">A financiar</span>
                  <span className="font-semibold tabular-nums">
                    {formatBRL(aFinanciar)}
                  </span>
                </div>
                <div className="mt-2.5 flex items-end justify-between border-t border-white/10 pt-2.5">
                  <span className="txt-micro text-cinza-texto">Preço</span>
                  <span className="fonte-expandida txt-subtitulo font-bold">
                    {formatBRL(v.preco_venda_centavos)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Button asChild className="mt-6 w-full md:w-auto">
        <Link href="/app/elegiveis">
          {veiculos.length === 1
            ? "Reservar este carro"
            : "Reservar um destes carros"}
        </Link>
      </Button>
    </section>
  );
}
