import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getNotificacoes } from "@/lib/dados/admin";

import { ReenviarButton } from "./reenviar-button";

const LABEL_STATUS = {
  fila: { label: "Na fila", variant: "pendente" },
  enviada: { label: "Enviada", variant: "progresso" },
  entregue: { label: "Entregue", variant: "confirmado" },
  lida: { label: "Lida", variant: "confirmado" },
  falha: { label: "Falha", variant: "falha" },
} as const satisfies Record<
  "fila" | "enviada" | "entregue" | "lida" | "falha",
  { label: string; variant: "pendente" | "progresso" | "confirmado" | "falha" }
>;

const LABEL_TIPO: Record<string, string> = {
  novo_elegivel: "Novo elegível",
  preco_reduzido: "Preço reduzido",
  reaberto: "Reaberto",
  reserva_expirando: "Reserva expirando",
  lembrete_aporte: "Lembrete de aporte",
};

export default async function NotificacoesPage() {
  const notificacoes = await getNotificacoes();

  const contagens = notificacoes.reduce<Record<string, number>>((acc, n) => {
    acc[n.status] = (acc[n.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="txt-titulo text-branco">Notificações</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          Fila e histórico de alertas via WhatsApp. Worker de envio na Fase 6.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(LABEL_STATUS).map(([status, config]) => (
          <Badge key={status} variant={config.variant}>
            {config.label}: {contagens[status] ?? 0}
          </Badge>
        ))}
      </div>

      <div className="mostrador overflow-hidden">
        <Table className="tabela-densa">
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erro</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notificacoes.map((n) => {
              const status = LABEL_STATUS[n.status] ?? LABEL_STATUS.fila;
              return (
                <TableRow key={n.id}>
                  <TableCell>{n.profiles?.nome_completo ?? "—"}</TableCell>
                  <TableCell>
                    {n.veiculos ? `${n.veiculos.marca} ${n.veiculos.modelo}` : "—"}
                  </TableCell>
                  <TableCell>{LABEL_TIPO[n.tipo] ?? n.tipo}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-ambar">
                    {n.erro ?? "—"}
                  </TableCell>
                  <TableCell>
                    {new Date(n.criado_em).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {n.status === "falha" && (
                      <ReenviarButton notificacaoId={n.id} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {notificacoes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-cinza-texto"
                >
                  Nenhuma notificação registrada ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
