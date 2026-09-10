import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAuditLog } from "@/lib/dados/admin";

export default async function AuditoriaPage() {
  const registros = await getAuditLog();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="txt-titulo text-branco">Auditoria</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          Ações sensíveis: confirmar aporte, estornar, alterar preço, criar
          reserva, marcar como vendido.
        </p>
      </div>

      <div className="mostrador overflow-hidden">
        <Table className="tabela-densa">
          <TableHeader>
            <TableRow>
              <TableHead>Quando</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {new Date(r.criado_em).toLocaleString("pt-BR")}
                </TableCell>
                <TableCell>{r.profiles?.nome_completo ?? "sistema"}</TableCell>
                <TableCell className="font-mono text-xs">{r.acao}</TableCell>
                <TableCell className="font-mono text-xs">
                  {r.entidade}
                  {r.entidade_id ? ` · ${r.entidade_id.slice(0, 8)}` : ""}
                </TableCell>
                <TableCell className="txt-micro text-cinza-texto">
                  {r.ip ? String(r.ip) : "—"}
                </TableCell>
              </TableRow>
            ))}
            {registros.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-cinza-texto"
                >
                  Nenhum registro de auditoria ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
