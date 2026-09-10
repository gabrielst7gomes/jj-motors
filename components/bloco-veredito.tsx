import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";

import { Dinheiro } from "@/components/dinheiro";
import { formatBRL } from "@/lib/money";
import { formatarData } from "@/lib/carencia";
import { Button } from "@/components/ui/button";

export type VeiculoElegivel = {
  veiculo_id: string;
  marca: string;
  modelo: string;
  versao: string | null;
  preco_venda_centavos: bigint;
  saldo_confirmado_centavos: bigint;
  capaUrl?: string | null;
  /** true = já pode negociar; false = tem saldo mas está na carência */
  liberado: boolean;
  /** data em que a carência termina (só relevante quando !liberado) */
  carenciaAte?: string | Date | null;
};

/**
 * MOSTRADOR DE VEREDITO — a luz de permissão. Aparece quando há ≥1 veículo
 * cujo SALDO já cobre a entrada (`saldo_ok`), mesmo que a carência de 3 meses
 * ainda não tenha passado.
 *
 *   - Veículos `liberado`: linha com seta, leva à negociação.
 *   - Veículos na carência: selo "disponível a partir de DD/MM", sem seta,
 *     sem botão de negociação até lá.
 *
 * Se TODOS estão na carência, o mostrador não acende a luz vermelha cheia —
 * usa a moldura comum + ícone de relógio, para não prometer o que ainda não
 * pode acontecer.
 */
export function BlocoVeredito({ veiculos }: { veiculos: VeiculoElegivel[] }) {
  if (veiculos.length === 0) return null;

  const liberados = veiculos.filter((v) => v.liberado);
  const naCarencia = veiculos.filter((v) => !v.liberado);
  const temLiberado = liberados.length > 0;
  // Data de carência comum (todos os planos do cliente têm a mesma data-base).
  const carenciaAte = naCarencia[0]?.carenciaAte ?? null;

  return (
    <section
      className={
        "mostrador p-5 md:p-7 " +
        (temLiberado
          ? "mostrador-permissao animate-[pulso-permissao_1100ms_var(--ease-out-forte)_both]"
          : "")
      }
    >
      {temLiberado ? (
        <>
          <p className="rotulo-instrumento text-vermelho-texto">
            Você já pode levar
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="agulha-vermelho leitura leitura-xl inline-block pb-1.5 text-branco">
              {liberados.length}
            </span>
            <span className="font-mostrador text-lg font-semibold uppercase tracking-[0.08em] text-vermelho-texto">
              {liberados.length === 1 ? "carro" : "carros"}
            </span>
          </div>
          <p className="mt-2 max-w-[54ch] txt-pequeno text-vermelho-texto">
            Seu saldo cobre a entrada de 50%. O restante fica em promissória
            direto com a JJ Motors — sem banco.
          </p>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-ciano" strokeWidth={1.75} aria-hidden />
            <p className="rotulo-instrumento text-ciano">Saldo pronto</p>
          </div>
          <h2 className="mt-2 txt-titulo text-branco">
            Seu saldo já cobre {naCarencia.length}{" "}
            {naCarencia.length === 1 ? "carro" : "carros"}
          </h2>
          {carenciaAte && (
            <p className="mt-2 max-w-[54ch] txt-pequeno text-cinza-texto">
              A compra libera após 3 meses de Compra Programada —{" "}
              <b className="font-semibold text-ciano">
                a partir de {formatarData(carenciaAte)}
              </b>
              . Continue aportando: quanto mais saldo, mais opções.
            </p>
          )}
        </>
      )}

      <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
        {[...liberados, ...naCarencia].map((v) => {
          const aFinanciar =
            v.preco_venda_centavos - v.saldo_confirmado_centavos > 0n
              ? v.preco_venda_centavos - v.saldo_confirmado_centavos
              : 0n;
          const conteudo = (
            <>
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
                <p
                  className={
                    "mt-0.5 txt-micro " +
                    (v.liberado ? "text-vermelho-texto" : "text-cinza-texto")
                  }
                >
                  {v.liberado
                    ? `Entrada ${formatBRL(v.saldo_confirmado_centavos)} · a financiar ${formatBRL(aFinanciar)}`
                    : v.carenciaAte
                      ? `Disponível a partir de ${formatarData(v.carenciaAte)}`
                      : "Aguardando carência"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <Dinheiro
                  centavos={v.preco_venda_centavos}
                  className="font-mostrador text-[0.9375rem] font-semibold text-branco"
                  tamanhoCentavos={false}
                />
              </div>
              {v.liberado ? (
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-vermelho-texto transition-transform duration-150 group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                  aria-hidden
                />
              ) : (
                <Clock
                  className="h-4 w-4 shrink-0 text-cinza-inativo"
                  strokeWidth={1.75}
                  aria-hidden
                />
              )}
            </>
          );
          return v.liberado ? (
            <Link
              key={v.veiculo_id}
              href={`/app/veiculos/${v.veiculo_id}`}
              className="group flex items-center gap-4 py-3.5 transition-colors duration-150 [transition-timing-function:var(--ease-out-ui)] hover:bg-white/[0.03]"
            >
              {conteudo}
            </Link>
          ) : (
            <div
              key={v.veiculo_id}
              className="flex items-center gap-4 py-3.5 opacity-80"
            >
              {conteudo}
            </div>
          );
        })}
      </div>

      {temLiberado && (
        <Button asChild className="mt-6 w-full md:w-auto">
          <Link href="/app/elegiveis">
            {liberados.length === 1 ? "Negociar este carro" : "Ver e negociar"}
          </Link>
        </Button>
      )}
    </section>
  );
}
