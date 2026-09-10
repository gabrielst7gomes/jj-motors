# JJ Motors — Compra Programada

Sistema web da **JJ Motors** para o programa de **Compra Programada** de veículos:
o cliente faz aportes mensais que viram crédito de compra; quando o saldo atinge
o percentual mínimo do preço de um veículo do estoque, ele fica elegível para
adquiri-lo, usando o saldo como entrada e financiando o restante em promissória
pela própria revenda.

O sistema resolve dois problemas centrais:

1. **Cruzamento estoque × saldo** — para cada cliente, o que ele já pode comprar
   e quanto falta para o resto.
2. **Notificação proativa via WhatsApp** — quando um veículo entra no estoque ou
   tem o preço reduzido, todos os clientes que ficaram elegíveis são avisados.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript `strict` |
| Banco / Auth / Storage | Supabase (Postgres + RLS) |
| UI | Tailwind CSS + shadcn/ui |
| Validação | Zod + React Hook Form |
| Migrations | SQL puro em `supabase/migrations/` (sem ORM) |
| Testes | Vitest (regras de negócio puras) |
| Deploy | Vercel |

Detalhes e justificativas das decisões: [`docs/decisoes-tecnicas.md`](docs/decisoes-tecnicas.md).

---

## Estado do projeto

**Fase 1 — Fundação** (atual): scaffold, migrations completas com RLS, seed,
`.env.example`, este README. As telas e a lógica de negócio chegam nas fases
seguintes:

- Fase 2 — Núcleo de cálculo (`lib/money.ts`, `lib/elegibilidade.ts`, views, testes)
- Fase 3 — Autenticação e área do cliente
- Fase 4 — Painel admin (CRUD, upload, aportes, auditoria)
- Fase 5 — Reservas (RPC transacional, expiração via cron)
- Fase 6 — Notificações WhatsApp (provider, fila, worker, monitoramento)

---

## Setup local

### Pré-requisitos

- **Node.js ≥ 20** (testado com 24)
- **Docker Desktop** rodando — o Supabase local sobe Postgres, Auth, Storage e
  Studio em containers.
- **Supabase CLI** — `npm i -g supabase` ou <https://supabase.com/docs/guides/cli>.

### Passo a passo

```bash
# 1. Instalar dependências
npm install

# 2. Criar o .env a partir do exemplo
cp .env.example .env
#   Para desenvolvimento local os valores default do .env.example já funcionam:
#   URL/chaves do Supabase local são fixas em toda instalação do CLI.

# 3. Subir o Supabase local (Postgres, Auth, Storage, Studio)
npm run db:start
#   Studio:   http://127.0.0.1:54323
#   API:      http://127.0.0.1:54321
#   Inbucket (e-mails de teste): http://127.0.0.1:54324

# 4. Criar os usuários de exemplo no Auth (admin + 3 clientes)
#    Isso precisa vir ANTES do reset, porque o seed.sql referencia os UUIDs.
npm run db:seed-auth

# 5. Aplicar as migrations + rodar o seed de dados de domínio
npm run db:reset

# 6. (Opcional) Gerar os tipos TypeScript do schema
npm run db:types

# 7. Subir o Next.js
npm run dev
#    http://localhost:3000
```

> **Atalho:** `npm run setup` encadeia install → db:start → db:reset → db:seed-auth.
> Na primeira vez rode os passos 3–5 na ordem acima (seed-auth antes do reset).
> Depois disso, `npm run db:reset` sozinho re-aplica tudo (os usuários do Auth
> persistem entre resets, então não precisa repetir o passo 4).

### Usuários de exemplo

Todos com a senha definida em `SEED_USER_PASSWORD` (default `senha123`):

| Papel | E-mail | Observação |
|-------|--------|------------|
| admin | `admin@jjmotors.local` | acesso total ao `/admin` |
| cliente | `cliente.ana@jjmotors.local` | **Ana** — já elegível para ≥ 2 veículos |
| cliente | `cliente.bruno@jjmotors.local` | **Bruno** — falta R$ 2.500,00 para 1 veículo |
| cliente | `cliente.carla@jjmotors.local` | **Carla** — acabou de aderir |

O seed cria 8 veículos (7 disponíveis + 1 vendido), ~20 lançamentos no ledger e
15 modelos no catálogo de preferências (`catalogo_modelos`).

---

## Setup com projeto Supabase remoto (sem Docker)

