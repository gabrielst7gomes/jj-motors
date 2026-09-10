"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

import { MarcaCompleta, LogoJJ } from "@/components/logo-jj";
import { SairButton } from "@/components/sair-button";

export type LinkAdmin = { href: Route; label: string };

function ehAtivo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Shell de navegação do admin — sidebar fixa de 232px em desktop
 * (design/IDENTIDADE.md seção 5.1), onde acontece a maior parte do uso
 * admin. Em telas estreitas: header com botão de menu que abre um drawer
 * lateral (a lista de links do admin é longa demais para nav inline ou
 * barra inferior).
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

  // Fecha o drawer ao navegar.
  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  // Trava o scroll do body enquanto o drawer está aberto.
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
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const ativo = ehAtivo(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={ativo ? "page" : undefined}
            className={
              ativo
                ? "rounded-sm bg-gradient-to-r from-vermelho/15 to-transparent px-3 py-2.5 txt-pequeno font-semibold text-branco transition-colors duration-150 [transition-timing-function:var(--ease-out-forte)]"
                : "rounded-sm px-3 py-2.5 txt-pequeno font-medium text-cinza-texto transition-colors duration-150 [transition-timing-function:var(--ease-out-forte)] hover:bg-elevado/60 hover:text-branco"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col gap-8 border-r border-white/10 p-[22px] md:flex">
        <MarcaCompleta />
        <div className="min-h-0 flex-1 overflow-y-auto">{listaLinks}</div>
        <div className="border-t border-white/10 pt-4">
          <p className="truncate txt-pequeno font-semibold">{nomeCompleto}</p>
          <p className="txt-micro capitalize text-cinza-texto">{papel}</p>
          <div className="mt-3">
            <SairButton />
          </div>
        </div>
      </aside>

      {/* Header — mobile */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-base/90 px-4 py-3 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          className="-ml-1 flex h-10 w-10 items-center justify-center rounded-sm text-branco transition-colors hover:bg-elevado/60 active:scale-[0.95]"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <div className="flex items-center gap-2.5">
          <LogoJJ className="h-8 w-8 txt-pequeno" />
          <p className="fonte-expandida txt-pequeno font-bold">JJ MOTORS</p>
        </div>
        <SairButton />
      </header>

      {/* Drawer — mobile */}
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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{listaLinks}</div>
            <div className="border-t border-white/10 pt-4">
              <p className="truncate txt-pequeno font-semibold">{nomeCompleto}</p>
              <p className="txt-micro capitalize text-cinza-texto">{papel}</p>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto w-full min-w-0 max-w-[1240px] flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-9">
        {children}
      </main>
    </div>
  );
}
