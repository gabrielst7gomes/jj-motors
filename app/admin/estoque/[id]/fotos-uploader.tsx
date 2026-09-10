"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  uploadFotoVeiculo,
  removerFotoVeiculo,
  definirFotoCapa,
  type EstadoUploadFoto,
} from "../fotos-actions";

const ESTADO_INICIAL: EstadoUploadFoto = {};

type Foto = { id: string; url: string; capa: boolean };

function BotaoEnviar() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Enviando..." : "Enviar foto"}
    </Button>
  );
}

export function FotosUploader({
  veiculoId,
  fotos,
}: {
  veiculoId: string;
  fotos: Foto[];
}) {
  const uploadAction = uploadFotoVeiculo.bind(null, veiculoId);
  const [estado, formAction] = useActionState(uploadAction, ESTADO_INICIAL);

  return (
    <div className="space-y-4">
      <form action={formAction} className="flex items-end gap-2">
        <Input name="foto" type="file" accept="image/png,image/jpeg,image/webp" required />
        <BotaoEnviar />
      </form>
      {estado.erro && <p className="text-sm text-ambar">{estado.erro}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {fotos.map((foto) => (
          <div key={foto.id} className="group relative overflow-hidden rounded-md border">
            <Image
              src={foto.url}
              alt=""
              width={200}
              height={150}
              className="aspect-[4/3] w-full object-cover"
            />
            {foto.capa && (
              <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                Capa
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-black/40 p-1 opacity-0 group-hover:opacity-100">
              {!foto.capa && (
                <button
                  type="button"
                  title="Definir como capa"
                  onClick={() => definirFotoCapa(foto.id, veiculoId)}
                  className="rounded bg-white/90 p-1"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                title="Remover"
                onClick={() => removerFotoVeiculo(foto.id, veiculoId)}
                className="rounded bg-white/90 p-1"
              >
                <Trash2 className="h-3.5 w-3.5 text-vinho-contorno" />
              </button>
            </div>
          </div>
        ))}
        {fotos.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">
            Nenhuma foto cadastrada.
          </p>
        )}
      </div>
    </div>
  );
}
