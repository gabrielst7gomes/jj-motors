# Identidade visual — JJ Motors: Compra Programada

> Fonte da verdade para todo o frontend a partir daqui. Qualquer decisão de
> cor, tipo, espaçamento ou componente que não esteja aqui deve ser adicionada
> aqui antes de ser usada no código.

---

## V2 — Revisão de direção (substitui a v1 abaixo)

A v1 (seções 0–10 originais, mantidas logo depois como registro histórico)
implementava um conceito de "painel de instrumentos industrial": preto
`#000000` chapado, zero `border-radius`, zero gradiente, hairlines finas como
único recurso de hierarquia. Construído e revisado pelo usuário no app real,
o veredito foi direto: **"não está bonita, letras feias... quero algo
tecnológico e fluido, detalhes arredondados, um pouco de gradiente, não
utilizar esse fundo 100% preto"**.

Isso não é um ajuste de polimento — é uma troca de mundo visual. Decisão
tomada com o usuário (duas perguntas, ver histórico de decisão): a base deixa
de ser preto chapado e vira **quase-preto em camadas** (profundidade real,
não a escada de cinza que a v1 proibia), e a referência de estilo muda de
"painel industrial" para **fintech moderna — Nubank, Stripe, Revolut**: cantos
arredondados, gradiente sutil como recurso ativo (não só na barra de
progresso), sombra suave em vez de só hairline. Vermelho continua sendo o
veredito de elegibilidade — essa semântica central (princípio 1 da v1) não
mudou e continua sendo o que faz esta interface ser desta empresa e não de
qualquer fintech. O que muda é a *linguagem de superfície* em torno dela.

### V2.1 Paleta — base em camadas

| Token | Hex | Papel |
|---|---|---|
| `--base` | `#0A0E14` | Canvas — substitui `--preto`. Quase-preto azulado, não neutro puro (o viés de matiz é o que faz ler como "escolhido", não herdado). |
| `--superficie` | `#131822` | Segunda camada — cards, sidebar, seções. Um passo acima da base. |
| `--elevado` | `#1C2230` | Terceira camada — inputs, selects, popovers, hover de linha de tabela. |
| `--vermelho` | `#E10600` | Inalterado. Marca e veredito "liberado". |
| `--vermelho-fundo` | `#2A0F0F` | Ajustado para a nova base (mais neutro que o `#3A0402` puro-preto da v1, para não destoar da superfície azulada). |
| `--azul-profundo` | `#1550B8` | Levemente clareado em relação a `#0B3D91` — sobre a base mais clara, o tom antigo perdia contraste. |
| `--azul-claro` | `#5B9AFF` | Levemente clareado em relação a `#4D8DFF`, mesmo motivo. |
| `--branco` | `#FFFFFF` | Inalterado. |
| `--cinza-texto` | `#9AA3B2` | Ajustado para ter matiz azulado consistente com a base (regra do skill de design: "neutro escolhido, não herdado"). |
| `--cinza-inativo` | `#5C6577` | Idem. |
| `--ambar` | `#F2A900` | Inalterado. |
| `--vinho-contorno` | `#C23350` | Clareado — sobre a base mais clara, `#A31B2B` da v1 perdia o contraste mínimo de contorno; `#C23350` passa 3,58:1. |

Contrastes recalculados contra `--base` (`#0A0E14`): branco 19,3:1, cinza-texto
7,6:1, azul-claro 6,9:1, âmbar 9,6:1 — todos folgados. Vermelho de marca
continua a 3,9:1 (só display/preenchimento, nunca texto corrido — regra
inalterada da v1 seção 2.4).

### V2.2 O que muda estruturalmente

- **Border-radius volta a existir**, com escala: `8px` em controles pequenos
  (badge, input, botão), `16px` em cards e blocos de conteúdo, `9999px`
  (pill) só em contadores — a mesma exceção única da v1, agora com mais
  companhia. Isso reverte a regra "zero raio" da v1 seção 8 por completo.
- **Sombra como recurso de elevação**, junto com a cor de camada: cada nível
  (`--superficie`, `--elevado`) ganha uma `box-shadow` suave (offset + blur,
  nunca halo de zero offset) em vez de depender só de hairline. Hairline
  continua existindo como divisor interno (tabela, lista), mas não é mais o
  único recurso de hierarquia.
- **Gradiente autorizado como recurso ativo**, não só na barra de progresso:
  botão primário, bloco de veredito e o card do dado principal (saldo,
  valor faltante) podem usar um gradiente sutil de duas paradas dentro da
  própria família de cor (vermelho→vermelho mais escuro, superfície→base),
  sempre com contraste de texto verificado nas duas pontas do gradiente, nunca
  um gradiente multicolor arco-íris.
- **Tipografia**: mantém Archivo/Archivo Expanded (v1 seção 4.1 segue válida
  — a crítica do usuário foi sobre peso/tamanho/contexto de renderização, não
  sobre a família em si). Ajuste real: pesos um degrau mais leves nos títulos
  de card (600 em vez de 700/800) para reduzir o efeito "grito" que motivou
  "letras feias", e `letter-spacing` levemente mais aberto no corpo (`-0.01em`
  em vez de `-0.02em`) para uma leitura mais confortável em telas de fintech.
