import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Clock } from "lucide-react";

import { Dinheiro } from "@/components/dinheiro";
import { formatBRL } from "@/lib/money";
import { formatarData } from "@/lib/carencia";

export type CardVeiculoProps = {
  href: Route;
  marca: string;
  modelo: string;
  versao: string | null;
  anoModelo?: number | null;
  km?: number | null;
  precoVendaCentavos: bigint;
  capaUrl?: string | null;
  /** saldo cobre a entrada (independente da carência) */
  saldoOk?: boolean;
  /** pode negociar agora (saldo + carência) */
  elegivel?: boolean;
  /** data em que a carência termina — mostrada quando saldoOk mas !elegivel */
  carenciaAte?: string | Date | null;
  valorFaltanteCentavos?: bigint;
  entradaCentavos?: bigint;
};

/**
 * Card de veículo (estoque / elegíveis). Três estados:
 *  - `elegivel`: mostrador com a luz de permissão acesa (moldura vermelha).
 *  - `saldoOk` mas na carência: mostrador comum + selo "a partir de DD/MM".
 *  - falta saldo: mostrador comum + "faltam R$ X" em âmbar.
 */
export function CardVeiculo({
  href,
  marca,
  modelo,
  versao,
  anoModelo,
  km,
  precoVendaCentavos,
  capaUrl,
  saldoOk,
  elegivel,
  carenciaAte,
  valorFaltanteCentavos,
  entradaCentavos,
}: CardVeiculoProps) {
  const emCarencia = !!saldoOk && !elegivel;

  return (
    <Link
      href={href}
      className={
        "group flex flex-col overflow-hidden " +
        (elegivel ? "mostrador mostrador-permissao" : "mostrador")
      }
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-recuo">
        {capaUrl ? (
          <Image
            src={capaUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 [transition-timing-function:var(--ease-out-forte)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <span className="rotulo-campo text-cinza-inativo">sem foto</span>
          </div>
        )}
        {elegivel && (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-xs border border-vermelho/50 bg-base/70 px-2 py-1 backdrop-blur-sm">
            <span
              className="h-1.5 w-1.5 rounded-full bg-vermelho shadow-[0_0_6px_0_hsl(var(--vermelho)/0.9)]"
              aria-hidden
            />
            <span className="font-mostrador text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-branco">
              Liberado
            </span>
          </div>
        )}
        {emCarencia && (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-xs border border-ciano/40 bg-base/70 px-2 py-1 backdrop-blur-sm">
            <Clock className="h-3 w-3 text-ciano" strokeWidth={2} aria-hidden />
            <span className="font-mostrador text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ciano">
              Saldo pronto
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="txt-corpo font-semibold leading-tight text-branco">
          {marca} {modelo}
        </h3>
        <p className="mt-0.5 txt-micro text-cinza-texto">
          {[
            versao,
            anoModelo,
            km != null ? `${km.toLocaleString("pt-BR")} km` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {elegivel && entradaCentavos != null && (
          <p className="mt-2 txt-micro text-vermelho-texto">
            Entrada {formatBRL(entradaCentavos)} · a financiar{" "}
            {formatBRL(
              precoVendaCentavos - entradaCentavos > 0n
                ? precoVendaCentavos - entradaCentavos
                : 0n,
            )}
          </p>
        )}
        {emCarencia && carenciaAte && (
          <p className="mt-2 txt-micro text-ciano">
            Disponível a partir de {formatarData(carenciaAte)}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="rotulo-campo">Preço</p>
            <Dinheiro
              centavos={precoVendaCentavos}
              className="leitura leitura-md mt-1 block text-branco"
              tamanhoCentavos={false}
            />
          </div>
          {elegivel ? (
            <ArrowRight
              className="mb-1 h-4 w-4 shrink-0 text-vermelho-texto transition-transform duration-150 group-hover:translate-x-0.5"
              strokeWidth={1.75}
              aria-hidden
            />
          ) : !saldoOk && valorFaltanteCentavos != null ? (
            <div className="text-right">
              <p className="rotulo-campo">Faltam</p>
              <Dinheiro
                centavos={valorFaltanteCentavos}
                className="mt-1 block font-mostrador text-[0.875rem] font-semibold text-ambar"
                tamanhoCentavos={false}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
