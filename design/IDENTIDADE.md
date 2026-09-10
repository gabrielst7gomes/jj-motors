# Identidade visual — JJ Motors: Compra Programada

> Fonte da verdade para todo o frontend. Qualquer cor, tipo, espaçamento ou
> componente que não esteja aqui deve ser adicionado aqui antes de usar no
> código. Este documento descreve o **mundo visual "instrumentação de bordo"**
> (redesign de 2026-09-10). As direções anteriores (v1 "painel industrial",
> v2 "fintech moderna") foram substituídas e não são mais referência — o
> `git log` guarda o histórico.

---

## 0. A ideia em uma frase

**A tela é a instrumentação de bordo de um carro premium.** Cada tela tem
**um instrumento dominante** que lê um único número com precisão absoluta; o
resto é telemetria subordinada. Futurista pela precisão, não pelo brilho.
Nada decora — tudo indica. Referência de forma: HMI de Porsche Taycan /
Polestar (não fintech, não dashboard genérico de cards).

## 1. Semântica de cor (o que não muda nunca)

| Cor | Papel | Regra |
|---|---|---|
| **Vermelho** `#FF2A1A` | A **luz de permissão** — acende quando o cliente já pode comprar um carro (veredito de elegibilidade). | **Nunca** é cor de erro. Só preenchimento, moldura e glow — **nunca texto corrido** (contraste 5,3:1, ok para display, não para corpo). |
| **Ciano** `#4DD8FF` | Traço de progresso rumo aos 50% + **todo dado financeiro secundário** (a financiar, parcela, aportes do mês). | Pode ser texto (11,9:1). É o "HUD". |
| **Âmbar** `#FFB020` | Aviso: aporte pendente, "faltam R$ X", campo com problema. | — |
| **Vinho-contorno** `#E23D5B` | Ação destrutiva — só contorno, **nunca preenchida**, sempre com confirmação (`window.confirm`) no call site. | — |

## 2. Paleta

### Fundo — quase-preto azul-frio, em camadas

| Token | Hex | HSL | Papel |
|---|---|---|---|
| `--base` | `#07090D` | `220 33% 4%` | Canvas. Lido no escuro, como um painel. |
| `--superficie` | `#0F131B` | `218 26% 8%` | Corpo do mostrador, sidebar. |
| `--elevado` | `#1A1F29` | `217 22% 13%` | Popover, hover de linha. |
| `--recuo` | `#05070A` | `222 40% 3%` | **Poço** — trilha de barra, fundo de campo. Afunda, não eleva. |

### Marca e HUD

| Token | Hex | Papel |
|---|---|---|
| `--vermelho` | `#FF2A1A` | Luz de permissão (ver seção 1). |
| `--vermelho-fundo` | `#2A100C` | Leito do painel de veredito. |
| `--vermelho-texto` | `#E9B3AE` | Texto secundário **sobre** o leito do veredito (9,8:1). |
| `--ciano` | `#4DD8FF` | Progresso + dado financeiro secundário. |
| `--ciano-fundo` | `#0A1C24` | Leito de caixa informativa ciano. |
| `--azul-profundo` | `#0A5CA3` | Parada escura do gradiente do traço de progresso. |

### Texto

| Token | Hex | Contraste vs `--base` | Uso |
|---|---|---|---|
| `--branco` | `#F8FAFC` | 19,0:1 | Texto primário, leituras. |
| `--cinza-texto` | `#9AA4B2` | 7,9:1 | Secundário. |
| `--cinza-inativo` | `#5C6577` | 3,4:1 | Terciário / desabilitado / micro-rótulo decorativo. **Nunca corpo.** |

### Aviso / destrutivo

`--ambar #FFB020` (10,9:1) · `--ambar-fundo #2A1B08` · `--vinho-contorno #E23D5B`.

Todo contraste de texto verificado ≥ 4,5:1 (corpo) ou ≥ 3:1 (display) contra
o fundo onde aparece.

## 3. Tipografia — duas famílias, dois papéis

