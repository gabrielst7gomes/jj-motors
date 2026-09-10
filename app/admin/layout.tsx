import { redirect } from "next/navigation";
import type { Route } from "next";

import { ShellAdmin, type LinkAdmin } from "@/components/shell-admin";
import { createClient } from "@/lib/supabase/server";
import { getMinhasPermissoes, temPermissao } from "@/lib/dados/permissoes";

type LinkComRegra = LinkAdmin & {
  permissao: string | null;
  soStaff?: boolean;
  // Sempre visível para vendedor (mesmo sem a permissão): a tela filtra por RLS
  // o que ele pode ver (ex.: só as negociações / comissões dos clientes dele).
  sempreVendedor?: boolean;
};

const LINKS: LinkComRegra[] = [
  { href: "/admin" as Route, label: "Dashboard", permissao: null },
  { href: "/admin/clientes" as Route, label: "Clientes e planos", permissao: "clientes.criar" },
  { href: "/admin/aportes" as Route, label: "Lançar aporte", permissao: "aportes.confirmar" },
  { href: "/admin/estoque" as Route, label: "Estoque", permissao: "estoque.editar" },
  { href: "/admin/catalogo" as Route, label: "Catálogo de modelos", permissao: "estoque.editar" },
  { href: "/admin/negociacoes" as Route, label: "Negociações", permissao: "reservas.gerenciar", sempreVendedor: true },
  { href: "/admin/vendedores" as Route, label: "Vendedores", permissao: null, soStaff: true },
  { href: "/admin/cargos" as Route, label: "Cargos", permissao: null, soStaff: true },
  { href: "/admin/comissoes" as Route, label: "Comissões", permissao: null },
  { href: "/admin/notificacoes" as Route, label: "Notificações", permissao: "notificacoes.gerenciar" },
  { href: "/admin/auditoria" as Route, label: "Auditoria", permissao: null, soStaff: true },
  { href: "/admin/configuracoes" as Route, label: "Configurações", permissao: "juros.editar" },
];

export default async function PainelAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome_completo, papel")
    .eq("id", user.id)
    .single();

  const ehStaff = profile?.papel === "admin" || profile?.papel === "operador";
  const ehVendedor = profile?.papel === "vendedor";

  if (!profile || (!ehStaff && !ehVendedor)) {
    redirect("/app");
  }

  const permissoes = await getMinhasPermissoes(supabase);

  const linksVisiveis = LINKS.filter((link) => {
    if (link.soStaff) return ehStaff;
    if (link.sempreVendedor && ehVendedor) return true;
    if (!link.permissao) return true;
    return temPermissao(permissoes, link.permissao);
  });

  return (
    <ShellAdmin
      nomeCompleto={profile.nome_completo}
      papel={profile.papel}
      links={linksVisiveis}
    >
      {children}
    </ShellAdmin>
  );
}
