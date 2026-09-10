import { Dinheiro } from "@/components/dinheiro";
import { StatusPlanoBadge } from "@/components/status-badge";
import {
  getCatalogoModelosAtivos,
  getMeuPlanoAtivo,
  getMeuSaldo,
  getMinhasPreferenciasVeiculo,
} from "@/lib/dados/cliente";
import { PreferenciaVeiculoSecao } from "./preferencia-form";

export default async function MeuPlanoPage() {
  const plano = await getMeuPlanoAtivo();
  if (!plano) {
    return <p className="txt-corpo text-cinza-texto">Nenhum plano ativo.</p>;
  }

  const [saldo, preferencias, catalogo] = await Promise.all([
    getMeuSaldo(plano.id),
    getMinhasPreferenciasVeiculo(plano.id),
    getCatalogoModelosAtivos(),
  ]);

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="txt-titulo">Meu plano</h1>
          <p className="mt-0.5 txt-pequeno text-cinza-texto">{plano.codigo}</p>
        </div>
        <StatusPlanoBadge status={plano.status} />
      </div>

      <div>
        <p className="border-b border-white/10 pb-2.5 txt-pequeno text-cinza-texto">
          Saldo confirmado
        </p>
        <Dinheiro
          centavos={BigInt(saldo?.saldo_confirmado_centavos ?? 0)}
          className="fonte-expandida mt-4 block txt-display"
        />
        {(saldo?.saldo_pendente_centavos ?? 0) > 0 && (
          <p className="mt-1.5 txt-pequeno text-cinza-texto">
            +{" "}
            <Dinheiro
              centavos={BigInt(saldo?.saldo_pendente_centavos ?? 0)}
              className="inline txt-pequeno"
              tamanhoCentavos={false}
            />{" "}
            pendente de confirmação
          </p>
        )}
      </div>

      <dl className="divide-y divide-white/10 border-y border-white/10">
        <div className="flex items-center justify-between py-3.5">
          <dt className="txt-pequeno text-cinza-texto">Data de adesão</dt>
          <dd className="txt-corpo font-medium">
            {new Date(plano.data_adesao).toLocaleDateString("pt-BR")}
          </dd>
        </div>
        <div className="flex items-center justify-between py-3.5">
          <dt className="txt-pequeno text-cinza-texto">Dia de vencimento</dt>
          <dd className="txt-corpo font-medium">
            Todo dia {plano.dia_vencimento}
          </dd>
        </div>
        <div className="flex items-center justify-between py-3.5">
          <dt className="txt-pequeno text-cinza-texto">
            Aporte mensal previsto
          </dt>
          <Dinheiro
            centavos={BigInt(plano.aporte_mensal_previsto_centavos)}
            className="txt-corpo font-medium"
            tamanhoCentavos={false}
          />
        </div>
        <div className="flex items-center justify-between py-3.5">
          <dt className="txt-pequeno text-cinza-texto">% mínimo exigido</dt>
          <dd className="txt-corpo font-medium tabular-nums">
            {(plano.percentual_minimo * 100).toFixed(0)}%
          </dd>
        </div>
      </dl>

      <PreferenciaVeiculoSecao preferencias={preferencias} catalogo={catalogo} />

      {plano.observacoes && (
        <div>
          <p className="txt-pequeno text-cinza-texto">Observações</p>
          <p className="mt-1.5 txt-corpo">{plano.observacoes}</p>
        </div>
      )}
    </div>
  );
}
