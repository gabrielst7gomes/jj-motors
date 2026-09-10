import { Dinheiro } from "@/components/dinheiro";
import { StatusAporteBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAportesPendentes, getClientesComPlanos } from "@/lib/dados/admin";

import { LancarAporteForm } from "./lancar-aporte-form";
import { AcoesAporte } from "./acoes-aporte";

export default async function LancarAportePage() {
  const [planos, pendentes] = await Promise.all([
    getClientesComPlanos(),
    getAportesPendentes(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="txt-titulo text-branco">Lançar aporte</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          Novo aporte entra como pendente até ser confirmado.
        </p>
      </div>

      <LancarAporteForm planos={planos} />

      <div>
        <h2 className="mb-3 text-lg font-medium">Pendentes de confirmação</h2>
        <div className="mostrador overflow-hidden">
          <Table className="tabela-densa">
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Meio</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendentes.map((aporte) => (
                <TableRow key={aporte.id}>
                  <TableCell>
                    {aporte.planos?.profiles?.nome_completo ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {aporte.planos?.codigo ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dinheiro centavos={BigInt(aporte.valor_centavos)} />
                  </TableCell>
                  <TableCell className="capitalize">
                    {aporte.meio_pagamento}
                  </TableCell>
                  <TableCell>
                    {new Date(aporte.data_competencia).toLocaleDateString(
                      "pt-BR",
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusAporteBadge status={aporte.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <AcoesAporte aporteId={aporte.id} />
                  </TableCell>
                </TableRow>
              ))}
              {pendentes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-cinza-texto"
                  >
                    Nenhum aporte pendente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
