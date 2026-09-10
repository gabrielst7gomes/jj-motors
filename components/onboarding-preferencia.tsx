"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  CamposPreferencia,
  type ItemCatalogo,
} from "@/components/campos-preferencia";
import { Button } from "@/components/ui/button";
import {
  definirPreferenciaVeiculoAction,
  type EstadoPreferencia,
} from "@/lib/dados/preferencia-action";

const ESTADO_INICIAL: EstadoPreferencia = {};

function BotaoSalvar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Salvando..." : "Salvar e continuar"}
    </Button>
  );
}

/**
 * Pergunta única de onboarding — pedido do usuário: "pergunte a ele qual
 * valor da meta dele, pergunte Marca/modelo/ano do carro que ele deseja [...]
 * deixe isso gravado como CRM". Confirmado via pergunta ao usuário: aparece
 * só uma vez (quando o cliente ainda não tem preferência salva), depois fica
 * editável em "Meu plano" — não repete a cada login.
 *
 * <dialog> nativo (sem dependência de Radix Dialog, não instalada no projeto).
 */
export function OnboardingPreferencia({
  mostrar,
  catalogo,
}: {
  mostrar: boolean;
  catalogo: ItemCatalogo[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [estado, formAction] = useActionState(
    definirPreferenciaVeiculoAction,
    ESTADO_INICIAL,
  );

  useEffect(() => {
    if (mostrar && !estado.sucesso) {
      dialogRef.current?.showModal();
    }
  }, [mostrar, estado.sucesso]);

  useEffect(() => {
    if (estado.sucesso) {
      dialogRef.current?.close();
    }
  }, [estado.sucesso]);

  if (!mostrar) return null;

  return (
    <dialog
      ref={dialogRef}
      // A pergunta precisa ser respondida uma vez (pedido do usuário: "deveria
      // ficar salvo e não perguntar mais"). Não permitimos fechar sem salvar:
      //  - ESC: o evento `cancel` do <dialog> nativo é cancelado.
      //  - clique fora / no ::backdrop: sem handler de close aqui, o backdrop
      //    não fecha sozinho; nada a fazer.
      onCancel={(e) => e.preventDefault()}
      className="mostrador m-auto max-h-[92dvh] w-[min(560px,calc(100vw-1.5rem))] overflow-y-auto p-0 text-branco backdrop:bg-base/80 backdrop:backdrop-blur-sm"
      aria-labelledby="onboarding-preferencia-titulo"
    >
      <form action={formAction} className="p-6 sm:p-7">
        <p className="rotulo-instrumento">Antes de começar</p>
        <h2
          id="onboarding-preferencia-titulo"
          className="mt-2 txt-titulo text-branco"
        >
          Qual carro é a sua meta?
        </h2>
        <p className="mt-2 max-w-[46ch] txt-pequeno text-cinza-texto">
          Como o estoque gira rápido, avisamos você assim que um veículo
          parecido com o que deseja chegar — mesmo antes de você atingir os
          50% do valor. Dá para editar isso depois em &quot;Meu plano&quot;.
        </p>

        <div className="mt-6">
          <CamposPreferencia catalogo={catalogo} prefixo="onb" />
        </div>

        {estado.erro && (
          <p className="mt-4 txt-pequeno font-medium text-ambar">{estado.erro}</p>
        )}

        <div className="mt-7">
          <BotaoSalvar />
        </div>
      </form>
    </dialog>
  );
}
