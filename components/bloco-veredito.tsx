import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Dinheiro } from "@/components/dinheiro";
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
 * MOSTRADOR DE VEREDITO — a luz de permissão acesa. Aparece SOMENTE quando há
 * ≥1 veículo elegível. É o instrumento dominante da tela nesse estado:
 * `.mostrador-permissao` (moldura vermelha + glow), leitura grande do número
 * de carros, e cada carro elegível como uma linha compacta (entrada · a
 * financiar) com seta. O glow pulsa uma vez ao aparecer.
 */
export function BlocoVeredito({ veiculos }: { veiculos: VeiculoElegivel[] }) {
  if (veiculos.length === 0) return null;

  return (
    <section className="mostrador mostrador-permissao animate-[pulso-permissao_1100ms_var(--ease-out-forte)_both] p-5 md:p-7">
      <p className="rotulo-instrumento text-vermelho-texto">Você já pode levar</p>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="agulha-vermelho leitura leitura-xl inline-block pb-1.5 text-branco">
          {veiculos.length}
        </span>
        <span className="font-mostrador text-lg font-semibold uppercase tracking-[0.08em] text-vermelho-texto">
          {veiculos.length === 1 ? "carro" : "carros"}
        </span>
      </div>
      <p className="mt-2 max-w-[54ch] txt-pequeno text-vermelho-texto">
        Seu saldo cobre a entrada de 50%. O restante fica em promissória direto
        com a JJ Motors — sem banco.
      </p>

      <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
        {veiculos.map((v) => {
          const aFinanciar =
            v.preco_venda_centavos - v.saldo_confirmado_centavos > 0n
              ? v.preco_venda_centavos - v.saldo_confirmado_centavos
              : 0n;
          return (
            <Link
              key={v.veiculo_id}
              href={`/app/veiculos/${v.veiculo_id}`}
              className="group flex items-center gap-4 py-3.5 transition-colors duration-150 [transition-timing-function:var(--ease-out-ui)] hover:bg-white/[0.03]"
            >
              <div className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-sm border border-white/10 bg-recuo">
                {v.capaUrl ? (
                  <Image
                    src={v.capaUrl}
                    alt=""
                    width={80}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[0.5625rem] uppercase tracking-wide text-cinza-inativo">
                    s/ foto
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="txt-corpo font-semibold text-branco">
                  {v.marca} {v.modelo}
                </p>
                <p className="mt-0.5 txt-micro text-vermelho-texto">
                  Entrada {formatBRL(v.saldo_confirmado_centavos)} · a financiar{" "}
                  {formatBRL(aFinanciar)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <Dinheiro
                  centavos={v.preco_venda_centavos}
                  className="font-mostrador text-[0.9375rem] font-semibold text-branco"
                  tamanhoCentavos={false}
                />
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-vermelho-texto transition-transform duration-150 group-hover:translate-x-0.5"
                strokeWidth={1.75}
                aria-hidden
              />
            </Link>
          );
        })}
      </div>

      <Button asChild className="mt-6 w-full md:w-auto">
        <Link href="/app/elegiveis">
          {veiculos.length === 1
            ? "Negociar este carro"
            : "Ver e negociar"}
        </Link>
      </Button>
    </section>
  );
}
