# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Cliente** (uso principal, no celular): pessoa física que quer trocar de carro
mas não quer financiamento de banco. Faz aportes mensais na JJ Motors e
acompanha, do sofá, quanto já pode comprar. Baixa familiaridade com jargão
financeiro; alta ansiedade sobre "quando vou conseguir".

**Admin / CEO** (uso em PC): dono da revenda. Gerencia estoque, confirma
aportes, define taxa de juros, cadastra vendedores e cargos, acompanha caixa
e comissões.

**Vendedor** (uso em PC/celular): atende os clientes vinculados a ele. Vê as
negociações abertas pelos seus clientes e responde pelo WhatsApp. Tem
permissões concedidas pelo admin (ajustar estoque, ajustar juros, etc.)
conforme o cargo.

**Operador**: staff de confiança, acesso total como o admin, paralelo ao
sistema de cargos de vendedor.

## Product Purpose

Sistema web da JJ Motors para o programa de **Compra Programada**: o cliente
faz aportes mensais que viram crédito de compra; quando o saldo confirmado
atinge o percentual mínimo (padrão 50%) do preço de um veículo do estoque,
ele fica **elegível** para adquiri-lo — usa o saldo como entrada e financia o
restante em promissória direto com a revenda, sem banco.

Resolve dois problemas:
1. **Cruzamento estoque × saldo** — para cada cliente, o que ele já pode
   comprar agora e quanto falta para o resto do estoque.
2. **Notificação proativa via WhatsApp** — quando um veículo entra no estoque,
   tem o preço reduzido, ou casa com a preferência de um cliente, os
   interessados são avisados.

Sucesso = o cliente entende, sem ajuda, em que pé está ("faltam R$ X, ~N
meses") e o vendedor fecha a venda pelo WhatsApp a partir de uma negociação.

## Positioning

Não é um marketplace de carros nem um app de banco. É o **painel de
acompanhamento de um consórcio informal de revenda**: o único lugar que cruza,
em tempo real, o saldo acumulado de cada cliente contra o estoque real e diz
"você já pode levar este carro". O financiamento do restante é promissória da
própria loja (tabela Price, taxa definida pelo admin, global ou por cliente) —
nenhum banco na equação.

## Operating Context

- **Cliente**: abre no celular, algumas vezes por semana, geralmente logo
  depois de fazer o aporte do mês ou quando quer sonhar com um carro. Quer
  ver saldo, "o que já posso comprar", e "quanto falta pro próximo".
- **Onboarding**: na primeira vez, o cliente informa o carro desejado
  (marca/modelo do catálogo pré-fixado, ou texto livre) + valor-meta. Fica
  gravado como CRM; quando um carro assim entra no estoque, ele é avisado
  mesmo sem ter os 50%.
- **Negociação**: o cliente clica "Abrir negociação" num veículo (não trava o
  carro, vários clientes por veículo, não exige os 50%). O vendedor vinculado
  atende pelo WhatsApp (link wa.me). Fechar a venda gera a comissão.
- **Admin**: PC, sessão de trabalho. Confirma aportes com comprovante,
  cadastra veículos com fotos, ajusta preços (dispara notificação), gerencia
  catálogo de modelos, cargos e permissões.
- **Ledger append-only**: aporte confirmado nunca é editado — correção é
  estorno negativo. Saldo é sempre calculado, nunca denormalizado.

## Capabilities and Constraints

- **Papéis**: admin, operador, cliente, vendedor. RLS no banco em todas as
  tabelas — a barreira real de dados é a policy, não a UI.
- **Dinheiro**: sempre `bigint` em centavos. Formatação BRL só na fronteira
  de exibição.
- **Elegibilidade**: `saldo_confirmado >= round(preço × percentual_mínimo)`.
  Percentual configurável por plano (default 0.5).
- **Promissória**: tabela Price, `PMT = PV·i / (1−(1+i)^−n)`. Taxa mensal
  global (`configuracoes`) ou própria do plano.
- **Negociação**: enum `nova / em_andamento / fechada / perdida`. Fechar =
  veículo vendido + outras negociações do veículo encerradas + comissão
  pendente gerada (% do cargo do vendedor sobre o preço).
- **Notificações**: fila com dedupe `UNIQUE(cliente, veiculo, tipo)`. Canal
  WhatsApp. Envio real é Fase 6 (hoje provider `mock`).
- **Stack**: Next.js 15 App Router, TypeScript strict, Supabase (Postgres +
  Auth + Storage + RLS), Tailwind, Zod. SQL puro em migrations, sem ORM.
  Deploy Vercel + Supabase Cloud dedicado.
- **Undecided**: worker de envio de WhatsApp e cron de expiração/lembrete
  (Fase 6) não implementados.

## Brand Commitments

- **Nome**: JJ Motors — Compra Programada. Monograma "JJ".
- **Vermelho da marca (`#E10600` hoje) = veredito de elegibilidade**: acende
  quando o cliente já pode comprar. **Nunca é cor de erro.** Âmbar é aviso,
  vinho é destrutivo. Esta semântica é o que torna a interface desta empresa,
  não de uma fintech genérica — é o compromisso mais forte do redesign.
- **Barra de progresso rumo aos 50%**: elemento de destaque da tela do
  cliente. O dado grande é *quanto falta*, não a porcentagem.
- **Tema escuro.**
- **Português BR** com o vocabulário de domínio: aporte, Compra Programada,
  elegibilidade, negociação, promissória, veredito.
- **Mobile-first na área do cliente** (nav inferior); admin denso em PC.
- **Direção visual do redesign** (decidida com o usuário, 2026-09-10):
  *painel de controle automotivo moderno* — instrumentação digital de carro
  premium (Porsche Taycan, Polestar): mostradores precisos, tipografia
  técnica legível, gráficos de dado limpos, zero decoração. Futurista pela
  precisão, não pelo brilho. Explicitamente **não** "fintech Nubank/Stripe"
  (o lugar-comum que o redesign evita). DESIGN.md formaliza no fim do build.

## Evidence on Hand

- App real em produção: https://jj-motors.vercel.app (Supabase Cloud
  `mfsdgzrjkagrxcoerxpp`). 4 usuários de exemplo (senha `senha123`):
  `admin@jjmotors.local`, `cliente.ana@jjmotors.local` (já elegível p/ 2
  carros), `cliente.bruno@jjmotors.local` (faltam R$ 2.500), `cliente.carla`
  (recém-aderiu).
