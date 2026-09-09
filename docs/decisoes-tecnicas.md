# Decisões técnicas — JJ Motors: Compra Programada

Registro das decisões tomadas na Fase 1, com a justificativa. Serve de referência
para as fases seguintes.

## Ambiguidades do documento original e como foram resolvidas

| # | Tema | Decisão |
|---|------|---------|
| **A1** | Arredondamento de `ROUND(preco * percentual)` | **Half-up** (metade para cima) com aritmética inteira. Como o preço é sempre positivo, isso coincide com o `ROUND()` do Postgres (half-away-from-zero). A função SQL `public.meta_centavos()` e a futura função pura `lib/elegibilidade.ts` produzem exatamente o mesmo valor. |
| **A2** | Fórmula da promissória | **Tabela Price**: `PMT = PV · i / (1 − (1+i)^−n)`. Taxa default `0.02` (2% a.m.), configurável por proposta (`propostas.taxa_juros_mensal`). Cada parcela arredondada ao centavo; resíduo acumulado na última parcela. Implementação em `lib/promissoria.ts` (Fase 2). |
| **A3** | Notificação quando reserva expira | Tipo de notificação **próprio** `reaberto`. Assim o `UNIQUE (cliente_id, veiculo_id, tipo)` permite um re-alerta quando o veículo volta ao estoque, sem colidir com o `novo_elegivel` original. |
| **A4** | Seed de usuários no Auth | **Script TS** (`scripts/seed-auth.ts`) via Admin API (`service_role`) — cria admin + 3 clientes com UUID fixo e senha conhecida. O `seed.sql` cuida só das tabelas de domínio, referenciando esses UUIDs. |
| **A5** | `admin` vs `operador` | Ambos são **staff** para efeito de RLS (`public.is_staff()`), com acesso total. A distinção fica só no rótulo do painel. Diferenciação fina de permissão pode vir depois. |
| **A6** | Telefone | Validado como **E.164** (`^\+\d{10,15}$`) no banco (CHECK) e no Zod (Fase 3). Sem verificação de número de WhatsApp real. |
| **A7** | Storage buckets | Criados já na Fase 1: `comprovantes` (privado) e `veiculo-fotos` (público), com policies em `storage.objects`. Upload pela UI entra na Fase 4. |
| **A8** | Distribuição dos ~20 aportes | Ana já elegível para ≥ 2 veículos; Bruno a R$ 2.500 de 1 veículo; Carla recém-começou. Detalhes em `supabase/seed.sql`. |
| **A9** | Lint/format | ESLint flat config padrão do Next + Prettier com `prettier-plugin-tailwindcss`. |
| **A10** | Idioma | Domínio (tabelas, colunas, funções de negócio, rotas de UI) em **português**; utilitários/infra e palavras-chave em inglês; comentários em português. |

## Decisões de arquitetura

- **Sem ORM.** Migrations em SQL puro versionadas em `supabase/migrations/`, uma
  preocupação por arquivo (extensões, tabelas, guardas, views, RLS, RPC,
  triggers, storage).
- **Dinheiro = `bigint` em centavos** em todo lugar. Colunas com sufixo
  `_centavos`. Helpers `formatBRL` / `parseBRL` em `lib/money.ts` são a única
  fronteira com strings.
- **Saldo nunca é denormalizado.** É sempre a soma do ledger `aportes`, exposta
  pela view `vw_saldo_cliente`. O ledger é append-only, garantido por trigger
  (`aportes_bloqueia_mutacao`): aporte `confirmado`/`rejeitado` é imutável;
  correção só via lançamento de `estorno` negativo referenciando o original.
- **Elegibilidade em dois lugares que precisam concordar:** a view
  `vw_elegibilidade` e a função pura `lib/elegibilidade.ts` (Fase 2). A função
  SQL `meta_centavos()` é o ponto único da regra de arredondamento.
- **RLS em todas as tabelas, com `force row level security`.** Cliente lê só o que
  é seu; não escreve em nada (reserva será via RPC `criar_reserva`, com lock e
  revalidação server-side). Cliente vê estoque só pela view `vw_veiculos_publico`
  (sem `preco_custo`, `chassi`, `renavam`; placa mascarada; só
  `disponivel`/`reservado`).
- **`service_role` só no servidor.** `lib/supabase/admin.ts` importa
  `"server-only"` — o build quebra se for usado no client.
- **Notificações:** enfileiradas por trigger em `veiculos` (insert/update),
  com dedupe pelo `UNIQUE (cliente_id, veiculo_id, tipo)` + `ON CONFLICT DO
  NOTHING`. Rate-limit diário é responsabilidade do **worker** (cron), não do
  trigger, para não perder o registro na fila. Camada de provider plugável
  (`WhatsAppProvider`), selecionada por `WHATSAPP_PROVIDER`.
- **Crons na Vercel:** `/api/cron/reservas` (expiração, a cada 10 min) e
  `/api/cron/notificacoes` (worker de envio, a cada 5 min), protegidos por
  `CRON_SECRET`. Declarados em `vercel.json`.

## Fora de escopo (schema preparado, sem implementação)

Geração de contrato/promissória em PDF, gateway de pagamento/PIX automático,
assinatura eletrônica, app mobile nativo, consulta de score de crédito.
