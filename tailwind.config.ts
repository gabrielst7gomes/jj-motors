import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
        "2xl": "1240px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mostrador: ["var(--font-mostrador-stack)"],
      },
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
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
        // Tokens do mundo "instrumentação de bordo" — usar direto:
        //   bg-superficie, text-ciano, border-vermelho/50, bg-recuo
        base: "hsl(var(--base))",
        superficie: "hsl(var(--superficie))",
        elevado: "hsl(var(--elevado))",
        recuo: "hsl(var(--recuo))",
        vermelho: "hsl(var(--vermelho))",
        "vermelho-fundo": "hsl(var(--vermelho-fundo))",
        "vermelho-texto": "hsl(var(--vermelho-texto))",
        ciano: "hsl(var(--ciano))",
        "ciano-fundo": "hsl(var(--ciano-fundo))",
        "azul-profundo": "hsl(var(--azul-profundo))",
        branco: "hsl(var(--branco))",
        "cinza-texto": "hsl(var(--cinza-texto))",
        "cinza-inativo": "hsl(var(--cinza-inativo))",
        ambar: "hsl(var(--ambar))",
        "ambar-fundo": "hsl(var(--ambar-fundo))",
        "vinho-contorno": "hsl(var(--vinho-contorno))",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "var(--radius-sm)",
        xs: "var(--radius-xs)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        mostrador: "var(--sombra-mostrador)",
        elevado: "var(--sombra-elevado)",
        "glow-vermelho": "var(--glow-vermelho)",
        "glow-ciano": "var(--glow-ciano)",
      },
      keyframes: {
        "agulha-sobe": {
          from: { transform: "scaleX(0)" },
        },
        "pulso-permissao": {
          "0%": {
            boxShadow:
              "var(--sombra-mostrador), 0 0 0 1px hsl(var(--vermelho) / 0.5), 0 0 0 0 hsl(var(--vermelho) / 0)",
          },
          "40%": {
            boxShadow:
              "var(--sombra-mostrador), 0 0 0 1px hsl(var(--vermelho) / 0.7), 0 4px 30px 2px hsl(var(--vermelho) / 0.5)",
          },
          "100%": {
            boxShadow: "var(--sombra-mostrador), var(--glow-vermelho)",
          },
        },
      },
      animation: {
        "agulha-sobe": "agulha-sobe 900ms var(--ease-agulha) both",
        "pulso-permissao": "pulso-permissao 1100ms var(--ease-out-forte) both",
      },
      transitionTimingFunction: {
        agulha: "var(--ease-agulha)",
        "out-ui": "var(--ease-out-ui)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
