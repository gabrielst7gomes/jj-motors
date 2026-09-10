"use client";

import { useEffect, useRef, useState } from "react";

import { Dinheiro } from "@/components/dinheiro";
import { formatBRL } from "@/lib/money";
import { estimarMesesParaMeta } from "@/lib/carencia";

/**
 * MOSTRADOR DE ROTA — a barra rumo aos 50%. Instrumento dominante quando o
 * saldo do cliente ainda não cobre a entrada de nenhum veículo. O dado grande
 * é QUANTO FALTA (ciano, com sublinhado de agulha). Marca vermelha fixa nos
 * 50%. O traço sobe do zero ao valor real uma vez por sessão (scaleX, GPU),
 * respeitando prefers-reduced-motion.
 *
 * A estimativa de "~N meses" usa a MÉDIA dos aportes já confirmados (o aporte
 * deixou de ser fixo em 2026-09-10 — não há mais valor mensal previsto).
 */
export function BarraProgresso({
  veiculoMarca,
  veiculoModelo,
  veiculoFicha,
  precoVendaCentavos,
  saldoConfirmadoCentavos,
  valorFaltanteCentavos,
  aportesConfirmados,
  dataAdesao,
}: {
  veiculoMarca: string;
  veiculoModelo: string;
  veiculoFicha: string;
  precoVendaCentavos: bigint;
  saldoConfirmadoCentavos: bigint;
  valorFaltanteCentavos: bigint;
  /** valores (centavos) dos aportes confirmados, para estimar o ritmo. */
  aportesConfirmados: bigint[];
  /** ISO "YYYY-MM-DD" — para saber há quantos meses o cliente aporta. */
  dataAdesao: string;
}) {
  const percentualDoPreco =
    precoVendaCentavos > 0n
      ? (Number(saldoConfirmadoCentavos) / Number(precoVendaCentavos)) * 100
      : 0;
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

  // Meses de histórico desde a adesão (mínimo 1).
  const mesesHistorico = Math.max(
    1,
    Math.round(
      (Date.now() - new Date(dataAdesao).getTime()) / (30.44 * 86_400_000),
    ),
  );
  const mesesParaMeta = estimarMesesParaMeta(
    valorFaltanteCentavos,
    aportesConfirmados,
    mesesHistorico,
  );

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
            atual dos seus aportes
          </p>
        )}
      </div>

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
        do valor deste carro. Aporte quando e quanto quiser.
      </p>
    </section>
  );
}