- **O que NÃO muda**: a arquitetura de informação (bloco de veredito
  vermelho + barra de progresso azul como seções coexistentes, seção 6 da
  v1), a sinalização de status por forma além de cor (seção 7), o shell de
  sidebar (seção 5.1), e a semântica de cor por papel (seção 2 — vermelho
  nunca é erro, âmbar é aviso, vinho é destrutivo). Só a pele muda.

Seções 0–10 abaixo são a v1 original — mantidas como registro do raciocínio
anterior; onde conflitarem com V2 acima, V2 vence.

---

## 0. A ideia em uma frase (v1 — histórico)

**O app é um painel de instrumentos, não uma vitrine.** Preto sólido como
carroceria; vermelho como o indicador que acende quando o carro está liberado;
azul como o velocímetro de quanto falta. Nada decora — tudo indica.

---

## 1. Princípio por trás de cada decisão

Antes da paleta e da escala, os três princípios que uma interface genérica
não teria — e que vou usar para revisar cada tela nas fases seguintes:

1. **Vermelho é veredito, não ênfase.** Em todo dashboard escuro comum,
   vermelho = "atenção, algo errado". Aqui, inverte: vermelho = "liberado,
   pode comprar". Essa inversão semântica é o núcleo do produto e precisa
   estar impossível de confundir — daí âmbar para aviso e vinho-contorno para
   destrutivo, nunca vermelho de marca em nenhum dos dois.
2. **A pergunta do cliente tem uma resposta, não uma tela.** "Já dá pra
   comprar?" e "quanto falta?" são as duas únicas perguntas que o cliente
   carrega. Cada tela do cliente é avaliada por: *essa informação aparece
   antes de qualquer scroll, sem precisar ler um parágrafo?* Se não, a tela
   está errada, não faltando polimento.
3. **Hierarquia é linha e espaço, não tom de cinza. (V1 — substituído, ver
   V2.2: agora hierarquia também usa camada de cor + sombra.)** A escada de
   quase-pretos (`#0B0B0B → #111 → #1A1A1A`) é o reflexo condicionado de todo
   dashboard escuro — e é exatamente o que apaga o contraste preto/vermelho
   que dá personalidade a este produto. Aqui a hierarquia vem de hairline,
   espaçamento e borda de acento; o preto do fundo não se move.

---

## 2. Paleta

### 2.1 Tokens e papel funcional

| Token | Hex | Papel | Onde |
|---|---|---|---|
| `--preto` | `#000000` | Canvas, superfície dominante | Fundo de praticamente tudo |
| `--vermelho` | `#E10600` | Marca, ação primária, veredito "liberado" | Botão primário, badge elegível, marca-d'água de progresso concluído, logotipo |
| `--vermelho-fundo` | `#3A0402` | Tinta de superfície do estado "liberado" | Fundo de card elegível, fundo de banner de elegibilidade |
| `--azul-profundo` | `#0B3D91` | Preenchimento de dado, superfície informativa | Barra de progresso (parte preenchida, abaixo de 50%), fundo de gráfico |
| `--azul-claro` | `#4D8DFF` | Texto e número de dado sobre preto | Valores financeiros, links, números de progresso |
| `--branco` | `#FFFFFF` | Texto primário | Corpo de texto, títulos, hairlines de alto contraste |
| `--cinza-texto` | `#A3A3A3` | Texto secundário | Legendas, metadados, texto de apoio |
| `--cinza-inativo` | `#6B6B6B` | Desabilitado, placeholder | Input vazio, botão disabled, ícone inerte |
| `--ambar` | `#F2A900` | Aviso, pendente | Badge "pendente", ícone de alerta, borda de campo com erro de validação leve |
| `--vinho` | `#7A1420` | Destrutivo — **decisão revisada, ver 2.3** | Texto/ícone de ação destrutiva, nunca preenchimento |
| `--elevado` | `#232323` | Único tom elevado real | Fundo de input, select, textarea — nada mais |

### 2.2 Contrastes verificados (WCAG 2.1, sRGB)

Recalculei os 12 pares que a paleta proposta gera. Onde o prompt já cravava
um número (`#E10600` a 4,23:1, `#4D8DFF` a 6,57:1), bateu exato — o resto é
verificação adicional necessária para as regras de uso ficarem defensáveis:

| Par | Contraste | Veredito | Uso permitido |
|---|---|---|---|
| `#E10600` texto sobre `#000` | 4,23:1 | Reprova AA texto normal; passa AA large (≥24px/19px bold) | Só display type grande, nunca parágrafo/label/valor |
| `#FFFFFF` sobre `#E10600` (preenchido) | 4,97:1 | Passa AA normal | Texto de botão primário |
| `#4D8DFF` sobre `#000` | 6,57:1 | Passa AA normal | Valor financeiro, link, texto de dado |
| `#A3A3A3` sobre `#000` | 8,33:1 | Passa AAA | Texto secundário sem restrição |
| `#6B6B6B` sobre `#000` | 3,94:1 | Abaixo de AA texto; ok pra estado inerte (placeholder/disabled não é texto de leitura obrigatória) | Só placeholder e disabled |
| `#F2A900` sobre `#000` | 10,45:1 | Passa AAA | Texto e ícone de aviso sem restrição |
| `#000000` sobre `#F2A900` (badge preenchido) | 10,45:1 | Passa AAA | Texto sobre badge de aviso preenchido |
| `#FFFFFF` sobre `#0B3D91` | 10,04:1 | Passa AAA | Texto sobre superfície azul preenchida |
| `#FFFFFF` sobre `#232323` | 15,72:1 | Passa AAA | Texto de input |
| `#FFFFFF` sobre `#7A1420` | 10,78:1 | Passa AAA | Se vinho aparecer preenchido em algum estado de confirmação (ver 2.3) |
| `#7A1420` **contorno** sobre `#000` | **1,95:1** | **Reprova até o piso de UI (3:1, WCAG 1.4.11)** | Ver decisão abaixo — não pode ser usado como estava especificado |
| `#E10600` contorno sobre `#232323` | 3,16:1 | Passa o piso de UI (3:1) | Borda de campo/card em vermelho sobre input elevado |

