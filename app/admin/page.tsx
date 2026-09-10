import { Dinheiro } from "@/components/dinheiro";
import { getDashboardAdmin } from "@/lib/dados/admin";

export default async function DashboardAdminPage() {
  const d = await getDashboardAdmin();

  const mostradores = [
    {
      rotulo: "Total em caixa",
      valor: (
        <Dinheiro
          centavos={d.totalEmCaixaCentavos}
          className="leitura leitura-lg block text-branco"
          tamanhoCentavos={false}
        />
      ),
    },
    {
      rotulo: "Aportes no mês",
      valor: (
        <Dinheiro
          centavos={d.totalAportesMesCentavos}
          className="leitura leitura-lg block text-ciano"
          tamanhoCentavos={false}
        />
      ),
    },
    {
      rotulo: "Clientes ativos",
      valor: (
        <span className="leitura leitura-lg block text-branco">
          {d.clientesAtivos}
        </span>
      ),
    },
    {
      rotulo: "Veículos parados",
      valor: (
        <span className="leitura leitura-lg block text-ambar">
          {d.veiculosParados}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="border-b border-white/10 pb-3 txt-titulo text-branco">
        Painel
      </h1>

      <div className="mostrador grid grid-cols-1 divide-y divide-white/10 overflow-hidden sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {mostradores.map((m) => (
          <div key={m.rotulo} className="p-5">
            <p className="rotulo-instrumento">{m.rotulo}</p>
            <div className="mt-2.5">{m.valor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
