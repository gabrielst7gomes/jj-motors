"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { InputDinheiro } from "@/components/ui/input-dinheiro";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export type ItemCatalogo = {
  id: string;
  marca: string;
  modelo: string;
  ano_min: number | null;
  ano_max: number | null;
};

function rotuloCatalogo(item: ItemCatalogo): string {
  const faixa =
    item.ano_min || item.ano_max
      ? ` (${[item.ano_min, item.ano_max].filter(Boolean).join("–")})`
      : "";
  return `${item.marca} ${item.modelo}${faixa}`;
}

/**
 * Campos de "carro desejado" reaproveitados no onboarding e em "Meu plano".
 * O cliente escolhe do catálogo pré-fixado ou marca "Outro" e digita marca/
 * modelo/ano à mão (decisão do usuário: "Catálogo + opção 'outro' livre").
 *
 * Prefixo nos `id`/`htmlFor` para não colidir quando dois formulários
 * coexistem na mesma página.
 */
export function CamposPreferencia({
  catalogo,
  prefixo = "pref",
  valores,
}: {
  catalogo: ItemCatalogo[];
  prefixo?: string;
  valores?: {
    catalogoModeloId?: string | null;
    marca?: string;
    modelo?: string;
    anoMin?: number | null;
    anoMax?: number | null;
    valorMetaCentavos?: number | null;
  };
}) {
  const [modo, setModo] = useState<string>(
    valores?.catalogoModeloId
      ? valores.catalogoModeloId
      : valores?.marca
        ? "outro"
        : catalogo[0]?.id ?? "outro",
  );
  const ehOutro = modo === "outro";
  const id = (campo: string) => `${prefixo}-${campo}`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={id("catalogo")}>Modelo desejado</Label>
        <Select
          id={id("catalogo")}
          name="catalogoModeloId"
          value={ehOutro ? "" : modo}
          onChange={(e) => setModo(e.target.value || "outro")}
        >
          {catalogo.map((item) => (
            <option key={item.id} value={item.id}>
              {rotuloCatalogo(item)}
            </option>
          ))}
          <option value="">Outro (não está na lista)</option>
        </Select>
        {/* Quando "Outro", o Select acima envia catalogoModeloId vazio e os
            campos livres abaixo aparecem. */}
      </div>

      {ehOutro && (
        <>
          <div className="space-y-2">
            <Label htmlFor={id("marca")}>Marca</Label>
            <Input
              id={id("marca")}
              name="marca"
              defaultValue={valores?.marca}
              placeholder="Ex.: Renault"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={id("modelo")}>Modelo</Label>
            <Input
              id={id("modelo")}
              name="modelo"
              defaultValue={valores?.modelo}
              placeholder="Ex.: Kwid"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={id("anoMin")}>Ano (de)</Label>
            <Input
              id={id("anoMin")}
              name="anoMin"
              type="number"
              min={1990}
              max={2100}
              defaultValue={valores?.anoMin ?? ""}
              placeholder="Opcional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={id("anoMax")}>Ano (até)</Label>
            <Input
              id={id("anoMax")}
              name="anoMax"
              type="number"
              min={1990}
              max={2100}
              defaultValue={valores?.anoMax ?? ""}
              placeholder="Opcional"
            />
          </div>
        </>
      )}

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={id("valorMeta")}>Valor do carro desejado</Label>
        <InputDinheiro
          id={id("valorMeta")}
          name="valorMeta"
          defaultValueCentavos={valores?.valorMetaCentavos}
          placeholder="R$ 0,00 (opcional)"
        />
      </div>
    </div>
  );
}
