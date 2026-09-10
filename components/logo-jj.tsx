import { cn } from "@/lib/utils";

/**
 * Monograma "JJ" — a unidade mínima de marca (design/IDENTIDADE.md V2).
 * Quadrado com gradiente vermelho e cantos arredondados, "JJ" em Archivo
 * Expanded 800 branco. Reaproveitado no favicon e nos ícones PWA (nesses
 * contextos usar a versão sólida, sem sombra — ver seção 7 de ativos).
 */
export function LogoJJ({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid h-[38px] w-[38px] shrink-0 place-items-center rounded-sm gradiente-vermelho shadow-vermelho fonte-expandida txt-corpo font-extrabold text-branco",
        className,
      )}
      aria-hidden
    >
      JJ
    </div>
  );
}

/** Bloco completo: monograma + "JJ MOTORS" + subtítulo "Compra Programada". */
export function MarcaCompleta() {
  return (
    <div className="flex items-center gap-[11px]">
      <LogoJJ />
      <div className="leading-tight">
        <p className="fonte-expandida txt-pequeno font-bold tracking-wide">
          JJ MOTORS
        </p>
        <p className="txt-micro text-cinza-texto">Compra Programada</p>
      </div>
    </div>
  );
}
