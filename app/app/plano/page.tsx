import { Dinheiro } from "@/components/dinheiro";
import { StatusPlanoBadge } from "@/components/status-badge";
import {
  getCatalogoModelosAtivos,
  getMeuPlanoAtivo,
  getMeuSaldo,
  getMinhasPreferenciasVeiculo,
} from "@/lib/dados/cliente";
import { somaMesesCalendario } from "@/lib/elegibilidade";
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

  const dataAdesao = new Date(plano.data_adesao);
  const carenciaAte = somaMesesCalendario(dataAdesao, 3);
  const carenciaCumprida = carenciaAte.getTime() <= Date.now();

  const linhas: [string, React.ReactNode][] = [
    ["Data de adesão", dataAdesao.toLocaleDateString("pt-BR")],
    [
      "Compra libera em",
      <span
        key="c"
        className={
          "font-mostrador font-semibold " +
          (carenciaCumprida ? "text-ciano" : "text-branco")
        }
      >
        {carenciaCumprida
          ? "liberada"
          : carenciaAte.toLocaleDateString("pt-BR")}
      </span>,
    ],
    [
      "% mínimo exigido",
      <span key="p" className="font-mostrador font-semibold text-branco">
        {(plano.percentual_minimo * 100).toFixed(0)}%
      </span>,
    ],
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
        <h1 className="txt-titulo text-branco">
          Meu plano{" "}
          <span className="rotulo-campo align-middle">{plano.codigo}</span>
        </h1>
        <StatusPlanoBadge status={plano.status} />
      </div>

      <div className="mostrador p-5 md:p-6">
        <p className="rotulo-instrumento">Saldo confirmado</p>
        <Dinheiro
          centavos={BigInt(saldo?.saldo_confirmado_centavos ?? 0)}
          className="leitura leitura-lg mt-2 block text-branco"
        />
        {(saldo?.saldo_pendente_centavos ?? 0) > 0 && (
          <p className="mt-2 txt-pequeno text-cinza-texto">
            +{" "}
            <Dinheiro
              centavos={BigInt(saldo?.saldo_pendente_centavos ?? 0)}
              className="inline text-cinza-texto"
              tamanhoCentavos={false}
            />{" "}
            pendente de confirmação
          </p>
        )}

        <dl className="mt-5 divide-y divide-white/10 border-t border-white/10">
          {linhas.map(([label, valor]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 py-3"
            >
              <dt className="rotulo-campo">{label}</dt>
              <dd className="txt-corpo">{valor}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mostrador p-5 md:p-6">
        <PreferenciaVeiculoSecao
          preferencias={preferencias}
          catalogo={catalogo}
        />
      </div>

      {plano.observacoes && (
        <div className="mostrador p-5 md:p-6">
          <p className="rotulo-instrumento">Observações</p>
          <p className="mt-2 txt-corpo text-cinza-texto">{plano.observacoes}</p>
        </div>
      )}
    </div>
  );
}
