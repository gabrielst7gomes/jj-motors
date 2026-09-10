"use client";

import { useEffect, useRef, useState } from "react";

import { Dinheiro } from "@/components/dinheiro";
import { formatBRL } from "@/lib/money";

/**
 * MOSTRADOR DE ROTA — a barra rumo aos 50%. O instrumento dominante quando o
 * cliente ainda não é elegível. O dado grande é QUANTO FALTA (ciano, com
 * sublinhado de agulha), não a porcentagem. Marca vermelha fixa nos 50%.
 * O traço de progresso sobe do zero ao valor real uma vez por sessão
 * (scaleX, GPU), respeitando prefers-reduced-motion.
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
  /** meta = 50% do preço. Mantido na assinatura por compat com o call site;
   *  a trilha aqui é 0→100% do PREÇO, com a marca vermelha no meio. */
  metaCentavos?: bigint;
  valorFaltanteCentavos: bigint;
  aporteMensalPrevistoCentavos: bigint;
}) {
  void metaCentavos;
  const percentualDoPreco =
    precoVendaCentavos > 0n
      ? (Number(saldoConfirmadoCentavos) / Number(precoVendaCentavos)) * 100
      : 0;
  // A trilha inteira representa 0% → 100% do PREÇO. A meta (50%) é a marca
  // vermelha no meio. O preenchimento vai até `percentualDoPreco`.
  const preenchimento = Math.min(100, Math.max(0, percentualDoPreco));

  const [escala, setEscala] = useState(0);
  const jaAnimou = useRef(false);

  useEffect(() => {
    if (jaAnimou.current) return;
    jaAnimou.current = true;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduz) {
      setEscala(1);
      return;
    }
    const h = setTimeout(() => setEscala(1), 220);
    return () => clearTimeout(h);
  }, []);

  const mesesParaMeta =
    aporteMensalPrevistoCentavos > 0n && valorFaltanteCentavos > 0n
      ? Math.ceil(
          Number(valorFaltanteCentavos) / Number(aporteMensalPrevistoCentavos),
        )
      : null;

  return (
    <section className="mostrador p-5 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="rotulo-instrumento">Próximo objetivo</p>
          <h3 className="mt-1.5 txt-subtitulo text-branco">
            {veiculoMarca} {veiculoModelo}
          </h3>
          {veiculoFicha && (
            <p className="mt-0.5 txt-pequeno text-cinza-texto">{veiculoFicha}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="rotulo-instrumento">Preço</p>
          <p className="mt-1.5 font-mostrador text-[1.0625rem] font-semibold text-branco">
            {formatBRL(precoVendaCentavos)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="rotulo-instrumento">Faltam para os 50%</p>
        <Dinheiro
          centavos={valorFaltanteCentavos}
          className="agulha-ciano leitura leitura-lg mt-2 inline-block pb-1.5 text-ciano"
        />
        {mesesParaMeta != null && (
          <p className="mt-2 txt-pequeno text-cinza-texto">
            ~{mesesParaMeta} {mesesParaMeta === 1 ? "mês" : "meses"} no ritmo
            atual
          </p>
        )}
      </div>

      {/* Trilha do mostrador */}
      <div className="mt-6">
        <div className="poco relative h-8 overflow-hidden rounded-sm">
          <div
            className="traco-progresso absolute inset-y-0 left-0 origin-left transition-transform [transition-timing-function:var(--ease-agulha)]"
            style={{
              width: `${preenchimento}%`,
              transform: `scaleX(${escala})`,
              transitionDuration: "900ms",
            }}
          />
          {/* Marca dos 50% */}
          <div
            className="absolute inset-y-[-2px] left-1/2 w-[2px] bg-vermelho shadow-[0_0_8px_0_hsl(var(--vermelho)/0.7)]"
            aria-hidden
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="rotulo-campo">R$ 0</span>
          <span className="rotulo-campo text-vermelho">50% · meta</span>
          <span className="rotulo-campo">{formatBRL(precoVendaCentavos)}</span>
        </div>
      </div>

      <p className="mt-6 max-w-[54ch] txt-pequeno text-cinza-texto">
        Você tem{" "}
        <b className="font-semibold text-branco">
          {formatBRL(saldoConfirmadoCentavos)}
        </b>{" "}
        acumulados —{" "}
        <b className="font-semibold text-ciano">
          {percentualDoPreco.toFixed(1).replace(".", ",")}%
        </b>{" "}
        do valor deste carro.
        {mesesParaMeta != null && (
          <>
            {" "}
            Mantendo{" "}
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