| Família | Papel | Como |
|---|---|---|
| **Chakra Petch** (Google, self-hosted via `next/font`) | Display, números grandes, rótulos técnicos, títulos, botões, cabeçalhos de tabela. É a **face de mostrador** — geométrica, corte técnico, largura levemente condensada, numerais tabulares proeminentes. | `var(--font-mostrador-stack)` · `font-mostrador` no Tailwind. |
| **Archivo** (eixo variável) | Corpo de texto. Workhorse legível. | `var(--font-sans)` · default. |

### Escala fixa (classes em `globals.css`)

- `.leitura` + `.leitura-xl` (clamp 2,75–4rem) / `.leitura-lg` (1,9–2,5rem) /
  `.leitura-md` (1,375rem) — o número que a tela existe para mostrar. Chakra
  Petch, `font-feature-settings: "tnum" 1`, `line-height: 1`.
- `.txt-titulo` (1,375rem, Chakra Petch 600) — título de página/seção.
- `.txt-subtitulo` (1,0625rem, Archivo 600).
- `.txt-corpo` (0,9375rem) / `.txt-pequeno` (0,8125rem) / `.txt-micro` (0,6875rem).
- `.rotulo-instrumento` — 11px, Chakra Petch 600, `tracking: 0.14em`, caixa
  alta, cor `--cinza-texto`. **Só para rótulo que nomeia um valor dentro de um
  mostrador** ("SALDO ACUMULADO", "FALTAM PARA OS 50%"). **Nunca** empilhado
  acima de um `<h1>` de página — isso é o kicker proibido; o `<h1>` carrega o
  próprio peso.
- `.rotulo-campo` — 0,6875rem, Chakra Petch 600, `tracking: 0.1em`, caixa
  alta — rótulo de campo de formulário e cabeçalho de coluna de tabela.

## 4. Forma e elevação

- **Raio técnico**: `--radius-xs 3px` (badge/chip), `--radius-sm 4px`
  (input, botão, controle), `--radius 6px` (mostrador, painel, bloco),
  `--radius-pill 9999px` (só contador). Nada mais arredondado que isso.
- **`.mostrador`** — a superfície-base. Moldura de 1px em branco 8%, canto
  6px, um gradiente radial interno sutil (brilho vindo do topo-centro,
  simula vidro curvo de instrumento), `box-shadow` `--sombra-mostrador`
  (offset + blur reais). É o que o componente `Card` renderiza.
- **`.mostrador-permissao`** — mostrador com a luz acesa: moldura vermelha
  50%, leito `--vermelho-fundo`, glow `--glow-vermelho` (blur sem spread —
  é uma **luz**, não uma borda).
- **`.poco`** — afunda: fundo `--recuo`, `box-shadow: inset`. Trilha de
  barra, fundo de campo (Input/Select usam).
- **Hairline** (`--linha` @ 8%) — divisor interno de tabela/lista. Não é o
  único recurso de hierarquia (a moldura + o poço + a cor de camada também
  são), mas segue sendo o divisor.
- **Sombra hard-offset / halo zero-offset: proibidos.** Toda sombra tem
  offset e blur.

## 5. Gradiente (recurso restrito)

Só dois, ambos dentro de **uma** família de cor, contraste verificado nas
duas paradas:

- `.gradiente-vermelho` — botão primário (`#FF3D33` → `#DC1F0F`).
- `.traco-progresso` — preenchimento da barra rumo aos 50%
  (`--azul-profundo` → `--ciano`).

Gradiente ambiente no `body`: uma névoa fixa e discretíssima (brilho ciano
vindo de cima + toque vermelho no canto), só para a base não ler chapada.
**Sem gradiente multicolor. Sem gradiente em texto.**

## 6. Movimento

**Um** momento autorado por sessão:

- O **traço de progresso / a agulha do veredito** sobe do zero ao valor
  real na primeira carga (`scaleX`, GPU, ~900ms, `--ease-agulha`
  `cubic-bezier(.16,1,.3,1)`), respeitando `prefers-reduced-motion` (cai
  para o valor final sem movimento).
