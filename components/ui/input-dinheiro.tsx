"use client";

import * as React from "react";

import { formatBRL } from "@/lib/money";
import { Input, type InputProps } from "@/components/ui/input";

/**
 * Input de dinheiro com máscara BRL ao vivo — pedido do usuário: "coloque o
 * formato em dinheiro, com R$ vírgula e ponto, de acordo com o valor
 * adicionado". Acúmulo estilo maquininha: cada dígito digitado entra pelos
 * centavos e empurra os anteriores para a esquerda (9 → R$ 0,09; 95 → R$
 * 0,95; 9500000 → R$ 95.000,00).
 *
 * Mantém DOIS valores no DOM:
 *  - o <input> visível, controlado, com o texto formatado;
 *  - um <input type="hidden" name={name}> com o número cru em reais
 *    ("95000.00"), que é o que o schema Zod (parseBRL) recebe no submit.
 *
 * `defaultValueCentavos` permite pré-preencher (edição de preferência).
 */
export function InputDinheiro({
  name,
  defaultValueCentavos,
  onCentavosChange,
  ...props
}: Omit<InputProps, "value" | "defaultValue" | "type" | "inputMode" | "name"> & {
  name: string;
  defaultValueCentavos?: number | bigint | null;
  onCentavosChange?: (centavos: bigint) => void;
}) {
  const [centavos, setCentavos] = React.useState<bigint>(() =>
    defaultValueCentavos != null ? BigInt(defaultValueCentavos) : 0n,
  );

  const texto = centavos > 0n ? formatBRL(centavos) : "";

  // Valor cru para o schema (parseBRL): reais com vírgula decimal e 2 casas,
  // ex.: "95000,00". parseBRL só aceita "," como separador decimal.
  const valorCru =
    centavos > 0n
      ? `${(centavos / 100n).toString()},${(centavos % 100n)
          .toString()
          .padStart(2, "0")}`
      : "";

  function aoDigitar(e: React.ChangeEvent<HTMLInputElement>) {
    const soDigitos = e.target.value.replace(/\D/g, "").slice(0, 15);
    const novo = soDigitos === "" ? 0n : BigInt(soDigitos);
    setCentavos(novo);
    onCentavosChange?.(novo);
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
    // Backspace remove o último dígito (divide por 10), independente da
    // posição do cursor — o campo se comporta como um acumulador, não como
    // texto livre.
    if (e.key === "Backspace") {
      e.preventDefault();
      const novo = centavos / 10n;
      setCentavos(novo);
      onCentavosChange?.(novo);
    }
  }

  return (
    <>
      <Input
        {...props}
        inputMode="numeric"
        value={texto}
        onChange={aoDigitar}
        onKeyDown={aoTeclar}
        placeholder={props.placeholder ?? "R$ 0,00"}
      />
      <input type="hidden" name={name} value={valorCru} />
    </>
  );
}