- Seed: 8 veículos (7 disponíveis + 1 vendido), ~20 aportes, 15 modelos no
  catálogo. Fotos são placeholders (`placehold.co`) — a JJ Motors fornece as
  reais.
- `design/IDENTIDADE.md` — histórico das direções v1 (painel industrial,
  rejeitada) e v2 (fintech, sendo substituída agora). Tratado como
  anti-referência, não autoridade.
- 36 testes Vitest (money, elegibilidade, promissória). Teste RLS com 20
  asserções.

## Product Principles

1. **O dado é o herói.** Saldo, quanto falta, o que já pode comprar — tudo
   mais serve a isso. Nada decora; tudo indica.
2. **Vermelho é permissão, não alarme.** A cor mais forte da interface
   celebra o cliente ter chegado lá.
3. **O cliente nunca deveria precisar perguntar "e agora?".** Todo estado
   diz o próximo passo (faltam R$ X, ~N meses; abra negociação; fale com um
   consultor).
4. **A barreira de dados é a RLS.** A UI só antecipa o erro; nunca é a
   proteção.
5. **Mobile-first para o cliente, denso para o admin.** São dois contextos
   de uso diferentes e o design respeita cada um.

## Accessibility & Inclusion

- Status sinalizado por **forma além de cor** (pensado para daltônicos):
  círculo cheio = elegível, círculo vazado = em progresso, triângulo = aviso,
  X = falha.
- Contraste WCAG AA verificado para todo texto contra o fundo.
- `prefers-reduced-motion` respeitado — animação de dado (barra de progresso)
  cai para o valor final sem movimento.
- Alvos de toque generosos na área do cliente (mobile).
