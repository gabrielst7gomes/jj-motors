"use client";

import { useEffect, useRef, useState } from "react";

import { formatBRL } from "@/lib/money";

/**
 * Barra de progresso rumo aos 50% — design/IDENTIDADE.md seção 6.2. Sempre
 * visível (não é um estado alternativo do bloco de veredito — ver seção 6).
 * O dado grande é QUANTO FALTA, não a porcentagem. Marca vermelha fixa nos
 * 50%. Preenchimento anima de 0% ao valor real na primeira renderização da
 * sessão, respeitando prefers-reduced-motion.
 */
export function BarraProgresso({
  veiculoMarca,
  veiculoModelo,
  veiculoFicha,
  precoVendaCentavos,
  saldoConfirmadoCentavos,
  metaCentavos,
  valorFaltanteCentavos,
  aporteMensalPrevistoCentavos,
}: {
  veiculoMarca: string;
  veiculoModelo: string;
  veiculoFicha: string;
  precoVendaCentavos: bigint;
  saldoConfirmadoCentavos: bigint;
  metaCentavos: bigint;
  valorFaltanteCentavos: bigint;
  aporteMensalPrevistoCentavos: bigint;
}) {
  const percentualDoPreco =
    precoVendaCentavos > 0n
      ? (Number(saldoConfirmadoCentavos) / Number(precoVendaCentavos)) * 100
      : 0;
  const percentualDaMeta =
    metaCentavos > 0n
      ? Math.min(100, (Number(saldoConfirmadoCentavos) / Number(metaCentavos)) * 100)
      : 0;

  const [largura, setLargura] = useState(0);
  const jaAnimou = useRef(false);

  useEffect(() => {
    if (jaAnimou.current) return;
    jaAnimou.current = true;
    const reduzMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduzMovimento) {
      setLargura(percentualDaMeta);
      return;
    }
    const handle = setTimeout(() => setLargura(percentualDaMeta), 260);
    return () => clearTimeout(handle);
  }, [percentualDaMeta]);

  const mesesParaMeta =
    aporteMensalPrevistoCentavos > 0n && valorFaltanteCentavos > 0n
      ? Math.ceil(Number(valorFaltanteCentavos) / Number(aporteMensalPrevistoCentavos))
      : null;

  return (
    <section>
      <p className="border-b border-white/10 pb-2.5 txt-pequeno text-cinza-texto">
        Seu próximo objetivo
      </p>

      <div className="mt-6 flex items-start justify-between gap-5">
        <div>
          <h3 className="txt-subtitulo">
            {veiculoMarca} {veiculoModelo}
          </h3>
          <p className="mt-0.5 txt-pequeno text-cinza-texto">{veiculoFicha}</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="block txt-micro text-cinza-texto">Preço</span>
          <span className="fonte-expandida txt-subtitulo font-bold">
            {formatBRL(precoVendaCentavos)}
          </span>
        </div>
      </div>

      <div className="my-6">
        <p className="txt-pequeno text-cinza-texto">
          Faltam para atingir os 50%
        </p>
        <p className="txt-display mt-1">{formatBRL(valorFaltanteCentavos)}</p>
      </div>

      <div className="relative h-[34px] overflow-hidden rounded-sm border border-white/10 bg-elevado">
        <div
          className="absolute inset-y-0 left-0 rounded-sm bg-gradient-to-r from-azul-profundo to-azul-claro transition-[width] ease-barra"
          style={{ width: `${largura}%`, transitionDuration: "1100ms" }}
        />
        <div
          className="absolute inset-y-[-1px] w-0.5 bg-vermelho"
          style={{ left: "50%" }}
        >
          <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 txt-micro font-bold text-vermelho">
            50%
          </span>
        </div>
      </div>

      <div className="mt-2.5 flex justify-between txt-micro text-cinza-inativo">
        <span>R$ 0</span>
        <span>{formatBRL(precoVendaCentavos)}</span>
      </div>

      <p className="mt-7 max-w-[52ch] txt-pequeno text-cinza-texto">
        Você tem{" "}
        <b className="font-semibold text-branco">
          {formatBRL(saldoConfirmadoCentavos)}
        </b>{" "}
        acumulados, o equivalente a{" "}
        <b className="font-semibold text-branco">
          {percentualDoPreco.toFixed(1).replace(".", ",")}%
        </b>{" "}
        do valor deste carro.
        {mesesParaMeta != null && (
          <>
            {" "}
            Mantendo o aporte de{" "}
            <b className="font-semibold text-branco">
              {formatBRL(aporteMensalPrevistoCentavos)}
            </b>{" "}
            por mês, você chega aos 50% em{" "}
            <b className="font-semibold text-branco">
              {mesesParaMeta} {mesesParaMeta === 1 ? "mês" : "meses"}
            </b>
            .
          </>
        )}
      </p>
    </section>
  );
}
