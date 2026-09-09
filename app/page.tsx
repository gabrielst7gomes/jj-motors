import Link from "next/link";

/**
 * Landing mínima. A navegação real depende de autenticação e role e é resolvida
 * pelo middleware (Fase 3). Por ora, apenas atalhos para as duas áreas.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          JJ Motors — Compra Programada
        </h1>
        <p className="text-muted-foreground">
          Aportes mensais que viram crédito de compra. Quando seu saldo atinge a
          meta de um veículo do estoque, ele fica disponível para você.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/app"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Área do cliente
        </Link>
        <Link
          href="/admin"
          className="inline-flex h-11 items-center justify-center rounded-md border border-input px-6 text-sm font-medium transition-colors hover:bg-accent"
        >
          Painel administrativo
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        Fase 1 — Fundação. Autenticação e telas chegam nas fases seguintes.
      </p>
    </main>
  );
}