### 2.3 Decisão revisada: vinho como contorno não funciona sozinho

O prompt pede "vinho escuro em contorno" para destrutivo. Medido: **`#7A1420`
como borda de 1–2px sobre `#000` dá 1,95:1** — abaixo até do piso de 3:1 que o
WCAG exige pra *componentes de interface* (mais frouxo que o piso de texto).
Um contorno nessa razão de contraste é, na prática, quase invisível sobre
preto — o oposto do que uma ação destrutiva precisa ser.

**O que muda, sem tocar na semântica pedida (vinho = destrutivo, nunca
preenchido em vermelho de marca):**

- O contorno de ação destrutiva usa `--vinho` a **2px** (não 1px) **+ o
  texto/ícone dentro do botão em `--ambar` (`#F2A900`, 10,45:1— sobra
  contraste)**, não em vinho. O vinho continua sendo a cor conceitual do
  "perigo silencioso"; o âmbar é o que garante legibilidade real.
- Alternativa equivalente, caso prefiram manter o vinho também no texto: subir
  o vinho para `#A31B2B` (contraste contra preto: recalculado abaixo) só para
  o traço do contorno, mantendo `#7A1420` como o tom "de marca" documentado
  aqui e usado em áreas de preenchimento sutil (ex.: fundo de modal de
  confirmação de exclusão, onde a área é grande e o contraste de superfície,
  não de linha fina, é o que importa).

Recalculando a alternativa:

```
#A31B2B sobre #000  ->  3.05:1   passa o piso de 3:1 de componente de UI
```

**Recomendação: uso combinado.** Contorno do botão destrutivo em `#A31B2B`
(componente de UI, precisa só de 3:1 — passa raspando, então também reforçado
por um ícone de alerta triangular, nunca só a cor). Texto/label dentro do
botão em `--branco`. `--vinho` original (`#7A1420`) fica reservado para
preenchimentos de área grande — banner de aviso crítico, fundo do modal de
confirmação — onde WCAG não exige 3:1 de contraste *da cor contra o fundo
ao redor*, só que o conteúdo *dentro* dela seja legível (e branco sobre
`#7A1420` dá 10,78:1, ok).

