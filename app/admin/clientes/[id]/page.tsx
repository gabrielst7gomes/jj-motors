import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Dinheiro } from "@/components/dinheiro";
import { StatusAporteBadge, StatusPlanoBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getElegibilidadePlano,
  getExtratoPlano,
  getPlanoPorId,
  getSaldoPlano,
  getVendedores,
} from "@/lib/dados/admin";
import { getTaxaJurosGlobal } from "@/lib/dados/taxa-juros";
import { createClient } from "@/lib/supabase/server";

import { TaxaJurosPlanoForm } from "./taxa-juros-form";
import { VendedorForm } from "./vendedor-form";

export default async function DetalhePlanoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const plano = await getPlanoPorId(id);
  if (!plano) notFound();

  const supabase = await createClient();
  const [saldo, elegibilidade, extrato, taxaGlobal, vendedores] =
    await Promise.all([
      getSaldoPlano(id),
      getElegibilidadePlano(id),
      getExtratoPlano(id),
      getTaxaJurosGlobal(supabase),
      getVendedores(),
    ]);

  const elegiveis = elegibilidade.filter((v) => v.elegivel);

  return (
    <div className="space-y-9">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="txt-titulo">
            {plano.profiles?.nome_completo ?? "—"}
          </h1>
          <p className="mt-0.5 txt-pequeno text-cinza-texto">
            {plano.codigo} · {plano.profiles?.telefone_e164}
          </p>
        </div>
        <StatusPlanoBadge status={plano.status} />
      </div>

      <div className="grid grid-cols-1 divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10 bg-superficie shadow-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="txt-pequeno text-cinza-texto">Saldo confirmado</p>
          <Dinheiro
            centavos={BigInt(saldo?.saldo_confirmado_centavos ?? 0)}
            className="fonte-expandida mt-2 block txt-subtitulo font-bold"
          />
        </div>
        <div className="p-5">
          <p className="txt-pequeno text-cinza-texto">Saldo pendente</p>
          <Dinheiro
            centavos={BigInt(saldo?.saldo_pendente_centavos ?? 0)}
            className="fonte-expandida mt-2 block txt-subtitulo font-bold"
          />
        </div>
        <div className="p-5">
          <p className="txt-pequeno text-cinza-texto">Veículos elegíveis</p>
          <p className="fonte-expandida mt-2 txt-subtitulo font-bold tabular-nums">
            {elegiveis.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <p className="border-b border-white/10 pb-2.5 txt-pequeno text-cinza-texto">
            Taxa de juros da promissória
          </p>
          <div className="pt-4">
            <TaxaJurosPlanoForm
              planoId={plano.id}
              taxaAtual={plano.taxa_juros_mensal}
              taxaGlobal={taxaGlobal}
            />
          </div>
        </div>

        <div>
          <p className="border-b border-white/10 pb-2.5 txt-pequeno text-cinza-texto">
            Vendedor responsável
          </p>
          <div className="pt-4">
            <VendedorForm
              planoId={plano.id}
              vendedorAtualId={plano.vendedor_id}
              vendedores={vendedores}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="txt-subtitulo">Elegibilidade por veículo</h2>
        <div className="mt-3 border border-white/10">
          <Table className="tabela-densa">
            <TableHeader>
              <TableRow>
                <TableHead>Veículo</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Falta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {elegibilidade.map((v) => (
                <TableRow key={v.veiculo_id}>
                  <TableCell className="txt-corpo">
                    {v.marca} {v.modelo}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dinheiro
                      centavos={BigInt(v.preco_venda_centavos ?? 0)}
                      tamanhoCentavos={false}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Dinheiro
                      centavos={BigInt(v.meta_centavos ?? 0)}
                      tamanhoCentavos={false}
                    />
                  </TableCell>
                  <TableCell>
                    {v.elegivel ? (
                      <Badge variant="elegivel">Elegível</Badge>
                    ) : (
                      <Badge variant="neutro">Não elegível</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dinheiro
                      centavos={BigInt(v.valor_faltante_centavos ?? 0)}
                      tamanhoCentavos={false}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className="txt-subtitulo">Extrato</h2>
        <div className="mt-3 border border-white/10">
          <Table className="tabela-densa">
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Competência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extrato.map((aporte) => (
                <TableRow key={aporte.id}>
                  <TableCell className="txt-corpo capitalize">
                    {aporte.tipo}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dinheiro
                      centavos={BigInt(aporte.valor_centavos)}
                      tamanhoCentavos={false}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusAporteBadge status={aporte.status} />
                  </TableCell>
                  <TableCell className="txt-pequeno">
                    {new Date(aporte.data_competencia).toLocaleDateString(
                      "pt-BR",
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
