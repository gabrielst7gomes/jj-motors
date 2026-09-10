"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  CamposPreferencia,
  type ItemCatalogo,
} from "@/components/campos-preferencia";
import { Button } from "@/components/ui/button";
import { Dinheiro } from "@/components/dinheiro";
import {
  definirPreferenciaVeiculoAction,
  removerPreferenciaVeiculoAction,
  type EstadoPreferencia,
} from "@/lib/dados/preferencia-action";

const ESTADO_INICIAL: EstadoPreferencia = {};

type Preferencia = {
  id: string;
  marca: string;
  modelo: string;
  ano_min: number | null;
  ano_max: number | null;
  valor_meta_centavos: number | null;
  observacoes: string | null;
  catalogo_modelo_id: string | null;
};

function BotaoSalvar({ texto = "Salvar" }: { texto?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

function BotaoRemover() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destrutivo" size="sm" disabled={pending}>
      {pending ? "Removendo..." : "Remover"}
    </Button>
  );
}

function LinhaPreferencia({ preferencia }: { preferencia: Preferencia }) {
  const [estado, formAction] = useActionState(
    removerPreferenciaVeiculoAction,
    ESTADO_INICIAL,
  );
  const faixaAno =
    preferencia.ano_min || preferencia.ano_max
      ? [preferencia.ano_min, preferencia.ano_max].filter(Boolean).join(" – ")
      : null;

  return (
    <div className="flex flex-col gap-3 border-b border-white/10 py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="txt-corpo font-semibold">
          {preferencia.marca} {preferencia.modelo}
          {preferencia.catalogo_modelo_id && (
            <span className="ml-2 txt-micro font-semibold text-azul-claro">
              do catálogo
            </span>
          )}
        </p>
        <p className="mt-0.5 txt-pequeno text-cinza-texto">
          {faixaAno ? `Ano ${faixaAno}` : "Qualquer ano"}
          {preferencia.valor_meta_centavos ? (
            <>
              {" · "}
              <Dinheiro
                centavos={BigInt(preferencia.valor_meta_centavos)}
                className="inline txt-pequeno"
                tamanhoCentavos={false}
              />
            </>
          ) : null}
        </p>
        {preferencia.observacoes && (
          <p className="mt-1 txt-pequeno text-cinza-inativo">
            {preferencia.observacoes}
          </p>
        )}
        {estado.erro && (
          <p className="mt-1 txt-pequeno text-ambar">{estado.erro}</p>
        )}
      </div>
      <form action={formAction} className="shrink-0">
        <input type="hidden" name="preferenciaId" value={preferencia.id} />
        <BotaoRemover />
      </form>
    </div>
  );
}

/**
 * Editor da preferência de veículo (CRM) em "Meu plano" — pergunta única no
 * onboarding, editável aqui depois. Ver components/onboarding-preferencia.tsx
 * para a primeira captura e components/campos-preferencia.tsx para os campos.
 */
export function PreferenciaVeiculoSecao({
  preferencias,
  catalogo,
}: {
  preferencias: Preferencia[];
  catalogo: ItemCatalogo[];
}) {
  const [mostrarForm, setMostrarForm] = useState(preferencias.length === 0);
  const [estado, formAction] = useActionState(
    definirPreferenciaVeiculoAction,
    ESTADO_INICIAL,
  );

  useEffect(() => {
    if (estado.sucesso) {
      setMostrarForm(false);
    }
  }, [estado.sucesso]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
        <p className="txt-pequeno text-cinza-texto">
          Carro desejado (avisamos você quando chegar um parecido)
        </p>
        {preferencias.length > 0 && !mostrarForm && (
          <button
            type="button"
            onClick={() => setMostrarForm(true)}
            className="txt-pequeno font-semibold text-azul-claro hover:underline"
          >
            + Adicionar
          </button>
        )}
      </div>

      {preferencias.length > 0 && (
        <div className="mt-2">
          {preferencias.map((p) => (
            <LinhaPreferencia key={p.id} preferencia={p} />
          ))}
        </div>
      )}

      {preferencias.length === 0 && !mostrarForm && (
        <p className="mt-3 txt-pequeno text-cinza-texto">
          Nenhuma preferência registrada ainda.
        </p>
      )}

      {mostrarForm && (
        <form
          action={formAction}
          className="mt-4 rounded-2xl border border-white/10 bg-elevado/60 p-4 sm:p-5"
        >
          <CamposPreferencia catalogo={catalogo} prefixo="plano" />
          {estado.erro && (
            <p className="mt-3 txt-pequeno text-ambar">{estado.erro}</p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <BotaoSalvar texto="Salvar preferência" />
            {preferencias.length > 0 && (
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="txt-pequeno text-cinza-texto hover:text-branco"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
