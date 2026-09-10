"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dinheiro } from "@/components/dinheiro";

import { simularParcelasAction, type ResultadoSimulacao } from "./simular-action";
import { abrirNegociacaoAction } from "./negociar-action";

/**
 * Simulação roda no servidor (simularParcelasAction). `elegivel` controla só
 * a simulação — abrir negociação está sempre disponível para quem tem plano
 * ativo (o cliente pode negociar entrada antecipada mesmo sem os 50%).
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
        <div className="mostrador p-5">
          <p className="rotulo-instrumento">Simular promissória</p>
          <div className="mt-3 space-y-2">
            <Label htmlFor="qtd-parcelas">Número de parcelas</Label>
            <Input
              id="qtd-parcelas"
              type="number"
              min={1}
              max={60}
              value={qtdParcelas}
              onChange={(e) => setQtdParcelas(Number(e.target.value))}
              className="max-w-[9rem]"
            />
          </div>

          {pending && !resultado && (
            <p className="mt-3 txt-pequeno text-cinza-texto">Calculando…</p>
          )}
          {resultado && !resultado.ok && (
            <p className="mt-3 txt-pequeno text-ambar">{resultado.erro}</p>
          )}

          {resultado?.ok && (
            <div className="mt-4">
              <div className="grid grid-cols-2 divide-x divide-white/10 border-y border-white/10">
                <div className="py-3 pr-3">
                  <p className="rotulo-campo">A financiar</p>
                  <Dinheiro
                    centavos={resultado.resultado.saldoFinanciadoCentavos}
                    className="leitura leitura-md mt-1.5 block text-branco"
                    tamanhoCentavos={false}
                  />
                </div>
                <div className="py-3 pl-3">
                  <p className="rotulo-campo">Parcela</p>
                  <Dinheiro
                    centavos={resultado.resultado.valorParcelaCentavos}
                    className="leitura leitura-md mt-1.5 block text-ciano"
                    tamanhoCentavos={false}
                  />
                </div>
              </div>
              <p className="mt-2.5 rotulo-campo">
                Juros {(resultado.taxaJurosMensal * 100).toFixed(2)}% ao mês
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
      <div className="mostrador mostrador-permissao p-5">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-vermelho" strokeWidth={2.5} aria-hidden />
          <p className="font-mostrador text-sm font-semibold uppercase tracking-[0.06em] text-branco">
            Negociação aberta
          </p>
        </div>
        <p className="mt-2 max-w-[48ch] txt-pequeno text-vermelho-texto">
          Um consultor da JJ Motors vai falar com você pelo WhatsApp para
          acertar entrada, prazo e condições. Acompanhe em &quot;Negócios&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="mostrador p-5">
      <p className="rotulo-instrumento">Interessado?</p>
      <p className="mt-2 max-w-[48ch] txt-pequeno text-cinza-texto">
        Abra uma negociação. Um consultor entra em contato pelo WhatsApp para
        acertar entrada, prazo e condições — mesmo sem os 50% do valor.
      </p>

      <div className="mt-4 space-y-2">
        <Label htmlFor="mensagem-negociacao">Quer adiantar algo? (opcional)</Label>
        <textarea
          id="mensagem-negociacao"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Ex.: posso dar uma entrada maior à vista."
          className="poco flex w-full rounded-sm px-3 py-2 txt-corpo text-branco outline-none transition-[border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-out-ui)] placeholder:text-cinza-inativo focus-visible:border-ciano/70 focus-visible:shadow-[0_0_0_3px_hsl(var(--ciano)/0.14)]"
        />
      </div>

      <Button
        type="button"
        className="mt-4 w-full"
        disabled={pending}
        onClick={abrir}
      >
        {pending ? "Abrindo…" : "Abrir negociação"}
      </Button>

      {erro && <p className="mt-2 txt-pequeno text-ambar">{erro}</p>}
    </div>
  );
}
