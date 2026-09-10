import { Dinheiro } from "@/components/dinheiro";
import { getMeuExtrato, getMeuPlanoAtivo } from "@/lib/dados/cliente";

const LABEL_TIPO = {
  aporte: "Aporte",
  estorno: "Estorno",
  taxa: "Taxa",
  ajuste: "Ajuste",
} as const;

const LABEL_MEIO = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  ted: "TED",
  cartao: "Cartão",
  outro: "Outro",
} as const;

/**
 * Marcador de status por FORMA, não só cor — design/IDENTIDADE.md seção 6
 * (pensado para daltônicos). Confirmado = quadrado azul-claro cheio;
 * pendente = círculo âmbar vazado; rejeitado = X âmbar.
 */
function MarcadorStatus({
  status,
}: {
  status: "confirmado" | "pendente" | "rejeitado";
}) {
  if (status === "confirmado") {
    return (
      <span
        className="absolute left-0 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-[2px] bg-azul-claro"
        aria-hidden
      />
    );
  }
  if (status === "pendente") {
    return (
      <span
        className="absolute left-0 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-ambar bg-base"
        aria-hidden
      />
    );
  }
  return (
    <span
      className="absolute left-0 top-0.5 -translate-x-1/2 txt-pequeno leading-none text-ambar"
      aria-hidden
    >
      ✕
    </span>
  );
}

const LABEL_STATUS = {
  confirmado: "Confirmado",
  pendente: "Em análise",
  rejeitado: "Rejeitado",
} as const;

export default async function ExtratoPage() {
  const plano = await getMeuPlanoAtivo();
  if (!plano) {
    return <p className="txt-corpo text-cinza-texto">Nenhum plano ativo.</p>;
  }

  const extrato = await getMeuExtrato(plano.id);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="txt-titulo">Meu extrato</h1>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          Plano {plano.codigo}
        </p>
      </div>

      {extrato.length === 0 ? (
        <p className="txt-corpo text-cinza-texto">
          Nenhum aporte lançado ainda.
        </p>
      ) : (
        <ol className="relative ml-1.5 border-l border-white/10">
          {extrato.map((aporte) => {
            const valor = BigInt(aporte.valor_centavos);
            const negativo = valor < 0n;

            return (
              <li key={aporte.id} className="relative py-4 pl-6 first:pt-0">
                <MarcadorStatus status={aporte.status} />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="txt-corpo font-semibold">
                      {LABEL_TIPO[aporte.tipo]}
                    </p>
                    <p className="mt-0.5 txt-pequeno text-cinza-texto">
                      {new Date(aporte.data_competencia).toLocaleDateString(
                        "pt-BR",
                        { day: "2-digit", month: "long", year: "numeric" },
                      )}
                    </p>
                    <p className="mt-1 txt-micro text-cinza-inativo">
                      {LABEL_STATUS[aporte.status]} · {LABEL_MEIO[aporte.meio_pagamento]}
                    </p>
                    {aporte.comprovante_url && (
                      <a
                        href={aporte.comprovante_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1.5 inline-block border-b border-azul-claro/40 txt-micro font-semibold text-azul-claro hover:border-azul-claro"
                      >
                        Ver comprovante
                      </a>
                    )}
                  </div>
                  <Dinheiro
                    centavos={valor}
                    className={
                      negativo
                        ? "shrink-0 txt-corpo font-semibold text-ambar"
                        : "shrink-0 txt-corpo font-semibold"
                    }
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
