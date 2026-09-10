import { redirect } from "next/navigation";

import { OnboardingPreferencia } from "@/components/onboarding-preferencia";
import { ShellCliente } from "@/components/shell-cliente";
import {
  getCatalogoModelosAtivos,
  getMeuPlanoAtivo,
  getMeuProfile,
  getMinhaElegibilidade,
  getMinhasPreferenciasVeiculo,
} from "@/lib/dados/cliente";

export default async function AreaClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getMeuProfile();
  if (!profile) {
    redirect("/login");
  }

  const plano = await getMeuPlanoAtivo();
  const [elegibilidade, preferencias, catalogo] = await Promise.all([
    plano ? getMinhaElegibilidade(plano.id) : Promise.resolve([]),
    plano ? getMinhasPreferenciasVeiculo(plano.id) : Promise.resolve([]),
    plano ? getCatalogoModelosAtivos() : Promise.resolve([]),
  ]);
  const contadorElegiveis = elegibilidade.filter((v) => v.elegivel).length;

  return (
    <ShellCliente
      nomeCompleto={profile.nome_completo}
      planoCodigo={plano?.codigo ?? "—"}
      contadorElegiveis={contadorElegiveis}
    >
      {children}
      {plano && (
        <OnboardingPreferencia
          mostrar={preferencias.length === 0}
          catalogo={catalogo}
        />
      )}
    </ShellCliente>
  );
}
