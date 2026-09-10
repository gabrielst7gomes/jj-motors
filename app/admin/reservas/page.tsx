import { Badge } from "@/components/ui/badge";
import { Dinheiro } from "@/components/dinheiro";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getReservas } from "@/lib/dados/admin";

import { ConverterButton } from "./converter-button";

const LABEL_STATUS = {
  ativa: { label: "Ativa", variant: "progresso" },
  expirada: { label: "Expirada", variant: "neutro" },
  convertida: { label: "Convertida", variant: "confirmado" },
  cancelada: { label: "Cancelada", variant: "falha" },
} as const satisfies Record<
  "ativa" | "expirada" | "convertida" | "cancelada",
  { label: string; variant: "progresso" | "neutro" | "confirmado" | "falha" }
>;

export default async function ReservasPage() {
  const reservas = await getReservas();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="txt-titulo">Reservas e propostas</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          Gestão do funil de aquisição. Expiração automática via cron (Fase 5).
          Vender exige uma reserva ativa — é ela que liga a venda ao plano e,
          por tabela, ao vendedor que recebe a comissão.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-superficie shadow-card">
        <Table className="tabela-densa">
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservas.map((r) => {
              const status = LABEL_STATUS[r.status] ?? LABEL_STATUS.ativa;
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    {r.planos?.profiles?.nome_completo ?? "—"}
                  </TableCell>
                  <TableCell>
                    {r.veiculos?.marca} {r.veiculos?.modelo}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.veiculos?.preco_venda_centavos != null && (
                      <Dinheiro
                        centavos={BigInt(r.veiculos.preco_venda_centavos)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(r.expira_em).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {new Date(r.criado_em).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "ativa" && (
                      <ConverterButton reservaId={r.id} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {reservas.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  Nenhuma reserva ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
