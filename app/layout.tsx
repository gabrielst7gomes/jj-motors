import type { Metadata } from "next";
import { Archivo, Chakra_Petch } from "next/font/google";
import "./globals.css";

/**
 * Duas famílias, dois papéis (design/IDENTIDADE.md — redesign "instrumentação
 * de bordo"):
 *
 *   Chakra Petch  → display, números grandes, rótulos técnicos. Geométrica de
 *                   corte técnico, largura levemente condensada, numerais
 *                   tabulares proeminentes. É a "face de mostrador".
 *   Archivo       → corpo de texto. Workhorse legível, eixo variável.
 *
 * Chakra Petch não tem eixo variável de peso — carregamos os pesos usados.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const chakra = Chakra_Petch({
  subsets: ["latin"],
  variable: "--font-mostrador",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "JJ Motors — Compra Programada",
  description:
    "Acompanhe seus aportes, seu saldo e os veículos que você já pode adquirir.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${archivo.variable} ${chakra.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
