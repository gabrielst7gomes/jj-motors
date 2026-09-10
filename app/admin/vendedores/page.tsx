import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getVendedores } from "@/lib/dados/admin";

export default async function VendedoresPage() {
  const vendedores = await getVendedores();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="txt-titulo text-branco">Vendedores</h1>
          <p className="mt-0.5 txt-pequeno text-cinza-texto">
            {vendedores.length} vendedor(es) cadastrado(s).
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/vendedores/novo">Novo vendedor</Link>
        </Button>
      </div>

      <div className="mostrador overflow-hidden">
        <Table className="tabela-densa">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead className="text-right">% Comissão</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendedores.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="txt-corpo font-medium">
                  {v.nome_completo}
                </TableCell>
                <TableCell className="txt-pequeno">
                  {v.telefone_e164}
                </TableCell>
                <TableCell className="txt-pequeno">
                  {v.cargos?.nome ?? "Sem cargo"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {v.cargos
                    ? `${(v.cargos.percentual_comissao * 100).toFixed(2)}%`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={v.ativo ? "confirmado" : "neutro"}>
                    {v.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {vendedores.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center txt-pequeno text-cinza-texto"
                >
                  Nenhum vendedor cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
