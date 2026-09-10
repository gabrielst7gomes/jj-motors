"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  BadgeCheck,
  Car,
  MessageSquareText,
  ReceiptText,
  IdCard,
} from "lucide-react";

import { MarcaCompleta, LogoJJ } from "@/components/logo-jj";
import { SairButton } from "@/components/sair-button";

const LINKS = [
  { href: "/app", label: "Painel", icon: Gauge },
  { href: "/app/elegiveis", label: "Liberados", icon: BadgeCheck },
  { href: "/app/estoque", label: "Estoque", icon: Car },
  { href: "/app/negociacoes", label: "Negócios", icon: MessageSquareText },
  { href: "/app/extrato", label: "Extrato", icon: ReceiptText },
  { href: "/app/plano", label: "Plano", icon: IdCard },
] as const;

function ehAtivo(pathname: string, href: string) {
  return href === "/app"
    ? pathname === "/app"
    : pathname === href || pathname.startsWith(href + "/");
}

/**
 * Shell do cliente — mundo "instrumentação de bordo". Desktop (>=md): coluna
 * de instrumentos de 236px à esquerda, moldura direita de 1px. Mobile:
 * cabeçalho fino + console de navegação inferior fixo (ícone + rótulo, item
 * ativo com traço vermelho aceso acima).
 */
export function ShellCliente({
  nomeCompleto,
  planoCodigo,
  contadorElegiveis,
  children,
}: {
  nomeCompleto: string;
  planoCodigo: string;
  contadorElegiveis?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const primeiroNome = nomeCompleto.split(" ")[0];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Coluna de instrumentos — desktop */}
      <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col gap-9 border-r border-white/10 bg-superficie/40 p-6 md:flex">
        <MarcaCompleta />

        <nav className="flex flex-col gap-0.5">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const ativo = ehAtivo(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={
                  "group relative flex items-center gap-3 rounded-sm px-3 py-2.5 font-mostrador text-[0.8125rem] font-medium uppercase tracking-[0.06em] transition-colors duration-150 [transition-timing-function:var(--ease-out-ui)] " +
                  (ativo
                    ? "bg-white/[0.04] text-branco"
                    : "text-cinza-texto hover:bg-white/[0.02] hover:text-branco")
                }
              >
                {ativo && (
                  <span
                    className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-vermelho shadow-[0_0_8px_0_hsl(var(--vermelho)/0.7)]"
                    aria-hidden
                  />
                )}
                <Icon
                  className={
                    "h-[18px] w-[18px] shrink-0 " +
                    (ativo ? "text-vermelho" : "text-cinza-inativo")
                  }
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="flex-1">{label}</span>
                {href === "/app/elegiveis" &&
                  !!contadorElegiveis &&
                  contadorElegiveis > 0 && (
                    <span className="pill-contagem">{contadorElegiveis}</span>
                  )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <p className="txt-corpo font-semibold text-branco">{nomeCompleto}</p>
          <p className="mt-0.5 rotulo-campo">Plano {planoCodigo}</p>
          <div className="mt-3">
            <SairButton />
          </div>
        </div>
      </aside>

      {/* Cabeçalho — mobile */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-base/85 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2.5">
          <LogoJJ />
          <div className="leading-tight">
            <p className="font-mostrador text-[0.75rem] font-bold uppercase tracking-[0.14em] text-branco">
              JJ Motors
            </p>
            <p className="text-[0.625rem] uppercase tracking-[0.12em] text-cinza-inativo">
              Olá, {primeiroNome}
            </p>
          </div>
        </div>
        <SairButton />
      </header>

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 pb-28 pt-5 md:px-12 md:pb-16 md:pt-10">
        {children}
      </main>

      {/* Console de navegação — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-white/10 bg-base/90 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md md:hidden">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const ativo = ehAtivo(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? "page" : undefined}
              className="relative flex flex-col items-center gap-1 px-0.5 py-1.5"
            >
              {ativo && (
                <span
                  className="absolute inset-x-[30%] -top-1.5 h-[2px] rounded-full bg-vermelho shadow-[0_0_8px_0_hsl(var(--vermelho)/0.8)]"
                  aria-hidden
                />
              )}
              <span className="relative">
                <Icon
                  className={
                    "h-[19px] w-[19px] " +
                    (ativo ? "text-branco" : "text-cinza-inativo")
                  }
                  strokeWidth={ativo ? 2 : 1.75}
                  aria-hidden
                />
                {href === "/app/elegiveis" &&
                  !!contadorElegiveis &&
                  contadorElegiveis > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-pill bg-vermelho px-1 font-mostrador text-[0.5625rem] font-bold text-branco">
                      {contadorElegiveis}
                    </span>
                  )}
              </span>
              <span
                className={
                  "font-mostrador text-[0.5625rem] font-semibold uppercase tracking-[0.08em] " +
                  (ativo ? "text-branco" : "text-cinza-inativo")
                }
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