- O glow do mostrador de veredito **pulsa uma vez** quando "liberado"
  aparece (`@keyframes pulso-permissao`).

Fora isso: só `:active` de botão (`scale(.97)`, `--ease-out-ui`, <180ms),
hover de linha de tabela (cor, <150ms) e translate de 2px em setas no
hover. Nunca `transition: all`, nunca `ease-in` em UI. Animar só
`transform` / `opacity` / `filter`.

## 7. Sinalização de status por forma além de cor (daltônicos)

Componente `Badge` e o marcador de extrato:

| Significado | Forma | Cor |
|---|---|---|
| Elegível / liberado | círculo cheio + glow | vermelho |
| Em progresso / a financiar | círculo vazado | ciano |
| Pendente / aguardando | triângulo | âmbar |
| Confirmado / concluído | quadrado | ciano |
| Rejeitado / falha | X | âmbar (nunca vinho) |
| Neutro / informativo | sem indicador | cinza |

## 8. Shell

- **Desktop (≥ md / 768px)**: coluna de instrumentos fixa de 236px à
  esquerda, moldura direita de 1px, fundo `--superficie` @ 40%. Item de nav
  ativo = faixa `--superficie` sutil + **traço vermelho de 2px aceso** na
  borda esquerda + ícone vermelho (cliente) / texto branco.
- **Cliente, mobile**: cabeçalho fino (52px, blur) + **console de navegação
  inferior fixo** — 6 itens, ícone (lucide, traço 1,75px) + rótulo Chakra
  Petch micro, item ativo com traço vermelho aceso acima e ícone branco.
- **Admin, mobile**: cabeçalho com botão de menu → **painel lateral
  deslizante** (`@keyframes deslizar-drawer`, 180ms), overlay com blur,
  trava scroll do body, fecha ao navegar. A lista de rotas do admin é longa
  demais para nav inline ou barra inferior.
- Conteúdo até 1240px.

## 9. Ícones

Só lucide-react, traço 1,5–2px, um peso consistente. **Zero ícone
decorativo** — só funcional (nav, seta de linha, check de confirmação, menu).
Nunca emoji ou glyph unicode no lugar de ícone.

## 10. Anti-padrões (proibidos)

- Kicker / eyebrow (rótulo tracked acima de um `<h1>` de página).
- Grade de cards iguais (ícone + rótulo + número + acento) como estrutura
  de página. Card aninhado dentro de card.
- Template hero-metric (número gigante + rótulo pequeno + stats de apoio +
  acento) — aqui é **um instrumento dominante**, não uma vitrine de KPI.
- Gradiente em texto, gradiente multicolor, glass/blur como decoração.
- `border-left`/`border-right` colorido acima de 1px em card/lista/alerta.
- Sombra hard-offset (`4px 4px 0`), halo de opacidade zero-offset.
- Monospace como "traje técnico" (a face técnica aqui é Chakra Petch, uma
  sans geométrica, não mono).
- Fundo `#000000` chapado; raio de 16px "fofo"; cor de camada em escada de
  cinza neutro (o viés azul-frio é o que faz a base ler como "escolhida").

---

## Componentes-âncora

| Componente | Papel |
|---|---|
| `components/bloco-veredito.tsx` | **Mostrador de veredito** — a luz de permissão acesa. Instrumento dominante quando o cliente é elegível. |
| `components/barra-progresso.tsx` | **Mostrador de rota** — a barra rumo aos 50%. Instrumento dominante quando ainda não é elegível. O dado grande é *quanto falta* (ciano, com sublinhado de agulha). |
| `components/card-veiculo.tsx` | Card de veículo (estoque / elegíveis). Elegível = mostrador com luz acesa. |
| `components/ui/card.tsx` | `Card` = `.mostrador`. |
| `components/ui/button.tsx` | 4 papéis fixos (primário gradiente / contorno / destrutivo contorno / fantasma). Rótulo Chakra Petch tracked. |
| `components/shell-cliente.tsx` / `shell-admin.tsx` | Os dois shells da seção 8. |
| `app/globals.css` | Todos os tokens e classes. **Editar aqui primeiro.** |
