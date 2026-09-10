# Surface brief — Área do cliente + Painel admin (redesign completo)

## Escopo e modo

**Operate.** O visitante completa uma tarefa: o cliente checa "em que pé estou
e o que já posso comprar"; o admin gerencia estoque, aportes, negociações,
comissões. Redesign do app inteiro (~25 rotas, dois shells), não uma tela.

## Público, tarefa, restrições

- **Cliente** (celular, algumas vezes/semana, geralmente após o aporte): ver
  saldo, o que já pode comprar agora, quanto falta pro próximo carro, abrir
  negociação. Baixa familiaridade com jargão. Mobile-first, nav inferior.
- **Admin/operador** (PC, sessão de trabalho): tabelas densas, formulários,
  confirmar aporte com comprovante, ajustar preço, gerenciar catálogo/cargos.
- **Vendedor** (PC/celular): ver negociações dos seus clientes, atender por
  WhatsApp.
- Preservar: vermelho = veredito de elegibilidade (nunca erro), barra de
  progresso rumo aos 50%, tema escuro, português + termos do domínio,
  status por forma além de cor, RLS como barreira real.

## Direction contract

**THESIS.** A tela é a **instrumentação de bordo de um carro premium** —
mostradores que leem um único número com precisão absoluta, não um dashboard
de fintech com cards coloridos empilhados. O que a categoria sempre entrega e
que esta tela recusa: a grade de cards iguais (ícone + rótulo + número +
acento) e o template hero-metric (número gigante, rótulo pequeno, stats de
apoio). Recusa também o oposto previsível: o extrato bancário listado, linha
após linha sem hierarquia. Aqui há **um instrumento dominante por tela** e
tudo mais é telemetria subordinada.

**OWN-WORLD.** Fundo `#07090D` quase-preto com viés azul-frio (mais fundo que
o `#0A0E14` atual — instrumento de carro é lido no escuro). Superfícies não
são "cards" — são **mostradores**: painéis com moldura de 1px em branco 8%,
canto de raio 4px (técnico, não 16px fofo), e um leve gradiente radial interno
que simula vidro curvo de instrumento (`radial-gradient` do centro-topo,
branco 3% → transparente). Vermelho `#FF2A1A` (levemente mais quente e vivo
que `#E10600`) é a **agulha/luz de permissão** — aparece como preenchimento
sólido, glow curto (blur 12px, sem spread), e nunca como texto. Azul-ciano
`#4DD8FF` (trocado do `#5B9AFF` puro-azul para um ciano de HUD) é o traço de
progresso e todo dado financeiro secundário. Âmbar `#FFB020` = aviso.
Tipografia: **duas famílias** — display/números em uma face técnica de largura
condensada com numerais tabulares proeminentes (candidata: **Chakra Petch**
ou **Rajdhani** — geométrica, com corte técnico, sem ser mono-costume;
self-hosted via next/font Google), corpo em **Archivo** (mantida, workhorse
legível). Números grandes ganham `font-feature-settings: "tnum" 1` e um
sublinhado de agulha (linha de 2px vermelha OU ciano sob o valor, conforme o
veredito). Zero ícone decorativo; ícones só funcionais, traço 1.5px, de uma
lib (lucide). Grid: régua de 4px, colunas fluidas, medianiz generosa.
Movimento: **um** momento autorado — o preenchimento da agulha/barra sobe do
zero ao valor real na primeira carga da sessão, com `cubic-bezier(.16,1,.3,1)`
em ~900ms, e o glow vermelho pulsa uma vez quando o veredito "liberado"
aparece. Nada mais anima além de `transform`/`opacity`/`filter: blur` em
hover de linha e `:active` de botão (scale .97).

**STORY.** O cliente abre e em 2 segundos lê o instrumento dominante: se está
"liberado" (vermelho aceso: "você já pode levar N carros") ou "em rota" (agulha
ciano subindo: "faltam R$ X · ~N meses"). O olho desce para a telemetria:
saldo, próximo aporte, últimos lançamentos. Um toque leva a "Estoque" ou
"Abrir negociação". O admin abre e vê o painel de caixa como quatro
mostradores numa fileira, depois entra nas telas de gestão que são tabelas
densas legíveis com a mesma moldura técnica.

**FIRST VIEWPORT (cliente, 390px).** Topo: barra fina com monograma JJ +
"Olá, [nome]" à esquerda, sair à direita — 52px, moldura inferior 1px.
Abaixo, ocupando ~60% da altura visível: **o instrumento de veredito**. Se
elegível: painel com moldura vermelha 1px + glow, título "VOCÊ JÁ PODE LEVAR"
em corpo pequeno tracked, número do carro-count grande (face técnica, ~64px),
e até 2 carros elegíveis como linhas compactas (marca/modelo · sua entrada ·
a financiar) com seta. Se não elegível: **o mostrador de rota** — a barra de
progresso rumo aos 50% ocupando a largura, com "FALTAM" pequeno e o valor
grande em ciano logo acima da barra, e "~N meses no ritmo atual" abaixo.
Botão primário full-width vermelho "Abrir negociação" / "Ver estoque" fixado
logo após o instrumento. Abaixo da dobra: fileira de 2 mostradores pequenos
(saldo acumulado · próximo aporte) e a lista de últimos 3 lançamentos.
Nav inferior fixa: 6 itens, item ativo com traço vermelho de 2px acima.

**FIRST VIEWPORT (admin, 1440px).** Sidebar 232px à esquerda (moldura direita
1px, monograma no topo, nav com item ativo = faixa vermelha sutil + texto
branco). Conteúdo até 1240px. Dashboard: "PAINEL" como título, depois quatro
**mostradores** numa fileira (`grid-cols-4`, divididos por linha vertical 1px,
não cards separados): Total em caixa / Aportes do mês / Clientes ativos /
Veículos parados — cada um com rótulo pequeno tracked em cima e o número
grande na face técnica embaixo, "Veículos parados" em âmbar. Telas internas:
tabela densa com moldura técnica, cabeçalho tracked, zebra por hairline.

**FORM.** Instrumentação de bordo automotiva (Porsche Taycan / Polestar HMI).
Posição na lista ordenada: #1 (escolha travada pelo usuário — "painel de
controle automotivo moderno"). Sem seed (build code-led, sem geração de
imagem disponível — direção fixada pelo usuário, não sorteada).

**FINISH.** unreviewed and undocumented is unfinished; this build ends with
the finish review, the verdict, DESIGN.md, and every shipping raster carrying
its provenance
