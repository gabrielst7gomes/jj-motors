import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BarraProgresso } from "@/components/barra-progresso";
import { BlocoVeredito } from "@/components/bloco-veredito";
import { Dinheiro } from "@/components/dinheiro";
import { Button } from "@/components/ui/button";
import {
  getCapasVeiculos,
  getMeuExtrato,
  getMeuPlanoAtivo,
  getMeuSaldo,
  getMinhaElegibilidade,
} from "@/lib/dados/cliente";

function proximoVencimento(diaVencimento: number): Date {
  const hoje = new Date();
  const candidato = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento);
  if (candidato < hoje) {
    candidato.setMonth(candidato.getMonth() + 1);
  }
  return candidato;
}

const LABEL_STATUS_APORTE = {
  confirmado: "Confirmado",
  pendente: "Em análise",
  rejeitado: "Rejeitado",
} as const;

export default async function DashboardClientePage() {
  const plano = await getMeuPlanoAtivo();

  if (!plano) {
    return (
      <div className="mostrador max-w-[52ch] p-6">
        <h1 className="txt-titulo text-branco">Nenhum plano ativo</h1>
        <p className="mt-2 txt-corpo text-cinza-texto">
          Fale com a JJ Motors para aderir à Compra Programada e começar a
          acompanhar seu saldo por aqui.
        </p>
      </div>
    );
  }

  const [saldo, elegibilidade, extrato] = await Promise.all([
    getMeuSaldo(plano.id),
    getMinhaElegibilidade(plano.id),
    getMeuExtrato(plano.id),
  ]);

  const saldoConfirmado = BigInt(saldo?.saldo_confirmado_centavos ?? 0);
  const veiculosElegiveis = elegibilidade.filter((v) => v.elegivel);
  const capas = await getCapasVeiculos(
    veiculosElegiveis.map((v) => v.veiculo_id),
  );

  const proximoObjetivo = elegibilidade.find((v) => !v.elegivel);

  const vencimento = proximoVencimento(plano.dia_vencimento);
  const proximoAporte = extrato.find((a) => a.status === "pendente");
  const ultimosAportes = extrato.slice(0, 3);
  const temVeredito = veiculosElegiveis.length > 0;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Cabeçalho de painel */}
      <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
        <h1 className="txt-titulo text-branco">
          {temVeredito ? "Você está liberado" : "Em rota"}
        </h1>
        <p className="shrink-0 rotulo-campo">Plano {plano.codigo}</p>
      </div>

      {/* INSTRUMENTO DOMINANTE — veredito OU rota */}
      {temVeredito ? (
        <BlocoVeredito
          veiculos={veiculosElegiveis.map((v) => ({
            veiculo_id: v.veiculo_id,
            marca: v.marca,
            modelo: v.modelo,
            versao: v.versao,
            preco_venda_centavos: BigInt(v.preco_venda_centavos),
            saldo_confirmado_centavos: BigInt(v.saldo_confirmado_centavos),
            capaUrl: capas.get(v.veiculo_id),
          }))}
        />
      ) : proximoObjetivo ? (
        <>
          <BarraProgresso
            veiculoMarca={proximoObjetivo.marca}
            veiculoModelo={proximoObjetivo.modelo}
            veiculoFicha={proximoObjetivo.versao ?? ""}
            precoVendaCentavos={BigInt(proximoObjetivo.preco_venda_centavos)}
            saldoConfirmadoCentavos={saldoConfirmado}
            metaCentavos={BigInt(proximoObjetivo.meta_centavos)}
            valorFaltanteCentavos={BigInt(
              proximoObjetivo.valor_faltante_centavos,
            )}
            aporteMensalPrevistoCentavos={BigInt(
              plano.aporte_mensal_previsto_centavos,
            )}
          />
          <Button asChild className="w-full md:hidden">
            <Link href="/app/estoque">Ver estoque completo</Link>
          </Button>
        </>
      ) : (
        <div className="mostrador p-6">
          <p className="txt-corpo text-cinza-texto">
            Você já é elegível para todo o estoque disponível.
          </p>
        </div>
      )}

      {/* TELEMETRIA — dois mostradores pequenos + últimos lançamentos */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="mostrador p-4 md:p-5">
          <p className="rotulo-instrumento">Saldo acumulado</p>
          <Dinheiro
            centavos={saldoConfirmado}
            className="leitura leitura-md mt-2 block text-branco"
            tamanhoCentavos={false}
          />
          {(saldo?.saldo_pendente_centavos ?? 0) > 0 && (
            <p className="mt-1.5 txt-micro text-cinza-texto">
              +{" "}
              <Dinheiro
                centavos={BigInt(saldo?.saldo_pendente_centavos ?? 0)}
                className="inline text-cinza-texto"
                tamanhoCentavos={false}
              />{" "}
              a confirmar
            </p>
          )}
        </div>
        <div className="mostrador p-4 md:p-5">
          <p className="rotulo-instrumento">Próximo aporte</p>
          <p className="leitura leitura-md mt-2 text-branco">
            {vencimento.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            })}
          </p>
          <p className="mt-1.5 txt-micro text-cinza-texto">
            {vencimento.toLocaleDateString("pt-BR", { month: "long" })}
            {proximoAporte && (
              <span className="ml-1.5 text-ambar">· pendente</span>
            )}
          </p>
        </div>
      </div>

      {/* Últimos lançamentos */}
      <div className="mostrador p-5">
        <div className="flex items-center justify-between">
          <p className="rotulo-instrumento">Últimos lançamentos</p>
          <Link
            href="/app/extrato"
            className="inline-flex items-center gap-1 font-mostrador text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ciano transition-colors hover:text-branco"
          >
            Extrato completo
            <ArrowRight className="h-3 w-3" strokeWidth={2} aria-hidden />
          </Link>
        </div>
        {ultimosAportes.length === 0 ? (
          <p className="mt-3 txt-pequeno text-cinza-inativo">
            Nenhum aporte lançado ainda.
          </p>
        ) : (
          <ol className="mt-2 divide-y divide-white/10">
            {ultimosAportes.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="txt-pequeno text-branco">
                    {new Date(a.data_competencia).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                    })}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 txt-micro text-cinza-inativo">
                    {a.status === "pendente" ? (
                      <span
                        className="h-0 w-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-ambar"
                        aria-hidden
                      />
                    ) : (
                      <span className="h-1.5 w-1.5 bg-ciano" aria-hidden />
                    )}
                    {LABEL_STATUS_APORTE[a.status]}
                  </p>
                </div>
                <Dinheiro
                  centavos={BigInt(a.valor_centavos)}
                  className="font-mostrador text-[0.9375rem] font-semibold text-branco"
                  tamanhoCentavos={false}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
