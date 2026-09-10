import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

/**
 * Archivo é uma fonte de eixo variável (peso 100–900, largura 62–125%).
 * Carregamos uma família só e usamos `font-stretch` em CSS para acessar a
 * largura expandida — é a mesma técnica do mockup de referência
 * (`font-stretch: 118%` sobre a família normal), evitando duas famílias
 * separadas com métricas potencialmente diferentes. Ver design/IDENTIDADE.md
 * seção 4.1: "Archivo em duas larguras", não "Archivo + Archivo Expanded".
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
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
      <body className={`${archivo.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
