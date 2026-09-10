import Link from "next/link";

import { Dinheiro } from "@/components/dinheiro";
import { getMeuPlanoAtivo, getMinhasNegociacoes } from "@/lib/dados/cliente";

const LABEL_STATUS = {
  nova: { label: "Aguardando consultor", cor: "text-ciano" },
  em_andamento: { label: "Em andamento", cor: "text-ciano" },
  fechada: { label: "Fechada · veículo seu", cor: "text-vermelho" },
  perdida: { label: "Encerrada", cor: "text-cinza-inativo" },
} as const;

export default async function NegociacoesClientePage() {
  const plano = await getMeuPlanoAtivo();
  if (!plano) {
    return <p className="txt-corpo text-cinza-texto">Nenhum plano ativo.</p>;
  }

  const negociacoes = await getMinhasNegociacoes();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="border-b border-white/10 pb-3">
        <h1 className="txt-titulo text-branco">Minhas negociações</h1>
        <p className="mt-1.5 max-w-[54ch] txt-pequeno text-cinza-texto">
          Um consultor da JJ Motors fala com você pelo WhatsApp para acertar
          entrada, prazo e condições de cada veículo.
        </p>
      </div>

      {negociacoes.length === 0 ? (
        <div className="mostrador p-6">
          <p className="txt-corpo text-cinza-texto">
            Você ainda não abriu nenhuma negociação. Escolha um veículo no{" "}
            <Link
              href="/app/estoque"
              className="font-semibold text-ciano hover:text-branco"
            >
              estoque
            </Link>{" "}
            e toque em &quot;Abrir negociação&quot;.
          </p>
        </div>
      ) : (
        <div className="mostrador divide-y divide-white/10 p-0">
          {negociacoes.map((n) => {
            const st = LABEL_STATUS[n.status];
            return (
              <Link
                key={n.id}
                href={`/app/veiculos/${n.veiculo_id}`}
                className="flex items-start justify-between gap-4 p-4 transition-colors duration-150 [transition-timing-function:var(--ease-out-ui)] hover:bg-white/[0.02]"
              >
                <div className="min-w-0">
                  <p className="txt-corpo font-semibold text-branco">
                    {n.veiculos?.marca} {n.veiculos?.modelo}
                  </p>
                  <p className="mt-0.5 rotulo-campo">
                    {n.veiculos?.versao ? `${n.veiculos.versao} · ` : ""}
                    {new Date(n.criado_em).toLocaleDateString("pt-BR")}
                  </p>
                  {n.mensagem && (
                    <p className="mt-1 txt-pequeno text-cinza-inativo">
                      &ldquo;{n.mensagem}&rdquo;
                    </p>
                  )}
                  <p
                    className={
                      "mt-2 font-mostrador text-[0.6875rem] font-semibold uppercase tracking-[0.08em] " +
                      st.cor
                    }
                  >
                    {st.label}
                  </p>
                </div>
                {n.veiculos?.preco_venda_centavos != null && (
                  <Dinheiro
                    centavos={BigInt(n.veiculos.preco_venda_centavos)}
                    className="shrink-0 font-mostrador text-[0.9375rem] font-semibold text-branco"
                    tamanhoCentavos={false}
                  />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
