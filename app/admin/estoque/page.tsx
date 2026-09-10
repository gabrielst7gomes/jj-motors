import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dinheiro } from "@/components/dinheiro";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTodosVeiculos } from "@/lib/dados/admin";

const LABEL_STATUS = {
  disponivel: { label: "Disponível", variant: "confirmado" },
  reservado: { label: "Reservado", variant: "pendente" },
  vendido: { label: "Vendido", variant: "neutro" },
  inativo: { label: "Inativo", variant: "falha" },
} as const satisfies Record<
  "disponivel" | "reservado" | "vendido" | "inativo",
  { label: string; variant: "confirmado" | "pendente" | "neutro" | "falha" }
>;

export default async function EstoqueAdminPage() {
  const veiculos = await getTodosVeiculos();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="txt-titulo">Estoque</h1>
          <p className="mt-0.5 txt-pequeno text-cinza-texto">
            {veiculos.length} veículos cadastrados.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/estoque/novo">Novo veículo</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-superficie shadow-card">
        <Table className="tabela-densa">
          <TableHeader>
            <TableRow>
              <TableHead>Veículo</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead className="text-right">Preço venda</TableHead>
              <TableHead className="text-right">Preço custo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {veiculos.map((v) => {
              const status = LABEL_STATUS[v.status] ?? LABEL_STATUS.inativo;
              return (
                <TableRow key={v.id}>
                  <TableCell>
                    <p className="txt-corpo font-medium">
                      {v.marca} {v.modelo}
                    </p>
                    <p className="txt-micro text-cinza-texto">
                      {v.versao} · {v.ano_modelo}
                    </p>
                  </TableCell>
                  <TableCell className="font-mono txt-micro">
                    {v.placa}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dinheiro
                      centavos={BigInt(v.preco_venda_centavos)}
                      tamanhoCentavos={false}
                    />
                  </TableCell>
                  <TableCell className="text-right text-cinza-texto">
                    {v.preco_custo_centavos != null ? (
                      <Dinheiro
                        centavos={BigInt(v.preco_custo_centavos)}
                        tamanhoCentavos={false}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/estoque/${v.id}`}
                      className="border-b border-azul-claro/40 txt-pequeno font-semibold text-azul-claro hover:border-azul-claro"
                    >
                      Editar
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
