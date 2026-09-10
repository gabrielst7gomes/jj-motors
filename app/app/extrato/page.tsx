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

const LABEL_STATUS = {
  confirmado: "Confirmado",
  pendente: "Em análise",
  rejeitado: "Rejeitado",
} as const;

/**
 * Marcador de status por FORMA além de cor (daltônicos). Confirmado =
 * quadrado ciano; pendente = triângulo âmbar; rejeitado = X âmbar.
 */
function MarcadorStatus({
  status,
}: {
  status: "confirmado" | "pendente" | "rejeitado";
}) {
  if (status === "confirmado") {
    return (
      <span
        className="absolute left-0 top-[7px] h-2 w-2 -translate-x-1/2 bg-ciano"
        aria-hidden
      />
    );
  }
  if (status === "pendente") {
    return (
      <span
        className="absolute left-0 top-1.5 h-0 w-0 -translate-x-1/2 border-x-[4px] border-b-[7px] border-x-transparent border-b-ambar"
        aria-hidden
      />
    );
  }
  return (
    <span
      className="absolute left-0 top-0.5 -translate-x-1/2 text-[0.8125rem] leading-none text-ambar"
      aria-hidden
    >
      ✕
    </span>
  );
}

export default async function ExtratoPage() {
  const plano = await getMeuPlanoAtivo();
  if (!plano) {
    return <p className="txt-corpo text-cinza-texto">Nenhum plano ativo.</p>;
  }

  const extrato = await getMeuExtrato(plano.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-3">
        <h1 className="txt-titulo text-branco">Extrato</h1>
        <p className="rotulo-campo">Plano {plano.codigo}</p>
      </div>

      {extrato.length === 0 ? (
        <div className="mostrador p-6">
          <p className="txt-corpo text-cinza-texto">
            Nenhum aporte lançado ainda.
          </p>
        </div>
      ) : (
        <div className="mostrador p-5 md:p-6">
          <ol className="relative ml-1.5 border-l border-white/12">
            {extrato.map((aporte) => {
              const valor = BigInt(aporte.valor_centavos);
              const negativo = valor < 0n;
              return (
                <li
                  key={aporte.id}
                  className="relative py-4 pl-6 first:pt-0 last:pb-0"
                >
                  <MarcadorStatus status={aporte.status} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="txt-corpo font-semibold text-branco">
                        {LABEL_TIPO[aporte.tipo]}
                      </p>
                      <p className="mt-0.5 txt-pequeno text-cinza-texto">
                        {new Date(aporte.data_competencia).toLocaleDateString(
                          "pt-BR",
                          { day: "2-digit", month: "long", year: "numeric" },
                        )}
                      </p>
                      <p className="mt-1 rotulo-campo">
                        {LABEL_STATUS[aporte.status]} ·{" "}
                        {LABEL_MEIO[aporte.meio_pagamento]}
                      </p>
                      {aporte.comprovante_url && (
                        <a
                          href={aporte.comprovante_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1.5 inline-block font-mostrador text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ciano hover:text-branco"
                        >
                          Ver comprovante
                        </a>
                      )}
                    </div>
                    <Dinheiro
                      centavos={valor}
                      className={
                        "shrink-0 font-mostrador text-[0.9375rem] font-semibold " +
                        (negativo ? "text-ambar" : "text-branco")
                      }
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
