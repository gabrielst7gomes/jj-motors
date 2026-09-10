import Link from "next/link";

import { Dinheiro } from "@/components/dinheiro";
import { getMeuPlanoAtivo, getMinhasNegociacoes } from "@/lib/dados/cliente";

const LABEL_STATUS = {
  nova: { label: "Aguardando consultor", cor: "text-azul-claro" },
  em_andamento: { label: "Em andamento", cor: "text-azul-claro" },
  fechada: { label: "Fechada — veículo seu", cor: "text-vermelho" },
  perdida: { label: "Encerrada", cor: "text-cinza-inativo" },
} as const;

export default async function NegociacoesClientePage() {
  const plano = await getMeuPlanoAtivo();
  if (!plano) {
    return <p className="txt-corpo text-cinza-texto">Nenhum plano ativo.</p>;
  }

  const negociacoes = await getMinhasNegociacoes();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="txt-titulo">Minhas negociações</h1>
        <p className="mt-0.5 max-w-[52ch] txt-pequeno text-cinza-texto">
          Um consultor da JJ Motors fala com você pelo WhatsApp para acertar
          entrada, prazo e condições de cada veículo que você quis negociar.
        </p>
      </div>

      {negociacoes.length === 0 ? (
        <p className="txt-corpo text-cinza-texto">
          Você ainda não abriu nenhuma negociação. Escolha um veículo no{" "}
          <Link
            href="/app/estoque"
            className="border-b border-azul-claro/40 font-semibold text-azul-claro hover:border-azul-claro"
          >
            estoque
          </Link>{" "}
          e clique em &quot;Abrir negociação&quot;.
        </p>
      ) : (
        <div className="divide-y divide-white/10 border-y border-white/10">
          {negociacoes.map((n) => {
            const st = LABEL_STATUS[n.status];
            return (
              <div key={n.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <Link
                    href={`/app/veiculos/${n.veiculo_id}`}
                    className="txt-corpo font-semibold hover:text-azul-claro"
                  >
                    {n.veiculos?.marca} {n.veiculos?.modelo}
                  </Link>
                  <p className="mt-0.5 txt-pequeno text-cinza-texto">
                    {n.veiculos?.versao ? `${n.veiculos.versao} · ` : ""}
                    Aberta em{" "}
                    {new Date(n.criado_em).toLocaleDateString("pt-BR")}
                  </p>
                  {n.mensagem && (
                    <p className="mt-1 txt-pequeno text-cinza-inativo">
                      &ldquo;{n.mensagem}&rdquo;
                    </p>
                  )}
                  <p className={`mt-1.5 txt-pequeno font-semibold ${st.cor}`}>
                    {st.label}
                  </p>
                </div>
                {n.veiculos?.preco_venda_centavos != null && (
                  <Dinheiro
                    centavos={BigInt(n.veiculos.preco_venda_centavos)}
                    className="shrink-0 txt-corpo font-semibold"
                    tamanhoCentavos={false}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
