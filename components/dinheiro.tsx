import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";

/**
 * Exibe um valor monetário já calculado. Este componente NUNCA recebe number
 * nem faz conta de dinheiro — só formata a STRING (não o valor) para separar
 * visualmente os centavos, que ficam menores e em cinza-texto (design/
 * IDENTIDADE.md seção 4.2). O parsing de negócio continua 100% em formatBRL.
 */
export function Dinheiro({
  centavos,
  className,
  tamanhoCentavos = true,
}: {
  centavos: bigint;
  className?: string;
  /** false = não reduz os centavos (útil em contextos muito compactos). */
  tamanhoCentavos?: boolean;
}) {
  const formatado = formatBRL(centavos);

  if (!tamanhoCentavos) {
    return <span className={cn("valor-monetario", className)}>{formatado}</span>;
  }

  const virgula = formatado.lastIndexOf(",");
  const inteiro = formatado.slice(0, virgula);
  const centavosStr = formatado.slice(virgula + 1);

  return (
    <span className={cn("valor-monetario", className)}>
      {inteiro},<span className="centavos">{centavosStr}</span>
    </span>
  );
}