Se você não puder rodar Docker localmente, use um projeto no
[supabase.com](https://supabase.com):

```bash
# vincular o repositório ao projeto remoto
supabase link --project-ref <SEU_PROJECT_REF>

# aplicar as migrations no remoto
supabase db push

# rodar o seed de dados de domínio no remoto (o seed.sql NÃO roda no db push)
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

No `.env`, aponte `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_DB_URL` para o projeto remoto (valores no
dashboard → Project Settings → API / Database). Depois:

```bash
npm run db:seed-auth   # cria os usuários no Auth remoto
```

---

## Scripts

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Next.js em desenvolvimento |
| `npm run build` | Build de produção |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (regras puras) |
| `npm run db:start` / `db:stop` | Sobe/derruba o Supabase local |
| `npm run db:reset` | Recria o banco: migrations + `seed.sql` |
| `npm run db:seed-auth` | Cria os usuários de exemplo no Auth |
| `npm run db:types` | Regera `lib/database.types.ts` do schema |

---

## Estrutura

```
app/                      App Router
  page.tsx                landing
  app/                    área do cliente  (/app)   — Fase 3
  admin/                  painel admin     (/admin) — Fase 4
  api/cron/               workers acionados pela Vercel Cron — Fases 5 e 6
lib/
  money.ts                formatBRL / parseBRL            (Fase 2)
  elegibilidade.ts        regra de elegibilidade pura     (Fase 2)
  promissoria.ts          simulação Tabela Price          (Fase 2)
  supabase/
    client.ts             browser client (anon, RLS)
    server.ts             server client  (anon, RLS)
    admin.ts              service_role — SÓ servidor/jobs
    middleware.ts         refresh de sessão + roteamento por papel
  whatsapp/
    provider.ts           interface WhatsAppProvider      (Fase 6)
components/ui/            shadcn/ui                        (Fases 3+)
supabase/
  config.toml             config do stack local
  migrations/             SQL versionado (uma preocupação por arquivo)
  seed.sql                dados de exemplo (domínio)
  tests/rls.test.sql      teste de isolamento entre clientes
scripts/
  seed-auth.ts            cria usuários de exemplo via Admin API
docs/
  decisoes-tecnicas.md    decisões e ambiguidades resolvidas
  templates-whatsapp.md   textos dos templates HSM a submeter à Meta
```

---

## Modelo de dados (resumo)

- **`profiles`** — extensão de `auth.users` (nome, CPF, telefone E.164, papel).
- **`planos`** — contrato de compra programada (código `CP-AAAA-NNNN`, percentual
  mínimo configurável, veículo-alvo opcional).
- **`aportes`** — ledger **append-only**. Estados `pendente → confirmado | rejeitado`.
  Só `confirmado` entra no saldo. Correção = `estorno` negativo.
- **`veiculos`** + `veiculo_fotos` + `veiculo_precos_historico` — estoque.
- **`reservas`** + `propostas` — funil de aquisição.
- **`catalogo_modelos`** — modelos pré-fixados (marca/modelo + faixa de anos),
  gerenciados no `/admin`. O cliente escolhe daqui (ou digita "outro") ao
  registrar o carro desejado.
- **`preferencias_veiculo`** — CRM do desejo do cliente. Quando um veículo com
  marca/modelo casando (ano na faixa) entra no estoque, dispara notificação
  `preferencia_disponivel` **mesmo sem o cliente ter os 50%** — ele pode
  antecipar aportes ou negociar entrada. Não duplica o aviso se o cliente já
  é elegível (aí recebe `novo_elegivel`).
- **`notificacoes`** — fila e histórico, com `UNIQUE (cliente_id, veiculo_id, tipo)`.
- **`audit_log`** — trilha de ações sensíveis.
- **`configuracoes`** — parâmetros globais (`percentual_padrao`, `horas_reserva`,
  `limite_notificacoes_dia`).

**Views:** `vw_saldo_cliente`, `vw_veiculos_publico`, `vw_elegibilidade` — todas
com `security_invoker = true` (respeitam a RLS das tabelas base).

### Teste de isolamento RLS

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql
```

Autentica como a cliente Ana e verifica que ela **não** lê nada do cliente Bruno,
não acessa a tabela `veiculos` diretamente, não insere aportes nem preferências
direto na tabela (só via RPC), lê o catálogo mas não o edita, e que a RPC
`definir_preferencia_veiculo` grava tanto texto livre quanto item do catálogo.
18 asserções.

---

## WhatsApp

A aplicação depende da interface `WhatsAppProvider` (`lib/whatsapp/provider.ts`),
nunca de um provedor concreto. A implementação é escolhida em runtime pela env
`WHATSAPP_PROVIDER`:

- `mock` — loga no console e grava no banco (desenvolvimento). **Default.**
- `meta` — WhatsApp Cloud API oficial da Meta (produção).

> ⚠️ **Mensagens proativas fora da janela de 24h exigem um template HSM aprovado
> pela Meta.** Todas as notificações deste sistema são proativas. Os textos que
> precisam ser submetidos estão em [`docs/templates-whatsapp.md`](docs/templates-whatsapp.md).

Um terceiro provider (Z-API / Evolution API) pode ser plugado implementando a
mesma interface — ver o `TODO` em `lib/whatsapp/provider.ts`.

---

## Deploy (Vercel)

1. Importar o repositório na Vercel.
2. Configurar as variáveis de ambiente (ver `.env.example`), apontando para um
   projeto Supabase de produção.
3. Os cron jobs (`vercel.json`) chamam `/api/cron/reservas` e
   `/api/cron/notificacoes` — proteja-os com `CRON_SECRET`.

---

## Nota de segurança — dependências

`npm audit` reporta advisories em `postcss` **empacotado pelo próprio Next.js
15.5** (`node_modules/next/node_modules/postcss`). São da etapa de build de CSS,
sem input controlado por atacante nesta aplicação. A única correção que o npm
oferece é atualizar para o Next 16, o que contraria o requisito de Next.js 15.
As dependências diretas do projeto estão sem advisories.
