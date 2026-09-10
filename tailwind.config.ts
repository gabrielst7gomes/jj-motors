import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1240px", // design/IDENTIDADE.md 5.1: conteúdo até 1240px
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Tokens de marca — design/IDENTIDADE.md seção V2.1. Usar estes
        // nomes diretamente (bg-vermelho, text-azul-claro, bg-superficie).
        base: "hsl(var(--base))",
        superficie: "hsl(var(--superficie))",
        elevado: "hsl(var(--elevado))",
        vermelho: "hsl(var(--vermelho))",
        "vermelho-fundo": "hsl(var(--vermelho-fundo))",
        "azul-profundo": "hsl(var(--azul-profundo))",
        "azul-claro": "hsl(var(--azul-claro))",
        branco: "hsl(var(--branco))",
        "cinza-texto": "hsl(var(--cinza-texto))",
        "cinza-inativo": "hsl(var(--cinza-inativo))",
        ambar: "hsl(var(--ambar))",
        vinho: "hsl(var(--vinho))",
        "vinho-contorno": "hsl(var(--vinho-contorno))",
      },
      borderRadius: {
        // design/IDENTIDADE.md V2.2: raio reintroduzido em escala.
        DEFAULT: "var(--radius)",
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "var(--radius-sm)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--sombra-card)",
        elevado: "var(--sombra-elevado)",
        vermelho: "var(--sombra-vermelho)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Preenchimento da barra de progresso — design/IDENTIDADE.md 6.2.
        "barra-preenche": {
          from: { width: "0%" },
        },
        // Pulso único de borda quando um veículo entra no bloco de veredito.
        "pulso-borda": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulso-borda": "pulso-borda 500ms ease-in-out",
      },
      transitionTimingFunction: {
        barra: "cubic-bezier(.22,.7,.3,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
