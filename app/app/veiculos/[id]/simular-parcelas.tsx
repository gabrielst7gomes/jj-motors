"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dinheiro } from "@/components/dinheiro";

import { simularParcelasAction, type ResultadoSimulacao } from "./simular-action";
import { reservarVeiculoAction } from "./reservar-action";

/**
 * A simulação roda inteiramente no servidor (simularParcelasAction): preço,
 * entrada e a taxa de juros mensal (própria do plano ou a global definida
 * pelo admin) são resolvidos lá — este componente só envia o número de
 * parcelas escolhido e mostra o resultado. Nenhum cálculo de dinheiro aqui.
 */
export function SimularParcelas({ veiculoId }: { veiculoId: string }) {
  const router = useRouter();
  const [qtdParcelas, setQtdParcelas] = useState(24);
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [pending, startTransition] = useTransition();

  const [reservando, startReserva] = useTransition();
  const [erroReserva, setErroReserva] = useState<string | null>(null);
  const [reservado, setReservado] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      startTransition(async () => {
        const r = await simularParcelasAction({ veiculoId, qtdParcelas });
        setResultado(r);
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [veiculoId, qtdParcelas]);

  function reservar() {
    setErroReserva(null);
    startReserva(async () => {
      const r = await reservarVeiculoAction({ veiculoId });
      if (r.ok) {
        setReservado(true);
        router.refresh();
      } else {
        setErroReserva(r.erro);
      }
    });
  }

  return (
    <div className="rounded-lg border border-white/10 bg-superficie p-5 shadow-card">
      <div className="space-y-2">
        <Label htmlFor="qtd-parcelas">Número de parcelas</Label>
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
            Taxa de juros: {(resultado.taxaJurosMensal * 100).toFixed(2)}% ao
            mês
          </p>
        </div>
      )}

      <Button
        type="button"
        className="mt-5 w-full"
        disabled={!resultado?.ok || reservando || reservado}
        onClick={reservar}
      >
        {reservado
          ? "Reservado"
          : reservando
            ? "Reservando..."
            : "Reservar este veículo"}
      </Button>

      {erroReserva && (
        <p className="mt-2 txt-pequeno text-ambar">{erroReserva}</p>
      )}
      {reservado && (
        <p className="mt-2 txt-pequeno text-azul-claro">
          Reserva confirmada. Um consultor da JJ Motors vai formalizar a
          proposta com você.
        </p>
      )}

      <p className="mt-3 text-center txt-micro text-cinza-inativo">
        A reserva confirma o veículo com prioridade por 72 horas.
      </p>
    </div>
  );
}
