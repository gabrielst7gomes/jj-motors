import Link from "next/link";

import { BarraProgresso } from "@/components/barra-progresso";
import { BlocoVeredito } from "@/components/bloco-veredito";
import { Dinheiro } from "@/components/dinheiro";
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
      <div className="max-w-[52ch]">
        <h1 className="txt-titulo">Nenhum plano ativo</h1>
        <p className="mt-2 txt-corpo text-cinza-texto">
          Fale com a JJ Motors para aderir à Compra Programada.
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

  // Próximo objetivo: o veículo ainda não elegível mais barato (a lista já
  // vem ordenada por preço crescente de getMinhaElegibilidade).
  const proximoObjetivo = elegibilidade.find((v) => !v.elegivel);

  const vencimento = proximoVencimento(plano.dia_vencimento);
  const proximoAporte = extrato.find((a) => a.status === "pendente");
  const ultimosAportes = extrato.slice(0, 3);

  return (
    <div className="space-y-11">
      <div>
        <h1 className="txt-titulo">Meu resumo</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          Plano {plano.codigo} · ativo desde{" "}
          {new Date(plano.data_adesao).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        {proximoObjetivo ? (
          <div className="rounded-lg border border-white/10 bg-superficie p-6 shadow-card md:p-7">
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
          </div>
        ) : (
          <p className="txt-corpo text-cinza-texto">
            Você já é elegível para todo o estoque disponível.
          </p>
        )}

        <aside className="flex flex-col rounded-lg border border-white/10 bg-superficie px-6 shadow-card">
          <div className="border-b border-white/10 py-5">
            <p className="txt-pequeno text-cinza-texto">Saldo acumulado</p>
            <Dinheiro
              centavos={saldoConfirmado}
              className="fonte-expandida mt-1.5 block txt-titulo font-extrabold"
            />
          </div>

          <div className="border-b border-white/10 py-5">
            <p className="txt-pequeno text-cinza-texto">Próximo aporte</p>
            <div className="mt-1.5 flex items-baseline justify-between">
              <b className="fonte-expandida txt-subtitulo font-bold">
                {vencimento.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                })}
              </b>
              {proximoAporte && (
                <em className="txt-pequeno font-semibold not-italic text-ambar">
                  pendente
                </em>
              )}
            </div>
          </div>

          <div className="py-5">
            <p className="txt-pequeno text-cinza-texto">Últimos aportes</p>
            <div className="mt-1.5">
              {ultimosAportes.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between border-b border-white/10 py-2.5 last:border-0"
                >
                  <div className="txt-pequeno">
                    {new Date(a.data_competencia).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                    })}
                    <span className="mt-0.5 flex items-center gap-1.5 text-cinza-inativo">
                      {a.status === "pendente" ? (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-ambar"
                          aria-hidden
                        />
                      ) : (
                        <span className="h-1.5 w-1.5 bg-azul-claro" aria-hidden />
                      )}
                      {LABEL_STATUS_APORTE[a.status]}
                    </span>
                  </div>
                  <Dinheiro
                    centavos={BigInt(a.valor_centavos)}
                    className="txt-corpo font-semibold"
                    tamanhoCentavos={false}
                  />
                </div>
              ))}
              {ultimosAportes.length === 0 && (
                <p className="txt-pequeno text-cinza-inativo">
                  Nenhum aporte lançado ainda.
                </p>
              )}
            </div>
            <Link
              href="/app/extrato"
              className="mt-4 inline-block border-b border-azul-claro/40 txt-pequeno font-semibold text-azul-claro hover:border-azul-claro"
            >
              Ver extrato completo
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
