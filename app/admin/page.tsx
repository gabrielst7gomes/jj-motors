import { Dinheiro } from "@/components/dinheiro";
import { getDashboardAdmin } from "@/lib/dados/admin";

export default async function DashboardAdminPage() {
  const dashboard = await getDashboardAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="txt-titulo">Dashboard</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          Visão geral da Compra Programada.
        </p>
      </div>

      <div className="grid grid-cols-1 divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10 bg-superficie shadow-card sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        <div className="p-5">
          <p className="txt-pequeno text-cinza-texto">
            Total em caixa (Compra Programada)
          </p>
          <Dinheiro
            centavos={dashboard.totalEmCaixaCentavos}
            className="fonte-expandida mt-2 block txt-titulo font-extrabold"
          />
        </div>

        <div className="p-5">
          <p className="txt-pequeno text-cinza-texto">
            Aportes confirmados no mês
          </p>
          <Dinheiro
            centavos={dashboard.totalAportesMesCentavos}
            className="fonte-expandida mt-2 block txt-titulo font-extrabold"
          />
        </div>

        <div className="p-5">
          <p className="txt-pequeno text-cinza-texto">
            Clientes com plano ativo
          </p>
          <p className="fonte-expandida mt-2 txt-titulo font-extrabold tabular-nums">
            {dashboard.clientesAtivos}
          </p>
        </div>

        <div className="p-5">
          <p className="txt-pequeno text-cinza-texto">
            Veículos parados (disponíveis)
          </p>
          <p className="fonte-expandida mt-2 txt-titulo font-extrabold tabular-nums text-ambar">
            {dashboard.veiculosParados}
          </p>
        </div>
      </div>
    </div>
  );
}
