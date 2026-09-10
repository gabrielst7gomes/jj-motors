import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Dinheiro } from "@/components/dinheiro";
import { StatusPlanoBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getClientesComPlanos } from "@/lib/dados/admin";
import { createClient } from "@/lib/supabase/server";

export default async function ClientesPlanosPage() {
  const planos = await getClientesComPlanos();

  const supabase = await createClient();
  const { data: saldos } = await supabase
    .from("vw_saldo_cliente")
    .select("plano_id, saldo_confirmado_centavos");
  const saldoPorPlano = new Map(
    (saldos ?? []).map((s) => [s.plano_id, s.saldo_confirmado_centavos ?? 0]),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="txt-titulo text-branco">Clientes e planos</h1>
          <p className="mt-0.5 txt-pequeno text-cinza-texto">
            {planos.length} planos cadastrados.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/clientes/novo">Novo cliente</Link>
        </Button>
      </div>

      <div className="mostrador overflow-hidden">
        <Table className="tabela-densa">
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Saldo confirmado</TableHead>
              <TableHead>Adesão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {planos.map((plano) => (
              <TableRow key={plano.id}>
                <TableCell>
                  <p className="txt-corpo font-medium">
                    {plano.profiles?.nome_completo ?? "—"}
                  </p>
                  <p className="txt-micro text-cinza-texto">
                    {plano.profiles?.telefone_e164}
                  </p>
                </TableCell>
                <TableCell className="font-mono txt-micro">
                  {plano.codigo}
                </TableCell>
                <TableCell>
                  <StatusPlanoBadge status={plano.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Dinheiro
                    centavos={BigInt(saldoPorPlano.get(plano.id) ?? 0)}
                    tamanhoCentavos={false}
                  />
                </TableCell>
                <TableCell className="txt-pequeno">
                  {new Date(plano.data_adesao).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/clientes/${plano.id}`}
                    className="border-b border-ciano/40 txt-pequeno font-semibold text-ciano hover:border-ciano"
                  >
                    Ver detalhes
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
