import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCargos } from "@/lib/dados/admin";

import { NovoCargoForm } from "./novo-cargo-form";

export default async function CargosPage() {
  const cargos = await getCargos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="txt-titulo text-branco">Cargos</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          Cada cargo define o percentual de comissão e as permissões dos
          vendedores atribuídos a ele.
        </p>
      </div>

      <NovoCargoForm />

      <div className="mostrador overflow-hidden">
        <Table className="tabela-densa">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">% Comissão</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargos.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {(c.percentual_comissao * 100).toFixed(2)}%
                </TableCell>
                <TableCell className="text-cinza-texto">
                  {c.descricao ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/cargos/${c.id}`}
                    className="text-sm text-ciano underline underline-offset-2"
                  >
                    Permissões
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {cargos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-cinza-texto"
                >
                  Nenhum cargo cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
