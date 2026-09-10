"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dinheiro } from "@/components/dinheiro";

import { simularParcelasAction, type ResultadoSimulacao } from "./simular-action";
import { abrirNegociacaoAction } from "./negociar-action";

/**
 * A simulação roda inteiramente no servidor (simularParcelasAction): preço,
 * entrada e a taxa de juros mensal são resolvidos lá. Este componente só
 * envia o número de parcelas e mostra o resultado — nenhum cálculo de
 * dinheiro aqui.
 *
 * `elegivel` controla só a simulação. Abrir negociação está sempre
 * disponível para quem tem plano ativo (decisão do usuário: o cliente pode
 * negociar entrada antecipada mesmo sem os 50%).
 */
export function SimularParcelas({
  veiculoId,
  elegivel,
}: {
  veiculoId: string;
  elegivel: boolean;
}) {
  const router = useRouter();
  const [qtdParcelas, setQtdParcelas] = useState(24);
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!elegivel) return;
    const handle = setTimeout(() => {
      startTransition(async () => {
        const r = await simularParcelasAction({ veiculoId, qtdParcelas });
        setResultado(r);
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [veiculoId, qtdParcelas, elegivel]);

  return (
    <div className="space-y-4">
      {elegivel && (
        <div className="rounded-lg border border-white/10 bg-superficie p-5 shadow-card">
          <div className="space-y-2">
            <Label htmlFor="qtd-parcelas">Simular parcelas</Label>
            <Input
              id="qtd-parcelas"
              type="number"
              min={1}
              max={60}
              value={qtdParcelas}
              onChange={(e) => setQtdParcelas(Number(e.target.value))}
            />
          </div>

          {pending && !resultado && (
            <p className="mt-3 txt-pequeno text-cinza-texto">Simulando...</p>
          )}

          {resultado && !resultado.ok && (
            <p className="mt-3 txt-pequeno text-ambar">{resultado.erro}</p>
          )}

          {resultado?.ok && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="txt-micro text-cinza-texto">A financiar</p>
                  <Dinheiro
                    centavos={resultado.resultado.saldoFinanciadoCentavos}
                    className="mt-0.5 block txt-corpo font-semibold"
                    tamanhoCentavos={false}
                  />
                </div>
                <div>
                  <p className="txt-micro text-cinza-texto">Valor da parcela</p>
                  <Dinheiro
                    centavos={resultado.resultado.valorParcelaCentavos}
                    className="mt-0.5 block txt-corpo font-semibold"
                    tamanhoCentavos={false}
                  />
                </div>
              </div>
              <p className="txt-micro text-cinza-inativo">
                Taxa de juros: {(resultado.taxaJurosMensal * 100).toFixed(2)}%
                ao mês
              </p>
            </div>
          )}
        </div>
      )}

      <AbrirNegociacao veiculoId={veiculoId} onAberta={() => router.refresh()} />
    </div>
  );
}

function AbrirNegociacao({
  veiculoId,
  onAberta,
}: {
  veiculoId: string;
  onAberta: () => void;
}) {
  const [aberta, setAberta] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function abrir() {
    setErro(null);
    startTransition(async () => {
      const r = await abrirNegociacaoAction({ veiculoId, mensagem });
      if (r.ok) {
        setAberta(true);
        onAberta();
      } else {
        setErro(r.erro);
      }
    });
  }

  if (aberta) {
    return (
      <div className="rounded-lg border border-vermelho/30 bg-vermelho-fundo p-5 shadow-card">
        <p className="txt-corpo font-semibold text-branco">
          Negociação aberta
        </p>
        <p className="mt-1 max-w-[46ch] txt-pequeno text-cinza-texto">
          Um consultor da JJ Motors vai falar com você pelo WhatsApp para
          acertar entrada, prazo e condições. Você acompanha em
          &quot;Negociações&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-superficie p-5 shadow-card">
      <p className="txt-corpo font-semibold">Interessado neste carro?</p>
      <p className="mt-1 max-w-[46ch] txt-pequeno text-cinza-texto">
        Abra uma negociação. Um consultor entra em contato pelo WhatsApp para
        acertar entrada, prazo e condições — mesmo que você ainda não tenha os
        50% do valor.
      </p>

      <div className="mt-4 space-y-2">
        <Label htmlFor="mensagem-negociacao">
          Quer adiantar algo? (opcional)
        </Label>
        <textarea
          id="mensagem-negociacao"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Ex.: tenho interesse, posso dar uma entrada maior à vista."
          className="flex w-full rounded-sm border border-white/10 bg-elevado px-3 py-2 txt-corpo text-branco outline-none transition-[border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-out-forte)] placeholder:text-cinza-inativo focus-visible:border-azul-claro focus-visible:shadow-[0_0_0_3px_hsl(var(--azul-claro)/0.15)]"
        />
      </div>

      <Button
        type="button"
        className="mt-4 w-full"
        disabled={pending}
        onClick={abrir}
      >
        {pending ? "Abrindo..." : "Abrir negociação"}
      </Button>

      {erro && <p className="mt-2 txt-pequeno text-ambar">{erro}</p>}
    </div>
  );
}
