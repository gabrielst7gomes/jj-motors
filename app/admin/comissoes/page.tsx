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
import { getComissoes } from "@/lib/dados/admin";

import { PagarButton } from "./pagar-button";

export default async function ComissoesPage() {
  const comissoes = await getComissoes();

  const totalPendente = comissoes
    .filter((c) => c.status === "pendente")
    .reduce((acc, c) => acc + BigInt(c.valor_centavos), 0n);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="txt-titulo text-branco">Comissões</h1>
          <p className="mt-0.5 txt-pequeno text-cinza-texto">
            Geradas automaticamente quando uma reserva é convertida em venda.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="txt-pequeno text-cinza-texto">Total pendente</p>
          <Dinheiro
            centavos={totalPendente}
            className="mt-1 block txt-subtitulo font-bold text-ambar"
          />
        </div>
      </div>

      <div className="mostrador overflow-hidden">
        <Table className="tabela-densa">
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead className="text-right">%</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comissoes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="txt-corpo">
                  {c.profiles?.nome_completo ?? "—"}
                </TableCell>
                <TableCell className="font-mono txt-micro">
                  {c.planos?.codigo ?? "—"}
                </TableCell>
                <TableCell className="txt-pequeno">
                  {c.veiculos?.marca} {c.veiculos?.modelo}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {(c.percentual * 100).toFixed(2)}%
                </TableCell>
                <TableCell className="text-right">
                  <Dinheiro
                    centavos={BigInt(c.valor_centavos)}
                    tamanhoCentavos={false}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={c.status === "paga" ? "confirmado" : "pendente"}>
                    {c.status === "paga" ? "Paga" : "Pendente"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {c.status === "pendente" && (
                    <PagarButton comissaoId={c.id} />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {comissoes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center txt-pequeno text-cinza-texto"
                >
                  Nenhuma comissão gerada ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
