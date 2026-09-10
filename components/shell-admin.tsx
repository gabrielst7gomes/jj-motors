"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Menu, X } from "lucide-react";

import { MarcaCompleta } from "@/components/logo-jj";
import { SairButton } from "@/components/sair-button";

export type LinkAdmin = { href: Route; label: string };

function ehAtivo(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(href + "/");
}

/**
 * Shell do admin — mundo "instrumentação de bordo". Coluna de instrumentos
 * fixa de 236px em desktop; abaixo de md, cabeçalho com botão de menu que
 * abre um painel lateral deslizante (a lista de rotas do admin é longa
 * demais para nav inline).
 */
export function ShellAdmin({
  nomeCompleto,
  papel,
  links,
  children,
}: {
  nomeCompleto: string;
  papel: string;
  links: LinkAdmin[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    if (menuAberto) {
      const anterior = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = anterior;
      };
    }
  }, [menuAberto]);

  const listaLinks = (
    <nav className="flex flex-col gap-0.5">
      {links.map((link) => {
        const ativo = ehAtivo(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={ativo ? "page" : undefined}
            className={
              "relative rounded-sm px-3 py-2.5 font-mostrador text-[0.75rem] font-medium uppercase tracking-[0.06em] transition-colors duration-150 [transition-timing-function:var(--ease-out-ui)] " +
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
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Coluna de instrumentos — desktop */}
      <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col gap-7 border-r border-white/10 bg-superficie/40 p-6 md:flex">
        <MarcaCompleta />
        <div className="min-h-0 flex-1 overflow-y-auto">{listaLinks}</div>
        <div className="border-t border-white/10 pt-4">
          <p className="truncate txt-corpo font-semibold text-branco">
            {nomeCompleto}
          </p>
          <p className="mt-0.5 rotulo-campo">{papel}</p>
          <div className="mt-3">
            <SairButton />
          </div>
        </div>
      </aside>

      {/* Cabeçalho — mobile */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-base/85 px-4 py-3 backdrop-blur-md md:hidden">
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          className="-ml-1 flex h-10 w-10 items-center justify-center rounded-sm text-branco transition-colors hover:bg-white/[0.05] active:scale-[0.95]"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>
        <MarcaCompleta />
        <SairButton />
      </header>

      {/* Painel lateral — mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuAberto(false)}
            className="absolute inset-0 bg-base/70 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(84vw,300px)] flex-col gap-6 border-r border-white/10 bg-superficie p-5 shadow-elevado [animation:deslizar-drawer_180ms_var(--ease-out-forte)]">
            <div className="flex items-center justify-between">
              <MarcaCompleta />
              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
                className="flex h-9 w-9 items-center justify-center rounded-sm text-cinza-texto hover:text-branco active:scale-[0.95]"
              >
                <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{listaLinks}</div>
            <div className="border-t border-white/10 pt-4">
              <p className="truncate txt-corpo font-semibold text-branco">
                {nomeCompleto}
              </p>
              <p className="mt-0.5 rotulo-campo">{papel}</p>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto w-full min-w-0 max-w-[1240px] flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10">
        {children}
      </main>
    </div>
  );
}
