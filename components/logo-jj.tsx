import { cn } from "@/lib/utils";

/**
 * Monograma "JJ" — unidade mínima de marca. No mundo "instrumentação de
 * bordo" é uma placa: quadrado de canto técnico, moldura vermelha fina +
 * glow curto, "JJ" em Chakra Petch. Lê como um selo de painel, não um ícone
 * de app.
 */
export function LogoJJ({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-vermelho/60 bg-vermelho/12 font-mostrador text-sm font-bold tracking-[0.02em] text-branco shadow-[0_0_12px_-2px_hsl(var(--vermelho)/0.55)]",
        className,
      )}
      aria-hidden
    >
      JJ
    </div>
  );
}

/** Bloco completo: placa + "JJ MOTORS" + subtítulo "Compra Programada". */
export function MarcaCompleta() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoJJ />
      <div className="leading-tight">
        <p className="font-mostrador text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-branco">
          JJ Motors
        </p>
        <p className="text-[0.625rem] uppercase tracking-[0.14em] text-cinza-inativo">
          Compra Programada
        </p>
      </div>
    </div>
  );
}