Isso preserva 100% da regra pedida ("destrutivo nunca é preenchido em
vermelho de marca, sempre contorno + confirmação explícita") e resolve o
problema técnico sem inventar uma cor fora da lógica vinho.

### 2.4 As cinco regras dela (mantidas do brief, agora com números por trás)

1. `#E10600` nunca em texto corrido, label ou valor sobre preto — só
   preenchimento, borda espessa (≥2px) ou display type ≥24px/peso ≥600.
2. Azul e vermelho nunca se tocam sem preto ou branco entre eles; nunca os
   dois na mesma visualização de dado.
3. Vermelho fora de dado, exceto o marcador fixo dos 50% na barra de
   progresso.
4. Gradiente só dentro da barra de progresso, só se indicar direção (nunca
   decorativo).
5. Máximo dois elementos vermelhos visíveis por tela — se um terceiro
   aparecer, um dos três perde a cor.

---

## 3. Elevação: linha, não preenchimento

Preto (`#000000`) é o fundo em toda superfície, sempre. A hierarquia visual
vem de, em ordem de uso:

1. **Hairline** — `1px solid rgba(255,255,255,.12)` delimitando blocos,
   linhas de tabela, divisores de card. É o recurso default.
2. **Espaço** — Ao invés de uma nova cor de fundo para "destacar" um bloco,
   aumenta-se o espaço em volta dele. Ritmo de espaçamento documentado na
   seção 5.
3. **Borda de acento** — `2–3px solid` em `--vermelho` ou `--azul-profundo`
   na borda esquerda ou no perímetro completo de um card, para marcar um
   *estado* (elegível = vermelho; em progresso = azul), nunca como decoração
   neutra.
4. **`--elevado` (`#232323`)** — reservado exclusivamente para a superfície
   de controles de formulário (input, select, textarea, checkbox custom).
   Nunca usado em card, nav ou container de conteúdo. Isso preserva o
   `--elevado` como um sinal único e reconhecível de "aqui você digita",
   sem competir com a leitura de preto-superfície-dominante.

Nenhum outro tom de cinza-quase-preto é permitido no sistema. Se uma tela
"precisa" de mais um nível, a resposta é hairline + espaço, não uma nova cor.

---

## 4. Tipografia

### 4.1 Família — decisão

Adoto a recomendação do brief: **Archivo** como família única, em duas
larguras.

- **Display / números grandes:** Archivo Expanded, 600–800
- **Interface / corpo:** Archivo (largura normal), 400–600

Ambas no Google Fonts, mesma superfamília — herdam a mesma geometria de
letra, então a alternância de largura lê como um gesto de marca deliberado
("isto é importante, por isso é largo"), não como duas fontes brigando.
Confirmo a escolha porque bate exatamente com o argumento do brief: o
contraste de largura é o substituto do itálico/negrito genérico para dar
ênfase (que a seção 8 do brief proíbe explicitamente como "uma palavra
colorida ou em itálico").

**Por que não propor uma terceira opção:** avaliei alternativas com o mesmo
padrão de largura dupla (Big Shoulders + Inter, Fjalla One + Work Sans) e
nenhuma justificava trocar — todas exigiriam duas famílias de fundições
distintas com métricas diferentes, o que é exatamente o problema que Archivo
em duas larguras evita. Sem contraproposta aqui.

### 4.2 Escala (6 tamanhos, conforme exigido)

| Nome | Tamanho | Uso | Família |
|---|---|---|---|
| `display` | 40px / 44px linha | O número que importa na tela (valor faltante, "você pode comprar") | Archivo Expanded 700 |
| `titulo` | 24px / 30px | Título de página, nome de veículo no detalhe | Archivo Expanded 600 |
| `subtitulo` | 18px / 26px | Título de card, título de seção | Archivo 600 |
| `corpo` | 15px / 22px | Texto corrido, labels de formulário, itens de tabela | Archivo 400–500 |
| `pequeno` | 13px / 18px | Metadado, legenda, texto de apoio | Archivo 400 |
| `micro` | 11px / 16px | Selo de status, timestamp em linha densa (admin) | Archivo 500 |

Regras fixas:
- Todo valor monetário: `font-variant-numeric: tabular-nums`, sem exceção,
  em qualquer um dos 6 tamanhos.
- Em tabela, valor alinhado à direita; centavos no mesmo elemento mas em
  `pequeno`/`micro` e `--cinza-texto` (ex.: `R$ 19.000,`**`00`**, os dois
  últimos dígitos menores e mais claros).
- Sentence case em toda a interface. Nenhum all-caps — inclusive rótulo de
  seção, chip de filtro e label de formulário (que é onde all-caps mais se
  esconde por hábito).
- Corpo de texto corrido limitado a `65ch` (abaixo do teto de 80 caracteres
  pedido, com folga para conforto de leitura).

---

## 5. Espaçamento e grid

Escala em base 4, com os múltiplos realmente usados restritos a:

```
4, 8, 12, 16, 24, 32, 48, 64   (px)
```

- Espaço interno de card: `16` (mobile) / `24` (desktop admin).
- Espaço entre blocos irmãos na mesma seção: `24`.
- Espaço entre seções: `48`.
- Espaço de respiro em torno do dado principal de uma tela (o "display"):
  `64` acima, para ele nunca competir com navegação ou header.

**Revisão pós-mockup de referência:** a área do cliente também usa sidebar
fixa em desktop (232px, ver seção 5.1), não só single-column — a maioria
acessa pelo celular, mas quem abre em desktop/tablet ganha uma navegação
persistente igual à do admin, em vez de um layout de "app de bolso" esticado
sem propósito num monitor largo. Abaixo de 820px a sidebar desaparece e vira
nav inferior fixa (mobile-first continua sendo a prioridade de desenho, só
não é mais o único breakpoint tratado).

Admin usa a mesma lógica de sidebar (232px), conteúdo em até `1240px`.

### 5.1 Shell de navegação (cliente e admin)

Mesmo componente de shell para as duas áreas, com o conteúdo do rodapé da
sidebar mudando (perfil de cliente vs. perfil de staff):

```
┌───────────┬──────────────────────────────────────┐
│ [JJ] JJ   │  Olá, Ana                             │
│  MOTORS   │  Plano CP-2025-0001 · ativo desde...  │
│  Compra   ├──────────────────────────────────────┤
│  Prog.    │                                       │
│           │  (conteúdo da página)                │
│ Início    │                                       │
│┃Elegív. 2 │  <- item ativo: borda esquerda 2px    │
│ Estoque   │     vermelha + texto branco           │
│ Extrato   │                                       │
│ Meu plano │                                       │
│           │                                       │
│ ─────────  │                                       │
│ Ana       │                                       │
│ Beatriz   │                                       │
│ Sair      │                                       │
└───────────┴──────────────────────────────────────┘
   232px              flex, max 1240px
```

- Logo: quadrado 38×38px vermelho sólido com "JJ" em Archivo Expanded 800,
  branco — o **monograma quadrado é a unidade mínima de marca**, reaproveitado
  no favicon e nos ícones PWA (seção 7 do brief).
- Item de nav ativo: `border-left: 2px solid var(--vermelho)`, texto branco,
  peso 600. Inativo: `--cinza-texto`, sem borda, hover para branco.
- Contador de itens (ex.: "Elegíveis") usa um **pill vermelho sólido**
  (`background: var(--vermelho)`, texto branco, `border-radius: 99px`,
  `font-size: 11px`, `font-weight: 700`) — único lugar do sistema em que
  `border-radius` grande é intencional (chip de contagem, não decoração de
  card/botão).
- Abaixo de 820px: sidebar oculta, header mobile compacto (logo + botão
  "Sair") substitui o topo, e nav inferior fixa reaparece com o mesmo
  princípio de item ativo — mas como **traço vermelho de 2px flutuando acima
  do ícone/label**, não borda lateral (não há "lateral" possível numa barra
  horizontal).

**V2.3 — mobile-first é a prioridade real (área do cliente).** O maior uso
do app é no celular; o cliente nunca vê nav inferior com mais de 5 itens
(cabe). O admin é o inverso — uso majoritário em PC, lista de navegação
longa —, então **abaixo de `md` (768px) o admin usa um _drawer_ lateral**
(botão de menu no header → painel desliza da esquerda, overlay com blur,
trava o scroll do body, fecha ao navegar), nunca nav inline com wrap nem
barra inferior. Keyframe `deslizar-drawer` (180ms, `--ease-out-forte`),
respeitando `prefers-reduced-motion`. Headers de página de lista (título +
botão de ação) empilham em coluna abaixo de `sm` e viram linha a partir daí.

---

## 6. O elemento de maior ousadia: barra de progresso dos 50%

Esta é a peça em que a interface tem permissão de ser dramática — em todo o
resto, contida.

**Revisão pós-mockup de referência — arquitetura de duas seções, não dois
estados exclusivos.** O plano original tratava "abaixo de 50%" e "cruzou os
50%" como estados alternativos da mesma barra (a barra *vira* vermelha). O
mockup de referência mostra a versão certa: são **duas seções que coexistem**
sempre que fizer sentido, porque o saldo é fungível e o cliente pode estar
elegível para alguns carros e, ao mesmo tempo, acompanhando o progresso rumo
a um veículo-alvo mais caro que ainda não atingiu:

1. **Bloco de veredito** (seção 6.1) — aparece **somente quando
   `veículos elegíveis > 0`**. É o card vermelho sólido, sempre no topo da
   tela, com os carros elegíveis dentro dele. Não tem barra — o veredito já
   está dado, a barra não tem mais função ali.
2. **Barra de progresso do próximo objetivo** (seção 6.2) — **sempre
   visível**, aponte para o veículo-alvo do plano (ou, na ausência de um, o
   veículo mais barato ainda não elegível). Mostra quanto falta em R$, a
   marca fixa dos 50%, e uma projeção textual de tempo baseada no aporte
   mensal previsto do plano.

Quando o cliente não é elegível para nenhum carro, só a seção 6.2 aparece.
Quando cruza os 50% de *todos* os carros do estoque (limite, praticamente
não acontece), só a 6.1 aparece. Na maioria das sessões reais, as duas
convivem na mesma tela — é o que o mockup mostra.

### 6.1 Bloco de veredito (quando há ≥1 veículo elegível)

```
┌──────────────────────────────────────────────────────┐
│▌Você já pode comprar 2 carros                         │ ← borda esq. 3px
│                                                        │   vermelha,
│ Seu saldo cobre a entrada de 50% destes veículos.     │   fundo
│ O restante fica em promissória direto com a JJ        │   vermelho-fundo,
│ Motors, sem banco.                                    │   borda 1px
│                                                        │   vermelho a 55%
│ ┌───────────────────┐  ┌───────────────────┐         │   opacidade
│ │ [foto]            │  │ [foto]            │         │
│ │ Renault Kwid Zen   │  │ Fiat Mobi Like    │         │
│ │ 2022 · 38.400 km   │  │ 2021 · 51.200 km  │         │
│ │ Sua entrada        │  │ Sua entrada       │         │
│ │  R$ 23.450,00      │  │  R$ 22.250,00     │         │
│ │ Promissória 24x    │  │ Promissória 24x   │         │
│ │  R$ 1.098,00       │  │  R$ 1.042,00      │         │
│ │ ─────────────────  │  │ ─────────────────  │         │
│ │ Preço R$ 46.900,00 │  │ Preço R$ 44.500,00│         │
│ └───────────────────┘  └───────────────────┘         │
│                                                        │
│ [ Reservar um destes carros ]                         │ ← primário
└──────────────────────────────────────────────────────┘
```

- Fundo `--vermelho-fundo`, borda 1px `rgba(225,6,0,.55)` no perímetro
  inteiro **+ borda de acento 3px `--vermelho` só à esquerda** — a
  combinação das duas é o que dá peso ao bloco sem virar um retângulo
  vermelho vibrando inteiro.
- Título do bloco em `titulo` (Archivo Expanded), texto de apoio em `corpo`
  numa variante clareada do vermelho (`#E8B6B2`) — não branco puro, para o
  texto de apoio permanecer visualmente subordinado ao título mesmo dentro
  da área tingida.
- Cards de veículo dentro do bloco: fundo `--preto` (não vermelho-fundo —
  o card do carro precisa se distinguir do card-mãe), hairline padrão,
  grid foto+dados. Preço em destaque na base do card, acima de uma
  hairline própria separando "dados de financiamento" de "preço cheio".
- Grid de 2 colunas em desktop, empilha em 1 coluna abaixo de 1080px.
- CTA único abaixo dos cards, preenchido vermelho, full-width em mobile.

### 6.2 Barra de progresso do próximo objetivo (sempre visível)

```
┌──────────────────────────────────────────────────────┐
│  Faltam                                               │
│  R$ 8.420,00                             ← display,   │
│                                             Archivo     │
│                                             Expanded    │
│                                             700, azul   │
│                                             claro       │
│                                                        │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░│░░░░░░░░░░░░░░░  │
│  azul profundo (preenchido)         ┃      trilho      │
│                                      ┃      preto       │
│                                marca vertical            │
│                                vermelha fixa nos 50%     │
│                                                        │
│  32% da meta · R$ 12.180,00 acumulados                │
└──────────────────────────────────────────────────────┘
```

- Cabeçalho da seção: nome do veículo-alvo + ficha resumida à esquerda,
  preço cheio em destaque à direita (`corpo`/`subtitulo`, alinhado à
  direita, ver mockup seção "Seu próximo objetivo").
- O dado grande é **quanto falta**, não a porcentagem: rótulo "Faltam para
  atingir os 50%" em `pequeno`/`--cinza-texto`, valor em `display`
  (Archivo Expanded 800), branco — não azul puro no mockup de referência
  (o azul fica reservado para a barra e para valores secundários; o número
  que mais importa na tela usa a cor de maior contraste, branco).
- Trilho: fundo quase-preto (`#0d0d0d`, distinto do `--preto` puro só aqui,
  para o trilho ter uma sombra própria sob o preenchimento) com hairline de
  borda.
- Preenchimento: `--azul-profundo` com borda de 1px `--azul-claro` na ponta
  de avanço — a "borda que acende" faz o papel do gradiente sem precisar de
  um degradê real; mantém a regra de "gradiente só se indicar direção"
  cumprida com um recurso ainda mais discreto.
- Marca dos 50%: linha vertical de 2px em `--vermelho`, sempre visível,
  atravessando o trilho inteiro (inclusive a parte ainda não preenchida) —
  ela é o "veja onde você está indo", presente desde o primeiro aporte —
  com o rótulo "50%" em `micro`/`--vermelho` logo abaixo da marca.
- Escala nas pontas do trilho (`R$ 0` — `R$ <preço cheio>`) em
  `micro`/`--cinza-inativo`.
- Legenda narrativa abaixo, `pequeno`/`--cinza-texto`, com os números-chave
  em branco/peso 600: *"Você tem **R$ 24.500,00** acumulados, o equivalente
  a **35,6%** do valor deste carro. Mantendo o aporte de R$ 2.000,00 por
  mês, você chega aos 50% em **5 meses**."* — a projeção de tempo usa
  `aporte_mensal_previsto_centavos` do plano; se esse campo estiver zerado,
  a frase cai para só o percentual atual, sem inventar uma projeção.

**A barra nunca vira vermelha por completo.** Isso substitui o antigo
"estado cruzou os 50%" do plano original: quando o veículo-alvo específico
desta seção se torna elegível, ele passa a fazer parte do bloco de veredito
(6.1) na próxima renderização, e a seção 6.2 recalcula para apontar ao
*próximo* veículo-alvo ainda não elegível (ou desaparece, se não houver
mais nenhum). A barra em si permanece sempre no vocabulário azul/progresso —
o vermelho como veredito vive inteiramente no bloco 6.1.

### A animação (uma vez por sessão)

Dispara na primeira renderização da barra em cada sessão do navegador: o
preenchimento cresce de `0%` até o valor real (ex.: `35,6%`) com uma curva
suave (~1,1s, `cubic-bezier(.22,.7,.3,1)`), como no mockup de referência —
não é uma barra que "pula" já preenchida. Renderizações subsequentes na
mesma sessão (voltar à tela, revalidação de dados) atualizam a largura sem
reanimar do zero, só fazem a transição do valor antigo para o novo.

A animação "orquestrada" de maior impacto — a que o plano original descrevia
como pulso + varredura de cor — passa a viver no **momento em que um
veículo entra ou sai do bloco de veredito** (6.1): quando a lista de
elegíveis ganha um item novo durante a sessão (sem reload), o card daquele
veículo entra no bloco vermelho com um leve highlight de borda (pulso único
de opacidade na borda esquerda de 3px, ~500ms), e não a barra inteira
mudando de cor — mantém a mesma ideia de "um único momento dramático", só
realocada para o elemento que de fato representa o veredito agora.

Toda animação é pulada (estado final aplicado direto) sob
`prefers-reduced-motion: reduce`. Fora desses dois momentos, a interface não
anima nada que não seja resposta direta a um toque/clique.

---

## 7. Sinalização de status sem depender só de cor

Pedido explícito do brief (extrato pensado para daltônicos) generalizado
para todo badge/status do sistema — forma + cor, nunca só cor:

| Status | Cor | Forma/ícone |
|---|---|---|
| Elegível / liberado | Vermelho | Círculo preenchido antes do texto |
| Em progresso / a financiar | Azul | Círculo com contorno (vazado) |
| Pendente / aguardando | Âmbar | Triângulo (⚠, sem preenchimento sólido) |
| Confirmado / concluído | Azul-claro | Check dentro de círculo |
| Rejeitado / falha | Âmbar (nunca vinho aqui — vinho é só ação destrutiva, não status) | X dentro de círculo |
| Destrutivo (ação, não status) | Contorno `#A31B2B` + ícone de alerta | Nunca preenchido |

**Formas mínimas confirmadas pelo mockup de referência** — para itens de
lista densa (linha de extrato, item de tabela admin) onde um badge completo
seria pesado demais, a marca de status colapsa para um indicador de 6×6px
antes do texto: **quadrado** para confirmado/informativo (azul-claro) e
**círculo** para pendente (âmbar). É a mesma lógica da tabela acima,
simplificada ao mínimo necessário para não competir com o valor monetário
ao lado (que é sempre o elemento de maior peso na linha).

---

## 8. Wireframes de conceito (ASCII)

### 8.1 Cliente — Dashboard (`/app`), desktop com sidebar

Substituído pelo layout validado no mockup de referência — sidebar +
bloco de veredito condicional (6.1) + barra do próximo objetivo (6.2) +
coluna lateral de acompanhamento, lado a lado em telas largas:

```
┌───────────┬──────────────────────────────────────────────────┐
│ [JJ] JJ   │ Olá, Ana                                          │
│  MOTORS   │ Plano CP-2025-0001 · ativo desde março de 2025    │
│           ├──────────────────────────────────────────────────┤
│ Início    │ ▌Você já pode comprar 2 carros            (6.1)   │
│┃Elegív. 2 │  [carro 1]        [carro 2]                       │
│ Estoque   │  [ Reservar um destes carros ]                    │
│ Extrato   │                                                    │
│ Meu plano │ Seu próximo objetivo                       (6.2)   │
│           │  Hyundai HB20 Comfort 1.0          R$ 68.900,00   │
│ ────────  │  Faltam para atingir os 50%                       │
│ Ana       │  R$ 9.950,00                                      │
│ Beatriz   │  ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░│░░░░░░░░░░░░░░░░░░░░░░░       │
│ Sair      │  Você tem R$ 24.500,00 (35,6%)...                 │
│           │                             ┌──────────────────┐  │
│           │                             │ Saldo acumulado  │  │
│           │                             │ R$ 24.500,00     │  │
│           │                             ├──────────────────┤  │
│           │                             │ Próximo aporte   │  │
│           │                             │ 10/set · em 1 dia│  │
│           │                             ├──────────────────┤  │
│           │                             │ Últimos aportes  │  │
│           │                             │ ▪ 10/ago R$2.000 │  │
│           │                             │ ▪ 10/jul R$2.000 │  │
│           │                             │ ● 08/jul R$500   │  │
│           │                             │ Ver extrato →... │  │
│           │                             └──────────────────┘  │
└───────────┴──────────────────────────────────────────────────┘
```

Em mobile (abaixo de 820px): sidebar vira header compacto + nav inferior;
o grid de duas colunas (progresso + coluna lateral) empilha em uma coluna,
nesta ordem: veredito → progresso → coluna lateral.

Mudança de conceito vs. hoje: hoje o dashboard mostra 4 cards soltos de
igual peso (saldo, %, elegíveis, vencimento), todos genéricos, nenhum
condicional. No novo conceito, o **veredito de elegibilidade** e o
**progresso rumo ao próximo objetivo** são as duas seções centrais e
literalmente mudam de forma (bloco vermelho vs. barra azul) — alinhado ao
princípio 2 ("a pergunta tem uma resposta, não uma tela"). Saldo,
vencimento e extrato recente viram a coluna de apoio, sempre presente mas
nunca competindo pelo primeiro olhar.

### 8.2 Cliente — Card de veículo no estoque (elegível vs. não)

```
 ELEGÍVEL                        NÃO ELEGÍVEL
┌──────────────────┐            ┌──────────────────┐
┃ [foto]           ┃            │ [foto]           │
┃ ●  Elegível      ┃            │ ○  Faltam        │
┃ Fiat Argo        ┃            │ Chevrolet Onix   │
┃ R$ 45.000,00     ┃            │ R$ 69.000,00     │
┗━━━━━━━━━━━━━━━━━━┛            │ R$ 4.200,00      │
 borda 3px vermelha              └──────────────────┘
 fundo vermelho-fundo             hairline simples,
                                  sem cor de destaque
```

O card elegível literalmente muda de silhueta (borda espessa + fundo
tingido), não só a cor de um badge — é o "distinguível a um metro de
distância" que o brief pede.

### 8.3 Cliente — Detalhe do veículo

```
┌─────────────────────────────┐
│                             │
│                             │
│      [FOTO FULL-BLEED]      │   <- sangra até a borda,
│                             │      sem texto sobre ela
│                             │
├─────────────────────────────┤   <- fim da foto, início do
│ ●  Elegível                 │      plano preto sólido
│ Fiat Argo · Drive 1.0       │
│ R$ 45.000,00                │
│                             │
│ Entrada (seu saldo)         │
│ R$ 24.500,00                │
│ A financiar                 │
│ R$ 20.500,00                │
│                             │
│ [Simular parcelas]          │
│ [ Reservar este veículo ]   │  <- botão primário vermelho
└─────────────────────────────┘
```

Mudança vs. hoje: hoje os dados de compra ficam misturados com a ficha
técnica (ano, km, cor...) em uma única `<dl>`. No novo conceito, ficha
técnica é secundária/colapsável; preço, entrada e financiamento têm sua
própria zona visual imediatamente abaixo da foto, sem concorrência.

### 8.4 Admin — Tabela densa (padrão para todas as listagens)

```
Cliente          Plano        Saldo          Status
─────────────────────────────────────────────────────
Ana Ribeiro      CP-2025-01   R$ 24.500,00   ● Ativo
─────────────────────────────────────────────────────  <- hairline,
Bruno Carvalho   CP-2025-02   R$ 16.500,00   ● Ativo       não zebra
─────────────────────────────────────────────────────     de fundo
Carla Dias       CP-2026-03   R$ 3.000,00    ● Ativo
─────────────────────────────────────────────────────
```

Zebra por hairline (linha completa a cada N registros com peso de borda
levemente maior), nunca por fundo alternado — preserva "preto permanece
preto" (seção 3) mesmo em tabela longa.

### 8.5 Admin — Ação destrutiva vs. primária lado a lado

```
[ Reservar veículo ]     ⚠ Cancelar plano
 preenchido vermelho      contorno #A31B2B + ícone,
 texto branco             texto branco, sem preenchimento
```

Testado deliberadamente lado a lado porque a seção 2 do brief trata
confundir os dois como bug — a diferença de peso visual (sólido vs.
contorno+ícone) precisa segurar sozinha, mesmo em grayscale.

---

## 9. Revisão do próprio plano

Rodada de autocrítica pedida explicitamente no brief — o que eu teria escrito
igual "para qualquer outro app" e o que mudei:

- **Descartei** uma primeira versão da escala tipográfica com 8 tamanhos
  (incluindo `display-lg`/`display-sm` separados). Reduzi para 6 porque dois
  tamanhos de display só existiam por hábito de escala tipográfica
  genérica — na prática este produto tem um único lugar por tela onde o
  "número que importa" aparece, então um único `display` basta e qualquer
  segundo uso do tamanho grande estaria brigando com ele por atenção.
- **Descartei** ícones de biblioteca genérica (Lucide) para os status da
  seção 7 e desenhei formas simples (círculo cheio, círculo vazado,
  triângulo, X) porque um ícone de "check" ou "warning" de biblioteca
  padrão é visualmente idêntico ao de qualquer outro dashboard SaaS — a
  forma geométrica pura amarra mais com a estética "painel de instrumentos"
  do resto do sistema.
- **Refiz** a barra de progresso duas vezes: a primeira versão fazia a
  transição de 50% com um confete/partícula (fade genérico de "conquista
  desbloqueada" de app consumer). Troquei pela varredura de cor
  azul→vermelho porque comunica *causa e efeito* (você passou de um estado
  para o outro, literalmente atravessando a linha), em vez de comemorar sem
  explicar o que mudou — mais alinhado ao tom "contido, exceto neste
  momento" do que um efeito de celebração importado de outro tipo de app.
- **Sinalizei explicitamente** (seção 2.3) que o vinho-contorno como
  especificado no brief falha o próprio piso de acessibilidade que o
  documento pede na seção 9 ("foco de teclado visível e com contraste
  real") — uma interface genérica teria implementado o valor literal do
  brief sem checar; aqui a checagem mudou a regra de aplicação sem mudar a
  intenção semântica.
- **Não** criei uma "vitrine" ou landing decorativa para a home pública
  (`/`) — o produto não vende a marca para visitante anônimo, vende para
  quem já é cliente ou já é operador. Um app genérico teria proposto um
  hero de marketing; aqui a tela de entrada é só o roteamento para login,
  como já é hoje.

---

## 10. Status da Fase 1 — aprovada

Um mockup HTML de referência (dashboard do cliente, desktop) foi produzido a
partir deste documento e aprovado como peça oficial de identidade — as
seções 5.1, 6.1, 6.2, 7 e 8.1 foram atualizadas para descrever exatamente a
arquitetura que ele implementa (sidebar de 232px também no cliente, bloco de
veredito e barra de progresso como seções coexistentes, não estados
alternativos). As decisões que seguem foram resolvidas com a aprovação:

1. **Vinho-contorno (seção 2.3):** `#A31B2B` para contorno destrutivo +
   ícone de alerta obrigatório; `#7A1420` reservado a preenchimento de área
   grande. **Confirmado.**
2. **Fonte:** Archivo + Archivo Expanded. **Confirmado**, sem contraproposta.
3. **Home pública (`/`):** mantida como tela técnica de roteamento, sem
   virar peça de landing/marketing. **Confirmado.**
4. **Ordem do menu do cliente:** Início · Elegíveis · Estoque · Extrato ·
   Meu plano, igual à ordem atual. **Confirmado** — refletida no mockup.
5. **Sidebar também na área do cliente** (não só single-column mobile):
   adotada por ser o que o mockup de referência implementa — decisão nova
   desta rodada, documentada na seção 5.1.

**Próximo passo: Fase 2 — fundação técnica.** Tokens em `app/globals.css`
como CSS custom properties, extensão de `tailwind.config.ts`, override do
tema shadcn/ui, fontes via `next/font`, e os componentes base redesenhados
(botão nas 4 variantes, input, select, badge de status, card, tabela, toast,
modal).
