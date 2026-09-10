"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MarcaCompleta, LogoJJ } from "@/components/logo-jj";
import { SairButton } from "@/components/sair-button";

const LINKS = [
  { href: "/app", label: "Início" },
  { href: "/app/elegiveis", label: "Elegíveis" },
  { href: "/app/estoque", label: "Estoque" },
  { href: "/app/extrato", label: "Extrato" },
  { href: "/app/plano", label: "Meu plano" },
] as const;

function ehAtivo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Shell de navegação do cliente — design/IDENTIDADE.md seção 5.1. Sidebar de
 * 232px em desktop (>820px); abaixo disso, header compacto + nav inferior
 * fixa. Client Component só para ler a rota atual via usePathname — os
 * dados (perfil, plano, contagem de elegíveis) continuam vindo do layout
 * Server Component, passados como props.
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
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col gap-[34px] border-r border-white/10 p-[22px] md:flex">
        <MarcaCompleta />

        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => {
            const ativo = ehAtivo(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={ativo ? "page" : undefined}
                className={
                  ativo
                    ? "flex items-center justify-between rounded-sm bg-gradient-to-r from-vermelho/15 to-transparent px-3 py-2.5 txt-corpo font-semibold text-branco transition-colors duration-150 [transition-timing-function:var(--ease-out-forte)]"
                    : "flex items-center justify-between rounded-sm px-3 py-2.5 txt-corpo font-medium text-cinza-texto transition-colors duration-150 [transition-timing-function:var(--ease-out-forte)] hover:bg-elevado/60 hover:text-branco"
                }
              >
                {link.label}
                {link.href === "/app/elegiveis" &&
                  !!contadorElegiveis &&
                  contadorElegiveis > 0 && (
                    <span className="pill-contagem">{contadorElegiveis}</span>
                  )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <p className="txt-corpo font-semibold">{nomeCompleto}</p>
          <p className="txt-pequeno text-cinza-texto">Plano {planoCodigo}</p>
          <div className="mt-3">
            <SairButton />
          </div>
        </div>
      </aside>

      {/* Header — mobile */}
      <header className="flex items-center justify-between border-b border-white/10 px-[18px] py-4 md:hidden">
        <div className="flex items-center gap-2.5">
          <LogoJJ className="h-8 w-8 txt-pequeno" />
          <div className="leading-tight">
            <p className="fonte-expandida txt-pequeno font-bold">JJ MOTORS</p>
            <p className="txt-micro text-cinza-texto">Olá, {primeiroNome}</p>
          </div>
        </div>
        <SairButton />
      </header>

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-[18px] pb-24 pt-[22px] md:px-12 md:pb-[72px] md:pt-10">
        {children}
      </main>

      {/* Nav inferior — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-white/10 bg-superficie px-1 pb-[max(9px,env(safe-area-inset-bottom))] pt-[9px] shadow-elevado md:hidden">
        {LINKS.map((link) => {
          const ativo = ehAtivo(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={ativo ? "page" : undefined}
              className={
                ativo
                  ? "relative flex-1 px-0.5 py-1.5 text-center txt-micro font-bold text-branco before:absolute before:inset-x-[26%] before:-top-[9px] before:h-0.5 before:bg-vermelho"
                  : "relative flex-1 px-0.5 py-1.5 text-center txt-micro font-medium text-cinza-inativo"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
