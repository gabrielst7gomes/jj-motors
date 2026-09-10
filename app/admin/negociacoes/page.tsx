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
import { getNegociacoes } from "@/lib/dados/admin";
import { linkWhatsApp, mensagemNegociacao } from "@/lib/whatsapp/link";

import { AcoesNegociacao } from "./acoes-negociacao";

const LABEL_STATUS = {
  nova: { label: "Aguardando", variant: "progresso" },
  em_andamento: { label: "Em andamento", variant: "pendente" },
  fechada: { label: "Vendido", variant: "confirmado" },
  perdida: { label: "Encerrada", variant: "neutro" },
} as const satisfies Record<
  "nova" | "em_andamento" | "fechada" | "perdida",
  { label: string; variant: "progresso" | "pendente" | "confirmado" | "neutro" }
>;

export default async function NegociacoesPage() {
  const negociacoes = await getNegociacoes();
  const abertas = negociacoes.filter(
    (n) => n.status === "nova" || n.status === "em_andamento",
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="txt-titulo">Negociações</h1>
        <p className="mt-0.5 max-w-[62ch] txt-pequeno text-cinza-texto">
          Clientes que sinalizaram interesse num veículo. Vários clientes podem
          negociar o mesmo carro — nada fica travado. Atenda pelo WhatsApp e,
          ao fechar, marque como vendido (gera a comissão do vendedor
          vinculado). {abertas} em aberto.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-superficie shadow-card">
        <Table className="tabela-densa">
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aberta em</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {negociacoes.map((n) => {
              const st = LABEL_STATUS[n.status] ?? LABEL_STATUS.nova;
              const cliente = n.cliente;
              const veiculo = n.veiculos;
              const wa =
                cliente?.telefone_e164 && veiculo
                  ? linkWhatsApp(
                      cliente.telefone_e164,
                      mensagemNegociacao({
                        nomeCliente: cliente.nome_completo,
                        marca: veiculo.marca,
                        modelo: veiculo.modelo,
                      }),
                    )
                  : null;
              return (
                <TableRow key={n.id}>
                  <TableCell>
                    <p className="txt-corpo font-medium">
                      {cliente?.nome_completo ?? "—"}
                    </p>
                    {n.mensagem && (
                      <p className="mt-0.5 max-w-[28ch] truncate txt-micro text-cinza-texto">
                        &ldquo;{n.mensagem}&rdquo;
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {veiculo?.marca} {veiculo?.modelo}
                    <span className="block txt-micro text-cinza-texto">
                      {veiculo?.versao}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {veiculo?.preco_venda_centavos != null && (
                      <Dinheiro
                        centavos={BigInt(veiculo.preco_venda_centavos)}
                        tamanhoCentavos={false}
                      />
                    )}
                  </TableCell>
                  <TableCell className="txt-pequeno text-cinza-texto">
                    {n.vendedor?.nome_completo ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </TableCell>
                  <TableCell className="txt-pequeno text-cinza-texto">
                    {new Date(n.criado_em).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {wa ? (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 border-b border-azul-claro/40 txt-pequeno font-semibold text-azul-claro hover:border-azul-claro"
                      >
                        Abrir conversa
                      </a>
                    ) : (
                      <span className="txt-micro text-cinza-inativo">
                        sem telefone
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <AcoesNegociacao negociacaoId={n.id} status={n.status} />
                  </TableCell>
                </TableRow>
              );
            })}
            {negociacoes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  Nenhuma negociação ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
